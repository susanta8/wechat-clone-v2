import { useUser } from "app/store/user";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import Toast from "@/component/base/Toast";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { useNavigation, useRouter } from "expo-router";
import Button from "@/component/base/Button/Button";
import { useTranslation } from "react-i18next";
import { useChatList } from "app/store/chatList";
import { useLoadingStore } from "app/store/globalLoading";
import {
  TNavigationOptions,
  useCommonNavigateProps,
} from "@/component/complex/CommonNavigateTitle";
import { useTheme } from "@/theme/useTheme";
import { getSize } from "utils";
import eventBus from "@/utils/eventBus";
import { useConfigState } from "app/store/globalConfig";

const style = StyleSheet.create({
  inputStyle: {
    padding: 8,
  },
});
export default () => {
  const navigate = useNavigation();
  const { config } = useConfigState();

  const { setUserStore, userStore } = useUser();
  const deviceModel = DeviceInfo.getModel();
  const { t } = useTranslation();
  const router = useRouter();
  const { setLoadingStore } = useLoadingStore();
  const { themeColor } = useTheme();
  const [googleUser, setGoogleUser] = useState();
  const [isInProgress, setIsInProgress] = useState(false);
  const [data, setData] = useState({ psw: "1", act: "1" });
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { setChatListStoreV2 } = useChatList();
  const resetAfterOffline = () => {
    setChatListStoreV2({
      chatListStore: [],
      curConvo: {},
      type: "resetAfterOffline",
    });
  };
  const goBack = () => {
    router.back();
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };

  const signIn = async () => {
    try {
      console.log(11111);

      await GoogleSignin.hasPlayServices();
      console.log(22222, "GoogleSignin", GoogleSignin);
      const userInfo = await GoogleSignin.signIn();
      console.log(33333, userInfo);

      const hasUser = await axios
        .post(config.apiDomain + "/api/user/register", {
          ...userInfo.user,
          act: userInfo.user.name,
          email: userInfo.user.email,
          type: "google",
          psw: 123,
        })
        .then((res) => res.data.data);
      console.log(hasUser, "hasUser");

      if (hasUser) {
        setUserStore({ userInfo: hasUser });
        console.log("86-setUserStore");

        goBack();

        return;
      }
      const user = await axios.post(config.apiDomain + "/api/user/register", {
        type: "google",
        ...userInfo.user,
      });
      console.log(user, "user");
      setGoogleUser({ userInfo });
      setUserStore(user);
      goBack();
    } catch (error: any) {
      console.log(error, "error");

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setGoogleUser({ user: null });
    } catch (error) {
      console.error(error);
    }
  };
  useLayoutEffect(() => {
    const navigatorProps = useCommonNavigateProps({
      rightComp: () => <></>,
      title: t("Login") as string,
    });
    navigate.setOptions({
      ...navigatorProps,
      headerStyle: { backgroundColor: themeColor.white },
      headerShadowVisible: false,
    } as TNavigationOptions);
  }, []);
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        "475065706028-11egj47k01ej9juk2o892q5os4gehkbp.apps.googleusercontent.com",
      googleServicePlistPath: "",
    });
    eventBus.on("log-out", () => {
      router.replace("/pages/me/screens/lading/");
      console.log(data, "data");

      signOut();
      data.act = "";
      data.psw = "";
      setData(data);
      setUserStore((prev) => ({ ...prev, userInfo: {} }));
      resetAfterOffline();
    });
  }, []);

  // TODO: Replace with real OTP API call (e.g. Firebase Auth, Twilio)
  // Currently a UI scaffold — no SMS is actually sent
  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Toast.fail(t("Enter Phone Number"));
      return;
    }
    Toast.info("Demo: OTP flow is a UI preview. Backend SMS integration required.");
    setOtpSent(true);
  };

  // TODO: Wire up to a real OTP verification endpoint once backend supports it
  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length < 4) {
      Toast.fail(t("Invalid OTP"));
      return;
    }
    Toast.info("Demo: OTP verification requires backend integration. Using password login for now.");
    setLoadingStore({ loading: true, text: "Verifying..." });
    Keyboard.dismiss();
    fetch(config.apiDomain + "/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        act: phoneNumber,
        psw: otpCode,
        type: "otp",
        phone: phoneNumber,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.code === 200) {
          const newInfo = { ...userStore, userInfo: res?.data };
          setUserStore({ ...newInfo });
          router.replace("/(tabs)");
          Toast.success(t("OTP Verified"));
        } else {
          Toast.fail(res.msg || t("Invalid OTP"));
        }
      })
      .catch((e) => {
        console.log(e, "otp-login-error");
        Toast.fail(t("Transaction Failed"));
      })
      .finally(() => {
        setLoadingStore({ loading: false, text: "" });
      });
  };

  const loginHandler = () => {
    if (!data.act || !data.psw) {
      Toast.fail("act or psw is required");
      return;
    }
    console.log(data, "data-login");
    fetch(config.apiDomain + "/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res, "res-SimpleLogin");

        if (res?.code === 200) {
          const newInfo = { ...userStore, userInfo: res?.data };
          setUserStore({ ...newInfo });
          router.replace("/(tabs)");
          console.log(newInfo, "userStore login");
        } else {
          Toast.fail(res.msg);
          console.log(res?.msg);
        }
      })
      .catch((e) => {
        console.log(e, "register-error");
      })
      .finally(() => {
        // setLoadingStore({ loading: false, text: "" });
      });
  };
  // Network Images
  if (userStore.userInfo?._id) {
    router.back();
    return;
  }
  return (
    <View style={{ padding: 24, flex: 1, backgroundColor: themeColor.white }}>
      {<View style={{ height: "10%" }}></View>}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 24,
          gap: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setLoginMode("password");
            setOtpSent(false);
          }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: 2,
            borderBottomColor:
              loginMode === "password" ? themeColor.primary : "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color:
                loginMode === "password" ? themeColor.primary : themeColor.text2,
              fontWeight: loginMode === "password" ? "bold" : "normal",
            }}
          >
            {t("Login with Password")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLoginMode("otp")}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: 2,
            borderBottomColor:
              loginMode === "otp" ? themeColor.primary : "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color:
                loginMode === "otp" ? themeColor.primary : themeColor.text2,
              fontWeight: loginMode === "otp" ? "bold" : "normal",
            }}
          >
            {t("Login with OTP")}
          </Text>
        </TouchableOpacity>
      </View>

      {loginMode === "password" ? (
        <View className="flex items-center gap-4">
          <View className="flex-row gap-2 mb-2 items-center w-full px-2">
            <Text style={{ width: getSize(80), fontSize: 16 }}>
              {t("Account")}
            </Text>
            <TextInput
              style={{ fontSize: 18, flex: 1, color: themeColor.text5 }}
              clearButtonMode="always"
              className="w-full"
              placeholderTextColor={themeColor.text2}
              selectionColor={themeColor.primary}
              placeholder={t("Enter Account")}
              onChangeText={(val) => {
                data.act = val;
                setData(data);
              }}
            />
          </View>
          <View className="flex-row  gap-2 mb-4 items-center w-full px-2">
            <Text style={{ width: getSize(80), fontSize: 16 }}>
              {t("Password")}
            </Text>
            <TextInput
              style={{ fontSize: 18, flex: 1 }}
              selectionColor={themeColor.primary}
              placeholderTextColor={themeColor.text2}
              placeholder={t("Enter Password")}
              clearButtonMode="always"
              secureTextEntry={true}
              onChangeText={(val) => {
                data.psw = val;
                setData(data);
              }}
            />
          </View>

          <View className=" justify-center items-center w-full mt-8">
            <Button
              style={{ width: "90%", marginBottom: 24 }}
              type="primary"
              onPress={() => {
                setLoadingStore({ loading: true, text: "Login..." });
                Keyboard.dismiss();
                setTimeout(() => {
                  loginHandler();
                  console.log(data, "data", config.apiDomain);
                }, 600);
              }}
            >
              {t("Login")}
            </Button>

            {Platform.OS === "ios" && (
              <GoogleSigninButton
                className="flex-1"
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => {
                  signIn();
                }}
                disabled={isInProgress}
              />
            )}
          </View>
        </View>
      ) : (
        <View className="flex items-center gap-4">
          <View className="flex-row gap-2 mb-2 items-center w-full px-2">
            <Text style={{ width: getSize(40), fontSize: 18, fontWeight: "bold" }}>
              +91
            </Text>
            <TextInput
              style={{ fontSize: 18, flex: 1, color: themeColor.text5 }}
              clearButtonMode="always"
              className="w-full"
              placeholderTextColor={themeColor.text2}
              selectionColor={themeColor.primary}
              placeholder={t("Enter Phone Number")}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {!otpSent ? (
            <View className="justify-center items-center w-full mt-4">
              <Button
                style={{ width: "90%", marginBottom: 24 }}
                type="primary"
                onPress={handleSendOtp}
              >
                {t("Send OTP")}
              </Button>
            </View>
          ) : (
            <>
              <View className="flex-row gap-2 mb-2 items-center w-full px-2">
                <Text style={{ width: getSize(80), fontSize: 16 }}>
                  {t("Enter OTP")}
                </Text>
                <TextInput
                  style={{ fontSize: 22, flex: 1, letterSpacing: 8, color: themeColor.text5 }}
                  placeholderTextColor={themeColor.text2}
                  selectionColor={themeColor.primary}
                  placeholder="------"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>
              <View className="justify-center items-center w-full mt-4">
                <Button
                  style={{ width: "90%", marginBottom: 12 }}
                  type="primary"
                  onPress={handleVerifyOtp}
                >
                  {t("Verify OTP")}
                </Button>
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={{ color: themeColor.primary, fontSize: 14 }}>
                    {t("Send OTP")} {t("Recall")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};
