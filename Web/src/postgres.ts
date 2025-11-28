import { MikroORM, EntityManager  } from '@mikro-orm/postgresql';
import ormConfig from './orm.config';
import { Data } from './entities/Data';
import { createDiffieHellmanGroup } from 'crypto';

export async function writeAnalyticsData(payload: string) {
    try {
        const orm = await MikroORM.init(ormConfig);
        const em = orm.em.fork();

        const reading = em.create(Data, {
            payload
        });

        await em.persistAndFlush(reading) 
        console.log('Saved data to SQL database.')
    } catch (err) {
        console.log('Error sending payload to SQL database through ORM: ', err)
    }
    
}