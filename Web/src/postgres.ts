import { MikroORM, EntityManager  } from '@mikro-orm/postgresql';
import ormConfig from './orm.config';
import { Operators } from './entities/Operators';

export async function writeAnalyticsData(payload: string) {
    try {
        const orm = await MikroORM.init(ormConfig);
        const em = orm.em.fork();

        const reading = em.create(Operators, {
            name: payload
        });

        await em.persistAndFlush(reading) 
        console.log('Saved data to SQL database.')

        const found = await em.find(Operators, {});
        console.log(`All entries in Operators table:`, found);
    } catch (err) {
        console.log('Error sending payload to SQL database through ORM: ', err)
    }
    
}