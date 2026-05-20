import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { useApp } from "@/contexts/AppProvider";
import { Fonts } from "@/constants/theme"; // Assuming you have this exported

export default function DrawerScreen() {
    const { state, dispatch } = useApp(); // Assuming you have a dispatch or setter to change vehicles
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const vehicles = useMemo(() => state.vehicles, [state.vehicles]);

    const closeDrawer = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <View style={[styles.container, {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right
        }]}>
            {/* Header Area */}
            <View style={styles.header}>
                <Pressable
                    onPress={closeDrawer}
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <FontAwesome6 name="chevron-left" size={16} color="#fff" />
                </Pressable>

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
            </View>

            {/* Vehicles List */}
            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isSelected = state.selectedVehicle === item.id;

                    return (
                        <Pressable
                            style={[
                                styles.vehicleCard,
                                isSelected && styles.vehicleCardSelected
                            ]}
                        // onPress={() => dispatch({ type: 'SET_VEHICLE', payload: item.id })}
                        >
                            <View style={styles.cardInfo}>
                                <Text style={styles.vehicleName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.vehicleEngine}>
                                    Engine: {item.engine}
                                </Text>
                            </View>

                            {/* Active State Indicator */}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0e15',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1c1d26',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2c2d36',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerIcon: {
        width: 22,
        height: 22,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.semiBold, // Adjust to your theme's font weight
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
        backgroundColor: '#1c1d26',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2c2d36',
    },
    vehicleCardSelected: {
        borderColor: '#0252ff',
        backgroundColor: 'rgba(2, 82, 255, 0.05)', // Subtle blue tint behind the selected car
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    vehicleName: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#fff',
    },
    vehicleEngine: {
        fontSize: 13,
        fontFamily: Fonts.regular,
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