import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../Text";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function DiagnoseList() {

    const { colors } = useTheme();
    const router = useRouter();
    const diagnoses = [
        {
            id: '1',
            name: 'Masalah Mesin',
            description: 'Mesin tidak menyala atau performa menurun.',
        },
        {
            id: '2',
            name: 'Masalah Rem',
            description: 'Rem tidak responsif atau berdecit.',
        },
        {
            id: '3',
            name: 'Masalah Suspensi',
            description: 'Kendaraan terasa tidak stabil atau bergetar.',
        },
    ];

    const gotoCreateDiagnose = () => router.push('/create-diagnose');


    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={diagnoses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.item]}>
                        <Text>{item.name}</Text>
                        <Text>{item.description}</Text>
                    </View>
                )}
            />
            <Pressable
                style={[
                    styles.fab,
                    { backgroundColor: colors.primary }
                ]}
                onPress={gotoCreateDiagnose}>
                <FontAwesome6
                    name="plus"
                    size={30}
                    color={colors.textInverted} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    item: {
        padding: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        elevation: 2,
        padding: 12,
        borderRadius: 24,
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    }
})