import { MikroORM, EntityManager, EntityName } from '@mikro-orm/core';
import ormConfig from './orm.config';

let ORM_INSTANCE: MikroORM | null = null;

import { Operators } from './entities/Operators';
import { States } from './entities/States';
import { Machines } from './entities/Machines';
import { OperatorMachineRelation } from './entities/OperatorMachineRelation';
import { MachineStateRelation } from './entities/MachineStateRelation';
import { Alarms } from './entities/Alarms';
import { Recipes } from './entities/Recipes';
import { MachineTypes } from './entities/MachineTypes';

export const entityMap: Record<string, EntityName<any>> = {
    'operators': Operators,
    'states': States,
    'machines': Machines,
    'operator_machine_relation': OperatorMachineRelation,
    'machine_state_relation': MachineStateRelation,
    'alarms': Alarms,
    'recipes': Recipes,
};

export const lookupMetadata: Record<string, { entity: EntityName<any>, lookupField: string }> = {
    'operators': { entity: Operators, lookupField: 'name' },
    'states': { entity: States, lookupField: 'id' },
    'machines': { entity: Machines, lookupField: 'id' },
};

export async function initializeORM(): Promise<MikroORM> {
    if (ORM_INSTANCE) {
        console.log('[DB] MikroORM already initialized.');
        return ORM_INSTANCE;
    }

    try {
        console.log('[DB] Initializing MikroORM...');
        ORM_INSTANCE = await MikroORM.init(ormConfig);
        console.log('[DB] MikroORM successfully connected and initialized.');
        return ORM_INSTANCE;
    } catch (error) {
        console.error('[DB ERROR] Failed to initialize ORM/DB connection. Check host and credentials.');
        throw error;
    }
}

export function getEntityManager(): EntityManager {
    if (!ORM_INSTANCE) {
        throw new Error('[DB ERROR] MikroORM not initialized. Call initializeORM() first in your application startup code.');
    }
    return ORM_INSTANCE.em.fork();
}

export async function lookupValue(em: EntityManager, lookupTable: string, sourceValue: any): Promise<number | undefined> {
    const metadata = lookupMetadata[lookupTable];

    if (!metadata) {
        console.warn(`Lookup table ${lookupTable} not found in metadata.`);
        return undefined;
    }

    if (sourceValue === null || sourceValue === '') {
        console.log(`[LOOKUP] Skipping lookup for '${lookupTable}' as source value is empty/null.`);
        return undefined;
    }

    const Entity = metadata.entity;
    const lookupField = metadata.lookupField;

    const foundEntity = await em.findOne(Entity, { [lookupField]: sourceValue });

    return foundEntity ? (foundEntity as any).id : undefined;
}

export { ormConfig };
