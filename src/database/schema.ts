import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { Diagnose } from './model/Diagnose'

export default appSchema({
    version: 2,
    tables: [
        tableSchema({
            name: Diagnose.table,
            columns: [
                { name: "uid", type: "string", isIndexed: true },
                { name: "codes", type: "string" },
                { name: "model", type: "string", isOptional: true },
                { name: "description", type: "string" },
                { name: "symptoms", type: "string" },
                { name: "causes", type: "string" },
                { name: "solutions", type: "string" },
                { name: "created_at", type: "number" },
            ],
        })
    ]
})