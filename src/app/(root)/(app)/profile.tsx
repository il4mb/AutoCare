import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { View } from "react-native";

export default function Profile() {
    return (
        <ScreenLayout applyInsets>
            <View>
                <Text type="title">Profil Pengguna</Text>
                <Text>Fitur ini sedang dalam pengembangan. Nantikan pembaruan selanjutnya!</Text>
            </View>
        </ScreenLayout>
    );
}