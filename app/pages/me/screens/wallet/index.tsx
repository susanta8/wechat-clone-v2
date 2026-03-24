import { Pressable, SafeAreaView, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { QRCode, Canvas } from "easyqrcode-react-native/QRCode";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  TNavigationOptions,
  useCommonNavigateProps,
} from "@/component/complex/CommonNavigateTitle";
import { useNavigation } from "expo-router";
import ThreeDot from "@/icons/three-dot.svg";
import { useUser } from "app/store/user";

import { ScrollView } from "react-native";
import Toast from "@/component/base/Toast";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/useTheme";
import MoneyOutline from "@/icons/chats/money-outline.svg";
import WalletOutline from "@/icons/chats/wallet-outline.svg";
import Loading from "@/component/base/Loading";
import { getSize } from "utils";
import { useConfigState } from "app/store/globalConfig";
import Button from "@/component/base/Button/Button";

const Wallet = () => {
  const { config } = useConfigState();

  const navigate = useNavigation();
  const { userStore } = useUser();
  const { t } = useTranslation();
  const { themeColor } = useTheme();
  const [wallet, setWallet] = useState({ balance: -1, miniFund: 0 });
  const [showUpiSection, setShowUpiSection] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  useLayoutEffect(() => {
    const navigatorProps = useCommonNavigateProps({
      title: t("Service"),
      rightComp: () => (
        <Pressable
          onPress={() => {
            console.log("ThreeDot");
          }}
        >
          <ThreeDot />
        </Pressable>
      ),

      rightHandler: () => {
        console.log(2222);
      },
    });
    navigate.setOptions({
      ...navigatorProps,
      headerShadowVisible: false,
    } as TNavigationOptions);
  });
  useEffect(() => {
    fetch(
      config.apiDomain +
        `/api/wallet/getWalletByUserId?userId=${userStore.userInfo?._id}`
    )
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res, "res-wallet");
        setWallet(res.data || { balance: 0, miniFund: 0 });
      });
    console.log(i18n.language);
  }, []);
  const getItem = (icon: any, text: string, amount?: number) => {
    const AmountText = () => {
      if (text === "Money") {
        return null;
      }
      return wallet?.balance !== -1 ? (
        <Text
          style={{
            width: 100,
            textAlign: "center",
            color: themeColor.fill4,
            position: "absolute",
            bottom: -16,
            fontSize: 12,
          }}
        >
          {"\u20B9"} {amount}
        </Text>
      ) : (
        <Loading
          size={16}
          style={{ position: "absolute", bottom: getSize(-20) }}
        />
      );
    };
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
        <Text
          style={{
            color: themeColor.white,
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {text}
        </Text>
        <AmountText />
      </View>
    );
  };

  // TODO: Replace with real UPI payment API call once backend supports it
  // Currently a UI scaffold — no actual payment is processed
  const handleUpiPayment = () => {
    if (!upiId || !upiId.includes("@")) {
      Toast.fail(t("Enter UPI ID"));
      return;
    }
    if (!upiAmount || Number(upiAmount) <= 0) {
      Toast.fail(t("Enter Amount"));
      return;
    }
    Toast.info("Demo: UPI payments require backend integration. No real transaction will occur.");
    setUpiId("");
    setUpiAmount("");
    setShowUpiSection(false);
  };

  return (
    <ScrollView>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: themeColor.primary,
          borderRadius: 4,
          margin: 8,
          padding: 40,
          paddingTop: 24,
        }}
      >
        {getItem(
          <MoneyOutline
            style={{ width: 38, height: 38, marginBottom: 4 }}
            fill={themeColor.white}
          />,
          t("Money")
        )}
        {getItem(
          <WalletOutline
            style={{ width: 38, height: 38, marginBottom: 4 }}
            fill={themeColor.white}
          />,
          t("Wallet"),
          (Number(wallet?.balance).toFixed(2) || 5340300.03) as number
        )}
      </View>

      <View
        style={{
          margin: 8,
          padding: 16,
          backgroundColor: themeColor.fillColor,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: themeColor.text5,
            marginBottom: 12,
          }}
        >
          {t("UPI Payment")}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={() => setShowUpiSection(!showUpiSection)}
            style={{
              backgroundColor: themeColor.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: themeColor.white, fontWeight: "bold" }}>
              {t("Pay via UPI")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Toast.info(t("Scan & Pay"));
            }}
            style={{
              backgroundColor: themeColor.white,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: themeColor.primary,
            }}
          >
            <Text style={{ color: themeColor.primary, fontWeight: "bold" }}>
              {t("Scan & Pay")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Toast.info(t("BharatQR"));
            }}
            style={{
              backgroundColor: themeColor.white,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: themeColor.primary,
            }}
          >
            <Text style={{ color: themeColor.primary, fontWeight: "bold" }}>
              {t("BharatQR")}
            </Text>
          </TouchableOpacity>
        </View>

        {showUpiSection && (
          <View style={{ marginTop: 16, gap: 12 }}>
            <View>
              <Text style={{ color: themeColor.text5, marginBottom: 4, fontSize: 14 }}>
                {t("UPI ID")}
              </Text>
              <TextInput
                style={{
                  backgroundColor: themeColor.white,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 16,
                  color: themeColor.text5,
                }}
                placeholder="name@upi"
                placeholderTextColor={themeColor.text2}
                value={upiId}
                onChangeText={setUpiId}
              />
            </View>
            <View>
              <Text style={{ color: themeColor.text5, marginBottom: 4, fontSize: 14 }}>
                {t("Enter Amount")}
              </Text>
              <TextInput
                style={{
                  backgroundColor: themeColor.white,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 16,
                  color: themeColor.text5,
                }}
                placeholder={"\u20B9 0.00"}
                placeholderTextColor={themeColor.text2}
                keyboardType="numeric"
                value={upiAmount}
                onChangeText={setUpiAmount}
              />
            </View>
            <Button type="primary" onPress={handleUpiPayment}>
              {t("Pay Now")}
            </Button>
          </View>
        )}
      </View>

      {i18n.language === "cn" ? (
        <Pressable
          onPress={() => {
            Toast.loading("loading");
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              width: "auto",
              height: 350,
            }}
            source={require("@/assets/cn-service-up.jpg")}
          />
          <Image
            resizeMode="contain"
            style={{
              width: "auto",
              height: 710,
            }}
            source={require("@/assets/cn-service-down.jpg")}
          />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            Toast.loading("loading");
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              width: "auto",
              height: 445,
            }}
            source={require("@/assets/eng-service-up.jpg")}
          />
          <Image
            resizeMode="contain"
            style={{
              width: "auto",
              height: 630,
            }}
            source={require("@/assets/eng-service-down.jpg")}
          />
        </Pressable>
      )}
    </ScrollView>
  );
};
export default Wallet;
