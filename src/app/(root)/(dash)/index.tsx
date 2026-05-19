import { View } from '@/components/View';
import { Text } from '@/components/Text';
import RootLayout from '@/components/roots/RootLayout';

export default function HomeScreen() {
    return (
        <RootLayout>
            <View>
                <Text>
                    Hello world!
                </Text>
            </View>
        </RootLayout>
    )
}