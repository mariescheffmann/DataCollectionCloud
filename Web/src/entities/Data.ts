import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Data {
    // @PrimaryKey()
    // id!: number;

    // @Property()
    // topic!: string;

    @Property()
    payload!: string;
}