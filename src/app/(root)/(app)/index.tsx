import { View } from '@/components/View';
import { Text } from '@/components/Text';
import ScreenLayout from '@/components/ScreenLayout';
import { Diagnostic } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import DiagnoseList from '@/components/diagnoses/DiagnoseList';

export default function HomeScreen() {

    const router = useRouter();
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const isEmpty = diagnostics.length === 0;
    const [showEmptyState, setShowEmptyState] = useState(() => diagnostics.length === 0);

    const gotoCreateDiagnose = () => router.push('/diagnose');
    const gotoProfile = () => router.push('/profile');
    const closeEmptyState = () => setShowEmptyState(false);


    return (
        <ScreenLayout style={{ paddingHorizontal: 22 }} applyInsets>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 16, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text type="title" style={{ marginBottom: 0 }}>
                        Auto Care
                    </Text>
                </View>
                <Pressable onPress={gotoProfile}>
                    <FontAwesome6 name="user-circle" size={30} />
                </Pressable>
            </View>
            {showEmptyState ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, gap: 18, marginTop: -40 }}>
                    <Text type="title" style={{ marginBottom: 0 }}>
                        Selamat datang di AutoCare!
                    </Text>
                    <Text style={{ color: '#888' }}>
                        Mulai dengan menghubungkan perangkat OBD-II Anda untuk melihat metrik kendaraan dan melakukan diagnosa.
                    </Text>
                    <Button
                        title="Mulai Diagnosa"
                        onPress={gotoCreateDiagnose}
                        style={{ paddingHorizontal: 42, marginTop: 8 }}
                    />
                    <Pressable onPress={closeEmptyState}>
                        <Text style={{ color: '#888', textDecorationLine: 'underline' }}>
                            Lewati untuk sekarang
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <Text>
                        {isEmpty ? 'Daftar metrik kendaraan akan muncul di sini setelah Anda melakukan diagnosa.' : 'Metrik kendaraan Anda:'}
                    </Text>
                    <DiagnoseList />
                </View>
            )}
        </ScreenLayout>
    )
}