import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { States } from './States';
import { Machines } from './Machines';

@Entity()
export class MachineStateRelation {

    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Machines, {fieldName: 'machine_id'})
    machine_id!: Rel<Machines>;

    @ManyToOne(() => States, {fieldName: 'state_id'})
    state_id!: Rel<States>;

    @Property({ type: 'timestamptz' })
    start_time!: Date;
}
