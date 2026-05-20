import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useTheme } from "@react-navigation/native";
import { useCallback } from "react";

interface ConnectionFieldProps {
    name?: string;
    address?: string;
    connected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export default function ConnectionBadge({ name, address, connected = false, disabled, loading, onConnect, onDisconnect }: ConnectionFieldProps) {

    const { colors } = useTheme();
    const textColor = connected ? "#fff" : "#333";

    const canConnect = !connected && !disabled && onConnect;
    const canDisconnect = connected && onDisconnect;
    const canAction = canConnect || canDisconnect;

    const handlePress = useCallback(() => {
        if (canConnect) {
            onConnect?.();
        } else if (canDisconnect) {
            onDisconnect?.();
        }
    }, [canConnect, canDisconnect, onConnect, onDisconnect]);


    return (
        <View
            style={[styles.container, {
                backgroundColor: connected ? colors.primary : colors.bgElement,
                borderColor: connected ? colors.primary : colors.border,
            }]}>
            <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                    name={connected ? "bluetooth-connect" : "bluetooth-off"}
                    size={24}
                    color={connected ? colors.textInverted : colors.text + '80'}
                />
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.title, connected && styles.textWhite]}>
                    {name || "Unknown Device"}
                </Text>
                <Text style={[styles.subtitle, connected && styles.textWhite]}>
                    {address || "No address"}
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : canAction && (
                <Pressable onPress={handlePress} disabled={!canConnect && !canDisconnect}>
                    <Text style={[styles.actionText, { color: connected ? colors.textError : colors.primary }]}>
                        {connected ? "Putuskan" : "Hubungkan"}
                    </Text>
                </Pressable>
            )}
        </View>
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
    iconWrapper: { marginRight: 16 },
    textWrapper: { flex: 1 },
    title: { fontSize: 16, fontWeight: "bold", color: "#333" },
    subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
    textWhite: { color: "#fff" },
    actionText: {
        fontWeight: "bold",
        fontSize: 14,
    },
});