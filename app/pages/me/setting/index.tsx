import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useLayoutEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useTheme } from "@/theme/useTheme";
import { TNavigationOptions } from "@/component/complex/CommonNavigateTitle";
import * as Clipboard from "expo-clipboard";

import Toast from "@/component/base/Toast";
import { useUser } from "app/store/user";
import Button from "@/component/base/Button/Button";
import eventBus from "@/utils/eventBus";
import { useConfigState } from "app/store/globalConfig";

const LANGUAGES = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "hi", label: "Hindi", nativeName: "हिंदी" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা" },
  { code: "cn", label: "Chinese", nativeName: "中文" },
];

const Setting = () => {
  const { config, setConfig } = useConfigState();
  const navigator = useNavigation();
  const { t, i18n } = useTranslation();
  const { setThemeName, themeName, themeColor } = useTheme();
  const { setUserStore, userStore } = useUser();
  const router = useRouter();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleChangeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setShowLangPicker(false);
  };

  useLayoutEffect(() => {
    navigator.setOptions({
      headerTitle: () => (
        <Text style={{ color: themeColor.text5, fontSize: 20 }}>
          {t("setting")}
        </Text>
      ),
      headerTintColor: themeColor.text5,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: themeColor.white },
    } as TNavigationOptions);
  });

  return (
    <ScrollView
      style={{
        backgroundColor: themeColor.white,
        flex: 1,
      }}
      contentContainerStyle={{
        gap: 8,
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: themeColor.text5,
          marginBottom: 4,
        }}
      >
        {t("Select Language")}
      </Text>
      <Button
        type="default"
        onPress={() => setShowLangPicker(!showLangPicker)}
      >
        {t("change language")} ({LANGUAGES.find((l) => l.code === i18n.language)?.nativeName || "English"})
      </Button>
      {showLangPicker && (
        <View
          style={{
            backgroundColor: themeColor.fillColor,
            borderRadius: 8,
            padding: 8,
            gap: 4,
          }}
        >
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleChangeLanguage(lang.code)}
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor:
                  i18n.language === lang.code
                    ? themeColor.primary
                    : themeColor.white,
              }}
            >
              <Text
                style={{
                  color:
                    i18n.language === lang.code
                      ? themeColor.white
                      : themeColor.text5,
                  fontSize: 16,
                }}
              >
                {lang.nativeName} ({lang.label})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button
        type="default"
        onPress={() => {
          console.log("toggleTheme", themeName);
          setThemeName((preName) => {
            console.log(preName, "preName");
            return preName === "light" ? "dark" : "light";
          });
        }}
      >
        {t("change the theme")}
      </Button>
      <Button
        type="default"
        onPress={() => {
          navigator.navigate("pages/map/src/App");
        }}
      >
        {t("to map")}
      </Button>

      <View style={{ marginTop: 8 }}>
        <Text style={{ color: themeColor.text5, marginBottom: 4 }}>
          {t("DPDP Compliance")}
        </Text>
        <Text style={{ color: themeColor.text2, fontSize: 13, marginBottom: 8 }}>
          {t("Data stored in India")}
        </Text>
      </View>

      <View>
        <Text style={{ color: themeColor.text5 }}>apiDomain: {config.apiDomain}</Text>
        <View className="flex-row" style={{ flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          <Button
            type="default"
            onPress={() => {
              setConfig({ apiDomain: "http://172.20.10.3:4000" });
            }}
          >
            {t("home 172")}
          </Button>
          <Button
            type="default"
            onPress={() => {
              setConfig({ apiDomain: "http://192.168.3.10:4000" });
            }}
          >
            {t("bella 192")}
          </Button>
          <Button
            type="default"
            onPress={() => {
              setConfig({
                apiDomain: "https://wechat-server-jhc0.onrender.com",
              });
            }}
          >
            {t("prod url")}
          </Button>
          <Button
            type="default"
            onPress={() => {
              setConfig({
                apiDomain: "https://desichat-server-india.onrender.com",
              });
            }}
          >
            {t("India Server")}
          </Button>
        </View>
      </View>

      <View>
        {
          <>
            <TouchableOpacity
              onPress={async () => {
                await Clipboard.setStringAsync(userStore?.userInfo?._id || "");
                Toast.success("copied");
              }}
            >
              <Text style={{ color: themeColor.text5 }}>
                userID ===={userStore.userInfo?._id} copy userId
              </Text>
            </TouchableOpacity>
          </>
        }
        <Button
          onPress={() => {
            Toast.info(t("Log out"));
            setTimeout(() => {
              eventBus.emit("log-out");
            }, 10);
          }}
        >
          {t("Log out")}
        </Button>
      </View>
    </ScrollView>
  );
};
export default Setting;
