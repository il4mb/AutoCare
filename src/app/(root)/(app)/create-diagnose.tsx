import BluetoothPickerButton from "@/components/BluetoothPickerButton";
import BluetoothScannerModal from "@/components/BluetoothScannerModal";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useRef, useState } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "@/components/Button";


type DiagnoseData = {
    model: string;
    connection: {
        name: string | null;
        address: string | null;
    };
}

export default function DiagnoseScreen() {

    const bt = useBluetooth();
    const blurTargetRef = useRef<View | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [data, setData] = useState<DiagnoseData>({
        model: '',
        connection: {
            name: null,
            address: null,
        }
    });

    const updateData = (field: string, value: string) => {
        setData(prev => ({
            ...prev,
            [field]: value,
        }));
    }

    const handleSelectDevice = (address: string, name: string) => {
        setData(prev => ({
            ...prev,
            connection: {
                name,
                address,
            }
        }));
        setModalVisible(false);
    }

    return (
        <ScreenLayout applyInsets>
            <View style={{ flex: 1 }} ref={blurTargetRef}>
                <View>
                    <Text type="title">Diagnosa Baru</Text>
                </View>
                {/* <View>
                    <BluetoothPickerButton
                        name={data.connection.name || undefined}
                        address={data.connection.address || undefined}
                        onPress={() => setModalVisible(true)}
                    />
                </View> */}
                {!bt.enabled && (
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 22,
                    }}>
                        <View style={{ justifyContent: "center", alignItems: "center", gap: 8 }}>
                            <MaterialCommunityIcons name="bluetooth-off" size={48} color="#888" />
                            <Text>Bluetooth tidak aktif.</Text>
                        </View>
                        <Text>Silakan aktifkan Bluetooth untuk melanjutkan.</Text>
                        <Button title="Aktifkan Bluetooth" onPress={() => bt.requestEnable()} style={{ marginTop: 12 }} />
                    </View>
                )}
            </View>


        </ScreenLayout>
    );
}