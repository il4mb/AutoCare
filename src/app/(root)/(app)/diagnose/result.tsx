import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { BluetoothDevice } from "react-native-bluetooth-classic";
import { useLocalSearchParams, useRouter } from "expo-router";


export default function ResultScreen() {
    const { dtc, model } = useLocalSearchParams<{ dtc: string, model?: string }>();
    const dtcCodes = useMemo<string[]>(() => {
        try {
            return JSON.parse(dtc);
        } catch (error) {
            console.error("Gagal parsing DTC:", error);
            return [];
        }
    }, [dtc]);

    return (
        <ScreenLayout>

        </ScreenLayout>
    );
}