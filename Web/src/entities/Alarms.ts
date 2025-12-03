import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { Machines } from './Machines';

@Entity()
export class Alarms {

    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Machines, { fieldName: 'machine_id' })
    machine_id!: Rel<Machines>;

    @Property({ length: 255, nullable: true })
    description!: string;

    @Property({ type: 'timestamptz' })
    created_on!: Date;
}
