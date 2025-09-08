const { EntitySchema } = require('typeorm');

const Character = new EntitySchema({
    name: 'Character',
    tableName: 'characters',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        name: {
            type: 'varchar',
            length: 255,
            nullable: false
        },
        height: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        mass: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        hair_color: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        skin_color: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        eye_color: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        birth_year: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        gender: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        homeworld: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        url: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP'
        },
        updated_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
        }
    }
});

module.exports = { Character };