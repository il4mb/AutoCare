import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { View } from "./View";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "./Button";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";

interface BluetoothConnectionProps {
}

export default function BluetoothConnection({ }: BluetoothConnectionProps) {

    const [connected, setConnected] = useState(false);
    const { colors } = useTheme();

    const actionColor = connected ? colors.success : colors.primary;
    const actionText = connected ? "Disconnect" : "Connect";
    const iconName = connected ? "bluetooth-connect" : "bluetooth-off";
    const bgColor = connected ? colors.success + "20" : colors.error + "20";

    const handlePress = () => {
        // Simulate Bluetooth connection toggle
        setConnected((prev) => !prev);
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.row}>
                <MaterialCommunityIcons name={iconName} size={24} color="#333" />
                <Text>
                    Bluetooth is {connected ? "connected" : "not connected"}.
                </Text>
            </View>
            <Pressable onPress={handlePress}>
                <Text style={{ color: actionColor }} type="smallBold">
                    {actionText}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        justifyContent: "space-between",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    }
})