import { useApp } from "@/contexts/AppProvider";
import { View } from "./View";
import { useMemo } from "react";
import { Text } from "./Text";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CurrentVehicle() {

    const { colors } = useTheme();
    const { state } = useApp();
    const currentVehicle = useMemo(() => {
        if (!state.vehicles.length) return null;
        return state.vehicles.find(vehicle => vehicle.id === state.selectedVehicle) ?? null;
    }, [state.vehicles, state.selectedVehicle]);


    if (!currentVehicle) {
        return (
            <View style={{ padding: 16 }}>
                <Text type="small" style={{ color: colors.textSecondary }}>
                    Tidak ada kendaraan yang dipilih.
                </Text>
            </View>
        );
    }
    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            // padding: 16,
            // backgroundColor: colors.bgElement,
            // borderRadius: 14,
        }}>
            {/* <MaterialCommunityIcons name="car" size={24} color={colors.primary} /> */}
            <View>
                <Text type="smallBold">{currentVehicle.name}</Text>
                <Text type="small" style={{ color: colors.textSecondary }}>
                    {currentVehicle.model} - {currentVehicle.licensePlate}
                </Text>
            </View>
        </View>
    );
}