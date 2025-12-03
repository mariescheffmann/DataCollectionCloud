import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class States {

    @PrimaryKey()
    id!: number;

    @Property({unique: true, length: 355})
    description!: string;
}
