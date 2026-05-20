import { StyleSheet, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "./Text";

interface ConnectionFieldProps {
    deviceName?: string | null;
    deviceAddress?: string | null;
    onPress: () => void;
}

export default function ConnectionField({ deviceName, deviceAddress, onPress }: ConnectionFieldProps) {
    const isConnected = !!deviceAddress;

    return (
        <Pressable
            style={[styles.container, isConnected && styles.containerConnected]}
            onPress={onPress}>
            <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                    name={isConnected ? "bluetooth-connect" : "bluetooth"}
                    size={24}
                    color={isConnected ? "#fff" : "#0252ff"}
                />
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.title, isConnected && styles.textWhite]}>
                    {isConnected ? deviceName : "Koneksi Bluetooth"}
                </Text>
                <Text style={[styles.subtitle, isConnected && styles.textWhite]}>
                    {isConnected ? deviceAddress : "Ketuk untuk mencari atau input manual"}
                </Text>
            </View>
            <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={isConnected ? "#fff" : "#999"}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 16,
        borderRadius: 12,
    },
    containerConnected: {
        backgroundColor: "#0252ff",
        borderColor: "#0252ff",
    },
    iconWrapper: { marginRight: 16 },
    textWrapper: { flex: 1 },
    title: { fontSize: 16, fontWeight: "bold", color: "#333" },
    subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
    textWhite: { color: "#fff" },
});