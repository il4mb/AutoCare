import { useApp } from "@/contexts/AppProvider";
import i18n from "@/localization";
import { router } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { Button } from "./Button";
import { Text } from "./Text";

interface VehicleSuspensionProps {
    children?: React.ReactNode;
}

export default function VehicleSuspension({ children }: VehicleSuspensionProps) {
    const { state } = useApp();
    const vechicles = useMemo(() => state.vehicles, [state.vehicles]);
    const hasVehicles = vechicles.length > 0;

    const goToAddVehicle = () => router.push('/add-profile');

    if (!hasVehicles) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, gap: 20 }}>
                <Text type="title">
                    {i18n.t("vehicle.welcomeTitle")}
                </Text>
                <View>
                    <Text type="small" style={{ marginBottom: 12 }}>
                        {i18n.t("vehicle.welcomeDescription")}
                    </Text>
                    <Text type="small">
                        {i18n.t("vehicle.welcomeDescriptionAlt")}
                    </Text>
                    <Button
                        title={i18n.t("vehicle.addVehicle")}
                        onPress={goToAddVehicle}
                        style={{ marginTop: 16 }} />
                </View>
            </View>
        )
    }
    return children;
}