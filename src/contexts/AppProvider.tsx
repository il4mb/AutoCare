import { initialState, reducer } from "@/reducer";
import { Action, State } from "@/types";
import { createContext, useContext, useReducer } from "react";

type Props = {
    children?: React.ReactNode
}
export default function AppProvider({ children }: Props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <Context.Provider value={{ state, dispatch }}>
            {children}
        </Context.Provider>
    )
}


type AppContextType = {
    state: State
    dispatch: React.Dispatch<Action>
}
const Context = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}