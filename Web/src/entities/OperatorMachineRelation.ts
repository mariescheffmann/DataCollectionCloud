import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { Operators } from './Operators';
import { Machines } from './Machines';

@Entity()
export class OperatorMachineRelation {

    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Operators, {nullable: true})
    operator_name!: Rel<Operators>;

    @ManyToOne(() => Machines, { fieldName: 'machine_id' })
    machine_id!: Rel<Machines>;

    @Property({ type: 'timestamptz' })
    start_time!: Date;

    @Property({ type: 'timestamptz', nullable: true })
    end_time!: Date;
}
