import Toast from "@/component/base/Toast";
import Divider from "@/component/complex/Divider";
import ItemCard from "@/component/complex/ItemCard";
import ArrowRightIcon from "@/icons/common/arrow-right.svg";
import { useTheme } from "@/theme/useTheme";
import { useNavigation, useRouter } from "expo-router";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  Text,
  Image,
  View,
  Pressable,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const FESTIVALS = [
  { key: "Diwali", emoji: "\uD83E\uDE94" },
  { key: "Holi", emoji: "\uD83C\uDF08" },
  { key: "Eid", emoji: "\u2B50" },
  { key: "Christmas", emoji: "\uD83C\uDF84" },
  { key: "Pongal", emoji: "\uD83C\uDF3E" },
  { key: "Onam", emoji: "\uD83C\uDF3B" },
  { key: "Navratri", emoji: "\uD83D\uDC83" },
];

const Discover = () => {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { themeColor } = useTheme();

  const cardList = [
    {
      text: t("moments"),
      url: require("@/icons/discover/moments.jpeg"),
      onPressHandler: () => {
        navigator.navigate("pages/discover/moments/index");
      },
    },
    {
      text: "Channels",
      url: require("@/icons/discover/channels.jpeg"),
    },
    {
      text: "Live",
      url: require("@/icons/discover/live.jpeg"),
    },
    {
      text: "Scan",
      url: require("@/icons/discover/scan-v2.jpeg"),
      onPressHandler: () => {
        navigator.navigate("pages/chats/screens/code-scanner/index");
      },
    },
    {
      text: "Shake",
      url: require("@/icons/discover/shake.jpeg"),
    },
    {
      text: "Top Stories",
      url: require("@/icons/discover/top-stories.jpeg"),
    },
    {
      text: "Search",
      url: require("@/icons/discover/search.jpeg"),
    },
    {
      text: "Nearby",
      url: require("@/icons/discover/nearby.jpeg"),
      onPressHandler: () => {
        if (Platform.OS === "android") {
          Toast.info("android not support this");
          return;
        }
        navigator.navigate("pages/discover/screens/nearBy/index");
      },
    },
    {
      text: "Games",
      url: require("@/icons/discover/games.jpeg"),
    },
    {
      text: "Mini Programs",
      url: require("@/icons/discover/mini-programs.jpeg"),
    },
  ];
  return (
    <ScrollView>
      <View
        style={{
          margin: 8,
          padding: 12,
          backgroundColor: themeColor.fillColor,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: themeColor.text5,
            marginBottom: 8,
          }}
        >
          {t("Festival Greetings")}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {FESTIVALS.map((festival) => (
              <TouchableOpacity
                key={festival.key}
                onPress={() => {
                  Toast.success(t(festival.key) + " \uD83C\uDF89");
                }}
                style={{
                  backgroundColor: themeColor.white,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                  alignItems: "center",
                  minWidth: 80,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 2 }}>
                  {festival.emoji}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: themeColor.text5,
                    fontWeight: "500",
                  }}
                >
                  {t(festival.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {cardList.map((card) => {
        const getDivider = () => {
          const gapFields = [
            "Channels",
            "Scan",
            "Top Stories",
            "Nearby",
            "Games",
            "Mini Programs",
          ];
          if (gapFields.includes(card.text)) {
            return <Divider key={card.text} />;
          }
          return null;
        };
        const visibleBoderFields = ["Channels", "Scan", "Top Stories"];
        return (
          <View key={card.text}>
            {getDivider()}
            <ItemCard
              onPress={() => {
                card.onPressHandler?.();
              }}
              borderVisible={visibleBoderFields.includes(card.text)}
              leftComp={() => {
                return (
                  <View>
                    <Image
                      style={{
                        marginLeft: 18,
                        marginRight: 4,
                        width: 24,
                        height: 24,
                      }}
                      borderRadius={4}
                      source={card.url}
                    />
                  </View>
                );
              }}
              text={card.text}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};
export default Discover;
