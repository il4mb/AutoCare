import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import api from "@/api";
import { useRouter } from "expo-router";

export default function Profile() {

    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/auth/me");
            if (response.status !== 200) {
                if (response.status === 401) {
                    throw new Error("Unauthorized. Please log in again.");
                }
                throw new Error(`Failed to fetch profile data: ${response.statusText}`);
            }
            setData(response.data);

        } catch (e) {
            console.error("Failed to fetch profile data", e);
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <ScreenLayout applyInsets>
            <View style={{ flex: 1, padding: 24, gap: 12 }}>
                <Text type="title">
                    Profil Pengguna
                </Text>
                {error && <Text style={{ color: "red" }}>{error.message}</Text>}
                {loading ? (
                    <Text>Memuat...</Text>
                ) : (
                    <Text>Fitur ini sedang dalam pengembangan. Nantikan pembaruan selanjutnya!</Text>
                )}
            </View>
        </ScreenLayout>
    );
}