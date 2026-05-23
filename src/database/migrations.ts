import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'diagnoses',
                    columns: [
                        { name: 'codes', type: 'string' },
                        { name: 'model', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
    ],
})