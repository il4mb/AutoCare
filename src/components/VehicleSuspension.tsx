import { useApp } from "@/contexts/AppProvider";
import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { router } from "expo-router";

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
                    Selamat Datang di AutoCare
                </Text>
                <View>
                    <Text type="small" style={{ marginBottom: 12 }}>
                        Untuk memulai, silakan tambahkan kendaraan Anda di menu Garasi.
                    </Text>
                    <Text type="small">
                        Atau dengan menekan tombol di bawah ini:
                    </Text>
                    <Button
                        title="Tambah Kendaraan"
                        onPress={goToAddVehicle}
                        style={{ marginTop: 16 }} />
                </View>
            </View>
        )
    }
    return children;
}