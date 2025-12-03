import { Reference } from '@mikro-orm/core';
import {
    getEntityManager,
    lookupValue,
    entityMap
} from './db_service';

import { Machines } from './entities/Machines';

export async function writeAnalyticsData(payload: any) {
    console.log(`[DATA HANDLER] Starting processing for target: ${payload?.template_config?.target_table || 'Unknown'}`);

    let em = null;

    try {
        em = getEntityManager();

        const sqlConfig = payload.template_config;

        if (!sqlConfig || !sqlConfig.target_table) {
            console.error('Payload missing SQL configuration.');
            return;
        }

        const targetTable = sqlConfig.target_table;
        const Entity = entityMap[targetTable];

        if (!Entity) {
            console.error(`Unknown target table: ${targetTable}`);
            return;
        }

        const dataToInsert: Record<string, any> = {};

        for (const mapping of sqlConfig.mapping) {
            const sourceKey = mapping.source;
            const targetColumn = mapping.target_column;

            let value = payload[sourceKey] !== undefined ? payload[sourceKey] : payload.opcua_value;

            if (sourceKey === 'opcua_source_id') {
                const machineId = payload.machine_id;
                const machine = await em.findOneOrFail(Machines, machineId);
                dataToInsert[targetColumn] = Reference.create(machine);

            } else if (targetColumn.includes('time') || targetColumn.includes('on')) {
                dataToInsert[targetColumn] = new Date(payload.timestamp);

            } else if (mapping.lookup_table && mapping.lookup_table !== 'None') {
                const id = await lookupValue(em, mapping.lookup_table, value);

                if (id === undefined) {
                    if (value !== null && value !== undefined && value !== '') {
                        throw new Error(`[LOOKUP ERROR] Failed to find ID for '${mapping.lookup_table}' using value: ${value}. Missing dependency data or invalid value.`);
                    }
                    dataToInsert[targetColumn] = null;

                } else {
                    const LookupEntity = entityMap[mapping.lookup_table];
                    const lookupEntry = await em.findOneOrFail(LookupEntity, id);
                    dataToInsert[targetColumn] = Reference.create(lookupEntry);
                }

            } else {
                dataToInsert[targetColumn] = value;
            }
        }

        console.log(`[MikroORM] Attempting to insert into ${targetTable} with data:`);
        console.log(JSON.stringify(dataToInsert, (key, value) => {
             if (value && value.isInitialized && value.isInitialized()) {
                return `Reference(ID: ${value.id})`;
             }
             if (value instanceof Date) {
                 return value.toISOString();
             }
             return value;
        }, 2));

        const newEntry = em.create(Entity, dataToInsert);
        await em.persistAndFlush(newEntry);
        console.log(`[PostgreSQL] Saved new entry to ${targetTable}.`);

    } catch (err) {
        console.error(`Error processing analytics data for target table: ${payload?.template_config?.target_table}`);
        throw err;

    } finally {
        if (em) {
            em.clear();
        }
    }
}
