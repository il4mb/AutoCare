import { Text } from "@/components/Text";
import { View } from "@/components/View";
import { BlurView } from "expo-blur";
export default function DrawerScreen() {

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(252, 17, 17, 0.5)' }}>
            <Text>
                Drawer
            </Text>
        </View>
    )
}