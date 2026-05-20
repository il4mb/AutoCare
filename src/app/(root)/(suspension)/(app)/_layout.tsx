import BluetoothConnection from "@/components/BluetoothConnection";
import CurrentVehicle from "@/components/CurrentVehicle";
import Drawer from "@/components/Drawer";
import { View } from "@/components/View";
import { Tabs } from 'expo-router';
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {

    const insets = useSafeAreaInsets();

    return (
        <Drawer>
            <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 16 }]}>
                <BluetoothConnection />
                <CurrentVehicle />
            </View>
            <Tabs screenOptions={{ headerShown: false }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Metrik',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="sine-wave" color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="diagnose"
                    options={{
                        title: 'Diagnosa',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="wrench" color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Pengaturan',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cog" color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>
        </Drawer>
    );
}


const styles = StyleSheet.create({
    container: {
        gap: 12
    }
})