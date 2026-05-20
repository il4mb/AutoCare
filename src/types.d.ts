type Vehicle = {
    id: string
    engine: string
    name: string
}

/** Global state of the editor */
export interface State {
    vehicles: Vehicle[]
    selectedVehicle: string | null
}

/** Mapping of action types to their payloads */
export type ActionMap = {
    SAMPLE: { id: string }
}

/** Union of all possible editor actions */
export type Action = {
    [Key in keyof ActionMap]: [ActionMap[Key]] extends [never]
    ? { type: Key }
    : undefined extends ActionMap[Key]
    ? { type: Key; payload?: ActionMap[Key] }
    : { type: Key; payload: ActionMap[Key] }
}[keyof ActionMap]
