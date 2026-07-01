import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import { useApp } from "@/contexts/AppProvider";
import { db } from "@/database";
import { Diagnose } from "@/database/model/Diagnose";
import i18n from "@/localization";
import { Q } from "@nozbe/watermelondb";
import { Text } from "../Text"; // Sesuaikan path ini dengan struktur folder Anda
import SwipableCard from "../SwipableCard";

export default function DiagnoseList() {
    const { auth } = useApp();
    const { colors } = useTheme();
    const router = useRouter();

    // State untuk menyimpan data dari WatermelonDB
    const [diagnoses, setDiagnoses] = useState<Diagnose[]>([]);

    useEffect(() => {
        const collection = db.get<Diagnose>(Diagnose.table);

        // Memantau perubahan tabel Diagnose secara real-time
        // Jika Anda mengatur Q.sortBy di skema, tambahkan: .query(Q.sortBy('created_at', Q.desc))
        const subscription = collection.query(
            Q.sortBy('created_at', Q.asc),
            Q.where('uid', auth?.id || '')
        ).observe().subscribe((records) => {
            // Kita balik urutannya (reverse) agar data terbaru berada di posisi paling atas
            setDiagnoses([...records].reverse());
        });

        return () => subscription.unsubscribe();
    }, []);

    const gotoCreateDiagnose = () => router.push('/diagnose');

    // Arahkan ke halaman ResultScreen dengan membawa ID diagnosa
    const gotoDetail = (id: string) => {
        router.push(`/diagnose/result?id=${id}`);
    };

    const onDeleteStart = async (id: string) => {
        return new Promise<void>((resolve) => {

            const handleDelete = async () => {
                setTimeout(() => {
                    db.write(async () => {
                        const record = await db.get<Diagnose>(Diagnose.table).find(id);
                        await record.markAsDeleted(); // Tandai sebagai dihapus (soft delete)
                    });
                    resolve();
                }, 300);
            }

            Alert.alert(
                'Are You Sure?',
                'Are you sure delete this record, this action cannot be undone!',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            resolve()
                        }
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: handleDelete
                    }
                ]
            );
        });
    };

    // --- RENDER KARTU ITEM ---
    const renderItem = ({ item }: { item: Diagnose }) => {
        // Parsing data dari database
        const codes = item.codes ? item.codes.split(',').filter(Boolean) : [];
        const modelName = item.model?.name || i18n.t("vehicle.currentVehicleFallback");

        // Format Tanggal (Contoh: 24 Mei 2026, 14:30)
        const dateString = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
            : "Tanggal tidak diketahui";

        return (
            <SwipableCard
                startAction={{
                    label: i18n.t("common.delete"),
                    onInvoke: async () => onDeleteStart(item.id),
                    color: '#ef4444', // Merah 500
                }}>
                <Pressable
                    style={styles.card}
                    onPress={() => gotoDetail(item.id)}>
                    <View style={styles.cardHeader}>
                        <View style={styles.modelInfo}>
                            <MaterialCommunityIcons name="car-info" size={20} color="#0252ff" />
                            <Text style={styles.modelNameText}>{modelName}</Text>
                        </View>
                        <Text style={styles.dateText}>{dateString}</Text>
                    </View>

                    <View style={styles.codesWrapper}>
                        {codes.length > 0 ? (
                            codes.map((code) => (
                                <View key={code} style={styles.codeBadge}>
                                    <Text style={styles.codeText}>{code}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.codeBadge, styles.healthyBadge]}>
                                <Text style={styles.healthyText}>{i18n.t("diagnose.healthyBadge")}</Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </SwipableCard>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={diagnoses}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Pressable
                style={[styles.fab, { backgroundColor: colors.primary || '#0252ff' }]}
                onPress={gotoCreateDiagnose}>
                <FontAwesome6
                    name="plus"
                    size={22}
                    color={colors.textInverted || '#ffffff'}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 80, // Memberi ruang agar item terbawah tidak tertutup tombol FAB
        gap: 16, // Jarak antar kartu (berlaku di React Native versi baru)
    },
    // --- KARTU DIAGNOSA ---
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16, // Fallback jika 'gap' tidak didukung
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modelNameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    // --- BADGE DTC ---
    codesWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    codeBadge: {
        backgroundColor: '#fee2e2', // Red 100
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    codeText: {
        color: '#b91c1c', // Red 700
        fontSize: 13,
        fontWeight: 'bold',
    },
    healthyBadge: {
        backgroundColor: '#d1fae5', // Emerald 100
    },
    healthyText: {
        color: '#059669', // Emerald 600
        fontSize: 13,
        fontWeight: 'bold',
    },
    // --- TOMBOL FAB ---
    fab: {
        position: 'absolute',
        bottom: 24, // Posisi sedikit diangkat agar tidak menyentuh bezel bawah
        right: 0, // Mengubah posisi FAB ke kanan bawah (standar mobile UX)
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
});