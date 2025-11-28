import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Operators {
    
    @PrimaryKey()
    name!: string;
}