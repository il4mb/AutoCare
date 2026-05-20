import { ThemeColor } from "./constants/theme"

declare global {
    namespace ReactNavigation {

        interface Theme {
            colors: {
                [key in ThemeColor]: string
            }
            fonts: ThemeFonts
        }
    }
}

type Vehicle = {
    id: string
    name: string
    year: number
    model: string
    licensePlate: string
    fuelType: string
}

type Diagnostic = {
    dtc: string
    date: string
}

/** Global state of the editor */
export interface State {
    // diagnostics: Diagnostic[]
}

/** Mapping of action types to their payloads */
export type ActionMap = {
    SET_VEHICLE: { id: string }
}

/** Union of all possible editor actions */
export type Action = {
    [Key in keyof ActionMap]: [ActionMap[Key]] extends [never]
    ? { type: Key }
    : undefined extends ActionMap[Key]
    ? { type: Key; payload?: ActionMap[Key] }
    : { type: Key; payload: ActionMap[Key] }
}[keyof ActionMap]
