import { Text } from "@/components/Text";
import { View } from "@/components/View";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IndexScreen() {
    const inset = useSafeAreaInsets();
    return (
        <View style={{ marginTop: inset.top, marginBottom: inset.bottom, marginLeft: inset.left, marginRight: inset.right }}>
            <Text>
                Hello world!
            </Text>
        </View>
    )
}