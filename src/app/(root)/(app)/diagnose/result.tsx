import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Print from 'expo-print'; // Import expo-print

import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Diagnose } from "@/database/model/Diagnose";
import { db } from "@/database";

export default function ResultScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [diagnose, setDiagnose] = useState<Diagnose | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // 1. Observer WatermelonDB
    useEffect(() => {
        if (!id) {
            setError("ID Diagnosa tidak valid.");
            setIsLoading(false);
            return;
        }

        const collection = db.get<Diagnose>(Diagnose.table);
        const subscribe = collection.findAndObserve(id).subscribe({
            next: (diag) => {
                setDiagnose(diag);
                setIsLoading(false);
            },
            error: (err) => {
                console.error("Error observing diagnose:", err);
                setError("Gagal memuat hasil diagnosa dari database lokal.");
                setIsLoading(false);
            }
        });

        return () => subscribe.unsubscribe();
    }, [id]);

    // 2. Memisahkan Data Berdasarkan Ketersediaan Informasi di Database
    const { allCodes, knownCodes, unknownCodes } = useMemo(() => {
        if (!diagnose || !diagnose.codes) {
            return { allCodes: [], knownCodes: [], unknownCodes: [] };
        }

        const parsedCodes = diagnose.codes.split(",").map(c => c.trim()).filter(Boolean);
        const dict = diagnose.description || {};

        return {
            allCodes: parsedCodes,
            knownCodes: parsedCodes.filter(code => dict[code]),
            unknownCodes: parsedCodes.filter(code => !dict[code])
        };
    }, [diagnose]);

    // --- LOGIKA PRINT PDF ---
    const handlePrintPDF = async () => {
        if (!diagnose) return;
        setIsPrinting(true);

        try {
            // Membuat template HTML untuk PDF
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Laporan Diagnosa Kendaraan</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #0252ff; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #0f172a; font-size: 28px; }
                    .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
                    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                    .code-badge { display: inline-block; background-color: #fee2e2; color: #b91c1c; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
                    .desc { font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; }
                    .section { margin-bottom: 10px; }
                    .section-title { font-size: 12px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 4px; }
                    .section-content { font-size: 14px; margin: 0; color: #475569; }
                    .unknown-section { background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Laporan Diagnosa AutoCare</h1>
                    <p>ID Referensi: ${diagnose.id}</p>
                    <p>Tanggal: ${new Date(diagnose.createdAt).toLocaleString('id-ID')}</p>
                </div>

                ${knownCodes.map(code => `
                    <div class="card">
                        <div class="code-badge">DTC: ${code}</div>
                        <div class="desc">${diagnose?.description?.[code] || '-'}</div>
                        
                        ${diagnose?.symptoms?.[code] ? `
                        <div class="section">
                            <div class="section-title">Gejala yang Timbul</div>
                            <p class="section-content">${diagnose.symptoms[code]}</p>
                        </div>` : ''}
                        
                        ${diagnose?.causes?.[code] ? `
                        <div class="section">
                            <div class="section-title">Kemungkinan Penyebab</div>
                            <p class="section-content">${diagnose.causes[code]}</p>
                        </div>` : ''}
                        
                        ${diagnose?.solutions?.[code] ? `
                        <div class="section">
                            <div class="section-title">Solusi / Perbaikan</div>
                            <p class="section-content">${diagnose.solutions[code]}</p>
                        </div>` : ''}
                    </div>
                `).join('')}

                ${unknownCodes.length > 0 ? `
                    <div class="unknown-section">
                        <strong>Informasi Tambahan:</strong> Terdapat kode lain yang terdeteksi namun belum terdaftar di database kami: 
                        <span style="color: #d97706; font-weight: bold;">${unknownCodes.join(', ')}</span>
                    </div>
                ` : ''}
            </body>
            </html>
            `;

            // Eksekusi fungsi print (akan memunculkan dialog native PDF iOS/Android)
            await Print.printAsync({ html: htmlContent });
            
        } catch (err) {
            console.error("Gagal membuat PDF:", err);
            Alert.alert("Gagal", "Terjadi kesalahan saat membuat dokumen PDF.");
        } finally {
            setIsPrinting(false);
        }
    };

    // --- HELPER UNTUK RENDER LIST ---
    const renderListSection = (title: string, icon: keyof typeof MaterialCommunityIcons.glyphMap, content: string | undefined, color: string) => {
        if (!content || content.trim() === "") return null;

        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name={icon} size={18} color={color} />
                    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
                </View>
                <View style={styles.bulletRow}>
                    <View style={[styles.bulletPoint, { backgroundColor: color }]} />
                    <Text style={styles.bulletText}>{content}</Text>
                </View>
            </View>
        );
    };

    // --- STATUS 1: LOADING ---
    if (isLoading) {
        return (
            <ScreenLayout applyInsets style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#0252ff" />
                    <Text style={styles.loadingText}>Memuat Data...</Text>
                    <Text style={styles.loadingSubText}>Mengambil riwayat diagnosa dari memori perangkat.</Text>
                </View>
            </ScreenLayout>
        );
    }

    // --- STATUS 2: ERROR ---
    if (error) {
        return (
            <ScreenLayout applyInsets style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={[styles.iconCircle, styles.iconCircleError]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
                    </View>
                    <Text type="title" style={styles.errorTitle}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 24 }} />
                </View>
            </ScreenLayout>
        );
    }

    // --- STATUS 3: KENDARAAN SEHAT ---
    if (allCodes.length === 0) {
        return (
            <ScreenLayout applyInsets style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                        <MaterialCommunityIcons name="check-decagram" size={64} color="#10b981" />
                    </View>
                    <Text type="title" style={styles.healthyTitle}>Kendaraan Sehat!</Text>
                    <Text style={styles.healthyText}>
                        Tidak ditemukan riwayat kode kerusakan (DTC) pada sesi ini.
                    </Text>
                    <Button
                        title="Kembali ke Beranda"
                        onPress={() => router.replace("/home")}
                        style={{ marginTop: 32, width: '100%' }}
                    />
                </View>
            </ScreenLayout>
        );
    }

    // --- STATUS 4: KODE DITEMUKAN TAPI 100% TIDAK DIKENALI ---
    if (allCodes.length > 0 && knownCodes.length === 0) {
        return (
            <ScreenLayout applyInsets style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={[styles.iconCircle, styles.iconCircleWarning]}>
                        <MaterialCommunityIcons name="database-search-outline" size={48} color="#f59e0b" />
                    </View>
                    <Text type="title" style={styles.warningTitle}>Kode Belum Terdaftar</Text>
                    <Text style={styles.warningText}>
                        Sistem mendeteksi adanya kerusakan, namun detail untuk kode di bawah ini belum tersedia pada database kami:
                    </Text>

                    <View style={styles.unknownCodesWrapper}>
                        {unknownCodes.map((code, index) => (
                            <View key={index} style={styles.unknownBadge}>
                                <Text style={styles.unknownBadgeText}>{code}</Text>
                            </View>
                        ))}
                    </View>

                    <Button
                        title="Kembali ke Beranda"
                        onPress={() => router.replace("/home")}
                        style={{ marginTop: 32, width: '100%' }}
                    />
                </View>
            </ScreenLayout>
        );
    }

    // --- STATUS 5: HASIL DIAGNOSA UTAMA ---
    return (
        <ScreenLayout applyInsets style={styles.container}>
            <View style={styles.header}>
                <Text type="title" style={styles.headerTitle}>Hasil Diagnosa</Text>
                <Text style={styles.headerSubtitle}>
                    Ditemukan {knownCodes.length} informasi kerusakan.
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {knownCodes.map((code) => {
                    const desc = diagnose?.description?.[code];
                    const symptom = diagnose?.symptoms?.[code];
                    const cause = diagnose?.causes?.[code];
                    const solution = diagnose?.solutions?.[code];

                    return (
                        <View key={code} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.codeBadge}>
                                    <MaterialCommunityIcons name="engine-outline" size={16} color="#b91c1c" />
                                    <Text style={styles.codeText}>{code}</Text>
                                </View>
                            </View>

                            {desc && <Text style={styles.cardDescription}>{desc}</Text>}
                            <View style={styles.divider} />

                            {renderListSection("Gejala yang Timbul", "alert-circle-outline", symptom, "#f59e0b")}
                            {renderListSection("Kemungkinan Penyebab", "magnify-scan", cause, "#ef4444")}
                            {renderListSection("Solusi / Perbaikan", "wrench-outline", solution, "#10b981")}
                        </View>
                    );
                })}

                {unknownCodes.length > 0 && (
                    <View style={styles.unknownCard}>
                        <View style={styles.unknownCardHeader}>
                            <MaterialCommunityIcons name="information-outline" size={20} color="#f59e0b" />
                            <Text style={styles.unknownCardTitle}>Informasi Tambahan</Text>
                        </View>
                        <Text style={styles.unknownCardDesc}>
                            Terdapat kode lain yang terdeteksi namun belum terdaftar di database kami:
                        </Text>
                        <View style={[styles.unknownCodesWrapper, { marginTop: 12 }]}>
                            {unknownCodes.map((code, index) => (
                                <View key={index} style={styles.unknownBadge}>
                                    <Text style={styles.unknownBadgeText}>{code}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Button
                    title="Selesai"
                    onPress={() => router.replace("/home")}
                    style={styles.finishButton}
                />
            </ScrollView>

            {/* FLOATING ACTION BUTTON (PRINT PDF) */}
            <Pressable 
                style={({ pressed }) => [
                    styles.fab, 
                    pressed && styles.fabPressed,
                    isPrinting && styles.fabDisabled
                ]}
                onPress={handlePrintPDF}
                disabled={isPrinting}
            >
                {isPrinting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <MaterialCommunityIcons name="printer" size={28} color="#ffffff" />
                )}
            </Pressable>
            
        </ScreenLayout>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f5f9" },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },

    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 24 },
    iconCircleError: { backgroundColor: "#fee2e2" },
    iconCircleSuccess: { backgroundColor: "#d1fae5" },
    iconCircleWarning: { backgroundColor: "#fef3c7" },

    loadingText: { fontSize: 18, color: "#0f172a", fontWeight: "600", marginTop: 20, marginBottom: 8 },
    loadingSubText: { color: "#64748b", textAlign: "center" },
    errorTitle: { fontSize: 24, color: "#0f172a", marginBottom: 8 },
    errorText: { color: "#64748b", textAlign: "center" },
    healthyTitle: { fontSize: 28, color: "#065f46", marginBottom: 12 },
    healthyText: { color: "#059669", textAlign: "center", fontSize: 16, lineHeight: 24, paddingHorizontal: 20 },
    warningTitle: { fontSize: 26, color: "#92400e", marginBottom: 12, textAlign: "center" },
    warningText: { color: "#b45309", textAlign: "center", fontSize: 15, lineHeight: 22, paddingHorizontal: 12 },

    unknownCodesWrapper: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 20 },
    unknownBadge: { backgroundColor: "#fffbeb", borderColor: "#fcd34d", borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    unknownBadgeText: { color: "#d97706", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },

    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    headerTitle: { fontSize: 28, color: "#0f172a", marginBottom: 4 },
    headerSubtitle: { color: "#ef4444", fontSize: 15, fontWeight: "500" },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 20 }, // paddingBottom diubah ke 100 agar scroll tidak tertutup FAB

    card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    codeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fee2e2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
    codeText: { color: "#b91c1c", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
    cardDescription: { fontSize: 18, color: "#1e293b", fontWeight: "600", lineHeight: 26 },
    divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },

    unknownCard: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 16, padding: 16 },
    unknownCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    unknownCardTitle: { color: "#d97706", fontWeight: "bold", fontSize: 16 },
    unknownCardDesc: { color: "#b45309", fontSize: 14, lineHeight: 20 },

    sectionContainer: { marginBottom: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, paddingRight: 10 },
    bulletPoint: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 12 },
    bulletText: { color: "#475569", fontSize: 14, lineHeight: 20, flex: 1 },

    finishButton: { marginTop: 12, marginBottom: 20 },

    // --- FAB STYLES ---
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: "#0252ff", // Warna primary aplikasi
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
        backgroundColor: "#0040cc",
    },
    fabDisabled: {
        backgroundColor: "#94a3b8",
        elevation: 0,
        shadowOpacity: 0,
    }
});