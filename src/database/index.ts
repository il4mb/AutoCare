import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Diagnose } from './model/Diagnose'
import migrations from './migrations'
import schema from './schema'

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'autocare',
    jsi: !!(globalThis as any).nativeCallSyncHook,
})

// Then, make a Watermelon database from it!
const db = new Database({
    adapter,
    modelClasses: [
        Diagnose,
    ],
})

export {
    db,
    Diagnose,
}

