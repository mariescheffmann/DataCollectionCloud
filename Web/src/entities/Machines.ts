import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import {MachineTypes} from './MachineTypes';

@Entity()
export class Machines {

    @PrimaryKey()
    id!: number;

    @ManyToOne(() => MachineTypes)
    type_id!: Rel<MachineTypes>;
}
