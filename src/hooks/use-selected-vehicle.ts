import { useApp } from "@/contexts/AppProvider";
import { useMemo } from "react";

export const useSelectedVehicle = () => {
    const { state } = useApp();
    const selectedVehicle = useMemo(() => {
        return state.vehicles.find(v => v.id === state.selectedVehicle);
    }, [state.vehicles, state.selectedVehicle]);

    return selectedVehicle;
}