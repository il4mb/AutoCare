import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Fragment } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";

interface Props {
    children?: React.ReactNode;
    header?: {
        title: string;
        showBackButton?: boolean;
        onGoBack?: () => void;
    }
}

export default function ScreenLayout({ children, header }: Props) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const handleGoBack = () => {
        if (header?.onGoBack) {
            header.onGoBack();
        } else {
            router.back();
        }
    };

    return (
        <Fragment>
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        height: 60 + insets.top,
                        backgroundColor: colors.bg
                    }
                ]}>
                {header?.showBackButton !== false && (
                    <Pressable onPress={handleGoBack} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </Pressable>
                )}
                <Text style={styles.headerTitle}>
                    {header?.title || "Screen"}
                </Text>
            </View>
            {children}
        </Fragment>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 4,
        zIndex: 10,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
});