import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";

interface SignUpScreenProps {
    prop: string;
}

export default function SignUpScreen({ prop }: SignUpScreenProps) {
    return (
        <ScreenLayout applyInsets>
            <Text>Sign In Screen - {prop}</Text>
        </ScreenLayout>
    );
}