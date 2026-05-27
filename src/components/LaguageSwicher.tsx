import { useState } from "react";
import { DevSettings, Platform } from "react-native";

import i18n, { type AppLocale, saveLocalePreference } from "@/localization";
import { SelectField } from "./SelectField";

export default function LanguageSwitcher() {
    const [language, setLanguage] = useState<AppLocale>(i18n.locale === "id" ? "id" : "en");

    const toggleLanguage = async (lang: string) => {
        const newLang = lang === "id" ? "id" : "en";
        if (newLang === language) {
            return;
        }

        setLanguage(newLang);
        i18n.locale = newLang;

        try {
            await saveLocalePreference(newLang);

            if (Platform.OS === "web") {
                window.location.reload();
                return;
            }

            DevSettings.reload();
        } catch (error) {
            console.error("Failed to save language preference", error);
        }
    };

    return (
        <SelectField
            options={[
                { label: "English", value: "en" },
                { label: "B. Indonesia", value: "id" },
            ]}
            value={language}
            onValueChange={toggleLanguage}
        />
    );
}