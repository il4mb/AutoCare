import BluetoothPickerButton from "@/components/BluetoothPickerButton";
import BluetoothScannerModal from "@/components/BluetoothScannerModal";
import { Button } from "@/components/Button";
import ScreenLayout from "@/components/ScreenLayout";
import { SelectField } from "@/components/SelectField";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { BlurTargetView } from "expo-blur";
import { Stack } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AddProfileScreen() {

    // Reference untuk BlurView Dimezis
    const blurTargetRef = useRef<View | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [data, setData] = useState({
        vehicleName: '',
        manufactureYear: '',
        model: '',
        fuelType: '',
        licensePlate: '',
        connection: {
            deviceName: null as string | null,
            deviceAddress: null as string | null,
        }
    })


    const updateData = useCallback((field: string, value: string) => {
        setData(prev => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleSelectDevice = useCallback((address: string, name: string) => {
        setData(prev => ({
            ...prev,
            connection: {
                deviceName: name,
                deviceAddress: address,
            }
        }));
        setModalVisible(false);
    }, []);

    const handleSaveProfile = useCallback(() => {

    }, [data]);

    return (
        <ScreenLayout header={{ title: "Tambah Kendaraan" }}>
            <View style={styles.container}>
                <Stack.Screen options={{ headerTitle: "Tambah Kendaraan" }} />
                <BlurTargetView ref={blurTargetRef} style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.sectionTitle}>Koneksi Perangkat</Text>
                        <BluetoothPickerButton
                            name={data.connection.deviceName ?? undefined}
                            address={data.connection.deviceAddress ?? undefined}
                            onPress={() => setModalVisible(true)}
                        />
                        <View style={styles.formArea}>
                            <TextField
                                label="Nama Kendaraan"
                                placeholder="Masukkan nama kendaraan"
                                style={{ width: "100%" }}
                                value={data.vehicleName}
                                onChangeText={(value) => updateData("vehicleName", value)}
                            />
                            <TextField
                                label="Tahun Pembuatan"
                                placeholder="Masukkan tahun pembuatan"
                                style={{ width: "100%" }}
                                value={data.manufactureYear}
                                onChangeText={(value) => updateData("manufactureYear", value)}
                            />
                            <TextField
                                label="Model"
                                placeholder="Masukkan model kendaraan"
                                style={{ width: "100%" }}
                                value={data.model}
                                onChangeText={(value) => updateData("model", value)}
                            />
                            <TextField
                                label="Nomor Polisi"
                                placeholder="Masukkan nomor polisi"
                                style={{ width: "100%" }}
                                value={data.licensePlate}
                                onChangeText={(value) => updateData("licensePlate", value)}
                            />
                            <SelectField
                                label="Bahan Bakar"
                                placeholder="Pilih jenis bahan bakar"
                                value={data.fuelType}
                                options={[
                                    { label: "Bensin", value: "bensin" },
                                    { label: "Diesel", value: "diesel" },
                                    { label: "Listrik", value: "listrik" },
                                    { label: "Hybrid", value: "hybrid" },
                                ]}
                                onValueChange={(value) => updateData("fuelType", value)}
                            />
                            <Button
                                title="Simpan Profil"
                                onPress={handleSaveProfile} />
                        </View>
                    </ScrollView>
                </BlurTargetView>
                <BluetoothScannerModal
                    visible={modalVisible}
                    blurTargetRef={blurTargetRef}
                    onClose={() => setModalVisible(false)}
                    onSelect={handleSelectDevice}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    formArea: {
        marginTop: 20,
        gap: 16,
    }
})