import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import DiagnoseList from '@/components/diagnoses/DiagnoseList';
import ScreenLayout from '@/components/ScreenLayout';
import { Text } from '@/components/Text';
import { useApp } from '@/contexts/AppProvider';
import { db, Diagnose } from '@/database';
import i18n from '@/localization';
import { Q } from '@nozbe/watermelondb';

export default function HomeScreen() {
    const router = useRouter();
    const { auth } = useApp();

    // Status untuk menunggu pengecekan DB pertama kali
    const [isLoading, setIsLoading] = useState(true);
    const [isEmpty, setIsEmpty] = useState(true);
    // Status jika user menekan "Lewati untuk sekarang"
    const [isSkipped, setIsSkipped] = useState(false);

    const gotoCreateDiagnose = () => router.push('/diagnose');
    const gotoProfile = () => router.push('/profile');
    const skipWelcome = () => setIsSkipped(true);

    useEffect(() => {
        const collection = db.get<Diagnose>(Diagnose.table);
        const subscription = collection.query(
            Q.sortBy('created_at', Q.desc),
            Q.where('uid', auth?.id || '')
        ).observe().subscribe((records) => {
            setIsEmpty(records.length === 0);
            setIsLoading(false); // Pengecekan selesai
        });

        return () => subscription.unsubscribe();
    }, []);

    // Tentukan apakah harus menampilkan layar Welcome (Kosong DAN belum dilewati)
    const showWelcome = isEmpty && !isSkipped;

    return (
        <ScreenLayout style={{ paddingHorizontal: 22 }} applyInsets>
            {/* HEADER */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 16, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text type="title" style={{ marginBottom: 0 }}>
                        {i18n.t('home.title')}
                    </Text>
                </View>
                <Pressable onPress={gotoProfile}>
                    <FontAwesome6 name="user-circle" size={30} color="#0f172a" />
                </Pressable>
            </View>

            {/* KONTEN UTAMA */}
            {isLoading ? (
                // 1. Tampilkan loading saat sedang mengecek database
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0252ff" />
                </View>
            ) : showWelcome ? (
                // 2. Tampilkan Welcome Screen jika data kosong
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, gap: 18, marginTop: -40 }}>
                    <Text type="title" style={{ marginBottom: 0 }}>
                        {i18n.t('home.welcomeTitle')}
                    </Text>
                    <Text style={{ color: '#888', textAlign: 'center' }}>
                        {i18n.t('home.welcomeDescription')}
                    </Text>

                    <Button
                        title={i18n.t('home.startDiagnose')}
                        onPress={gotoCreateDiagnose}
                        style={{ paddingHorizontal: 42, marginTop: 8 }}
                    />

                    <Pressable onPress={skipWelcome} style={{ padding: 8 }}>
                        <Text style={{ color: '#888', textDecorationLine: 'underline' }}>
                            {i18n.t('home.skipForNow')}
                        </Text>
                    </Pressable>
                </View>
            ) : (
                // 3. Tampilkan List jika ada data (atau jika user menekan Lewati)
                <View style={{ flex: 1 }}>
                    {/* Header List + Tombol Tambah Diagnosa Baru */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ color: '#64748b', flex: 1 }}>
                            {isEmpty
                                ? i18n.t('home.emptyHistory')
                                : i18n.t('home.historyTitle')}
                        </Text>

                        {/* Tombol kecil untuk diagnosa baru saat list tampil */}
                        <Pressable onPress={gotoCreateDiagnose} style={{ padding: 8, backgroundColor: '#eff6ff', borderRadius: 8 }}>
                            <FontAwesome6 name="plus" size={16} color="#0252ff" />
                        </Pressable>
                    </View>

                    <DiagnoseList />
                </View>
            )}
        </ScreenLayout>
    );
}