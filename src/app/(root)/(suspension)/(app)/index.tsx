import { View } from '@/components/View';
import { Text } from '@/components/Text';
import ScreenLayout from '@/components/ScreenLayout';
import BluetoothConnection from '@/components/BluetoothConnection';
import CurrentVehicle from '@/components/CurrentVehicle';

export default function HomeScreen() {
    return (
        <ScreenLayout applyInsets>
            <View style={{ flex: 1, gap: 16 }}>

                
                <View style={{
                    padding: 16,
                }}>
                    <Text type="smallBold" style={{ marginBottom: 8 }}>
                        Riwayat Diagnosa
                    </Text>
                    <Text type="small" style={{ color: '#888' }}>
                        Belum ada riwayat diagnosa.
                    </Text>
                </View>
            </View>
        </ScreenLayout>
    )
}