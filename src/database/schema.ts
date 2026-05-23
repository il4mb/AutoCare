import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { Diagnose } from './model/Diagnose'

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: Diagnose.table,
            columns: [
                { name: "uid", type: "string", isIndexed: true },
                { name: "code", type: "string" },
                { name: "description", type: "string" },
                { name: "symptoms", type: "string" },
                { name: "causes", type: "string" },
                { name: "solutions", type: "string" },
                { name: "created_at", type: "number" },
            ],
        })
    ]
})