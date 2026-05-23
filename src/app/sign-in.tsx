import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";

interface SignInScreenProps {
    prop: string;
}

export default function SignInScreen({ prop }: SignInScreenProps) {
    return (
        <ScreenLayout applyInsets>
            <Text>Sign In Screen - {prop}</Text>
        </ScreenLayout>
    );
}