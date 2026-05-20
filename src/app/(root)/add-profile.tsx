import BluetoothScannerModal from "@/components/BluetoothScannerModal";
import ConnectionField from "@/components/ConnectionField";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { BlurTargetView } from "expo-blur";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AddProfileScreen() {
    // Reference untuk BlurView Dimezis
    const blurTargetRef = useRef<View | null>(null);

    // State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);
    const [selectedDeviceAddress, setSelectedDeviceAddress] = useState<string | null>(null);

    const handleSelectDevice = (address: string, name: string) => {
        setSelectedDeviceAddress(address);
        setSelectedDeviceName(name);
        setModalVisible(false);
    };

    return (
        <ScreenLayout header={{ title: "Tambah Kendaraan" }}>
            <View style={styles.container}>
                <Stack.Screen options={{ headerTitle: "Tambah Kendaraan" }} />
                <BlurTargetView ref={blurTargetRef} style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.sectionTitle}>Koneksi Perangkat</Text>
                        <ConnectionField
                            deviceName={selectedDeviceName}
                            deviceAddress={selectedDeviceAddress}
                            onPress={() => setModalVisible(true)}
                        />
                        <View style={styles.dummyFormArea}>
                            <Text style={{ color: '#999' }}>Sisa form ada di sini...</Text>
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
        // color: '#333',
    },
    dummyFormArea: {
        marginTop: 24,
        padding: 20,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center'
    }
})