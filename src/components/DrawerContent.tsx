import { useApp } from "@/contexts/AppProvider";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function DrawerContent() {

    const { state, dispatch } = useApp();
    const insets = useSafeAreaInsets();
    const vehicles = useMemo(() => state.vehicles, [state.vehicles]);

    return (
        <FlatList
            data={vehicles}
            keyExtractor={(vehicle) => vehicle.id}
            contentContainerStyle={[styles.listContent, {
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left + 14,
                paddingRight: insets.right + 14
            }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
                <View style={styles.titleContainer}>
                    <Image
                        source={require('@/assets/garage.png')}
                        style={styles.headerIcon}
                        contentFit="cover"
                        tintColor={"#fff"}
                    />
                    <Text style={styles.headerTitle}>
                        Garasi Saya
                    </Text>
                </View>
            )}
            renderItem={({ item }) => {
                const isSelected = state.selectedVehicle === item.id;

                return (
                    <Pressable style={[styles.vehicleCard]}
                        onPress={() => dispatch({ type: 'SET_VEHICLE', payload: { id: item.id } })}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.vehicleName}>
                                {item.name}
                            </Text>
                            <Text style={styles.vehicleEngine}>
                                Engine: {item.engine}
                            </Text>
                        </View>
                        <View style={styles.radioContainer}>
                            {isSelected ? (
                                <FontAwesome6 name="circle-check" size={20} color="#0252ff" />
                            ) : (
                                <View style={styles.radioUnselected} />
                            )}
                        </View>
                    </Pressable>
                );
            }}
        />
    );
}


const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    headerIcon: {
        width: 22,
        height: 22,
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    vehicleName: {
        fontSize: 16,
        lineHeight: 18,
        color: '#fff',
    },
    vehicleEngine: {
        fontSize: 13,
        color: '#8e8e93',
    },
    radioContainer: {
        marginLeft: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioUnselected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3a3b46',
    }
});