import React, { useCallback, useMemo } from "react"
import { View } from "../View"
import { Text } from "../Text"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Pressable } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"

type Props = {
    children?: React.ReactNode
}
export default function RootLayout({ children }: Props) {

    const router = useRouter();
    const insets = useSafeAreaInsets();

    const containerStyle = useMemo(() => ({
        marginTop: insets.top,
        marginBottom: insets.bottom,
        marginLeft: insets.left,
        marginRight: insets.right
    }), [insets])

    const openDrawer = useCallback(() => {
        console.log('Opening drawer')
        router.push('/drawer')
    }, [router])

    return (
        <View style={containerStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Pressable onPress={openDrawer}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#000',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <FontAwesome6
                        name="chevron-right"
                        size={18}
                        color="#fff" />
                </Pressable>
                <Text>
                    Honda Accord 2018
                </Text>
            </View>
            {children}
        </View>
    )
}