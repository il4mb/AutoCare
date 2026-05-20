import { Action, State } from "./types";
export const initialState: State = {
    vehicles: [
        // {
        //     id: '1',
        //     name: 'Honda Accord 2018',
        //     year: 2018,
        //     model: 'Accord',
        //     licensePlate: 'B 1234 XYZ',
        //     fuelType: 'Gasoline'
        // },
        // {
        //     id: '2',
        //     name: 'Toyota Camry 2020',
        //     year: 2020,
        //     model: 'Camry',
        //     licensePlate: 'B 5678 ABC',
        //     fuelType: 'Gasoline'
        // }
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