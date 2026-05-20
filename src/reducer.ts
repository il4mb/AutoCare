import { Action, State } from "./types";
export const initialState: State = {
    vehicles: [
        {
            id: '1',
            name: 'Honda Accord 2018',
            engine: '2.0L I4'
        },
        {
            id: '2',
            name: 'Toyota Camry 2020',
            engine: '2.5L I4'
        }
    ],
    selectedVehicle: '1'
}

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'SET_VEHICLE':
            return {
                ...state,
                selectedVehicle: action.payload.id
            }
        default:
            return state;
    }
}