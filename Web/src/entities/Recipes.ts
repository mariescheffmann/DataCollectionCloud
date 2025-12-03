import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { Machines } from './Machines';
import { MachineTypes } from './MachineTypes';

@Entity()
export class Recipes {

    @PrimaryKey()
    id!: number;

    @Property({ unique: true, nullable: true })
    recipe_name!: string;

    @ManyToOne(() => Machines, { fieldName: 'machine_id' })
    machine_id!: Rel<Machines>;

    @Property({ nullable: true })
    decoration?: string;

    @Property({ nullable: true })
    g_number?: string;

    @Property({ nullable: true })
    material_id?: string;

    @Property({ nullable: true })
    stage?: string;

    @Property({ nullable: true })
    recipe_version?: string;
}
