import { emailAtom } from "@/store/login";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/clerk-expo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Checkbox } from "expo-checkbox";
import { Link, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [loading, setLoading] = useState<"email" | "github" | "google" | false>(
    false
  );
  const setAtomEmail = useSetAtom(emailAtom);

  const { startSSOFlow } = useSSO();
  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSignInWithSSO = async (
    strategy: "oauth_google" | "oauth_github"
  ) => {
    if (strategy === "oauth_github" || strategy === "oauth_google") {
      setLoading(strategy.replace("oauth_", "") as "google" | "github");
    } else {
      setLoading(false);
    }

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });

      if (createdSessionId) setActive!({ session: createdSessionId });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    try {
      setLoading("email");
      setAtomEmail(email);
      await signUp?.create({ emailAddress: email });
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });

      router.push("/verify");
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        handleSignInWithEmail();
      } else {
        Alert.alert("error", "something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithEmail = async () => {
    try {
      setLoading("email");

      const signInAtempt = await signIn?.create({
        strategy: "email_code",
        identifier: email,
      });

      router.push("/verify");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = async () => {
    await Linking.openURL("http://google.com");
  };

  return (
    <View className="flex-1 bg-black pt-safe">
      <View className="flex-1 p-6">
        {/* faq button */}
        <View className="flex-row justify-end">
          <Link asChild href={"/faq"}>
            <TouchableOpacity className="bg-gray-700 rounded-xl p-2">
              <Feather name="help-circle" size={28} color={"white"} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* center  */}

        <View className="items-center py-8">
          <Image
            source={require("@/assets/images/convex.png")}
            className="size-40"
          />
        </View>
        <Text className="text-gray-400 text-md text-center font-Poppins_400Regular">
          Ai-Powered Caption editor
        </Text>

        <TextInput
          className="bg-gray-800 text-gray-300 rounded-xl p-4 my-8"
          placeholder="Email"
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="flex-row items-center">
          <Checkbox
            value={isTermsChecked}
            onValueChange={setIsTermsChecked}
            className="mr-2"
            color={isTermsChecked ? "#4630EB" : undefined}
          />

          <Text className="text-gray-400 text-sm font-Poppins_400Regular">
            I accept the <Link href={"/terms"}>Terms and Services</Link> and
            {"\n"}
            <Link href={"/privacy"}>Privacy Policy</Link>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleSignInWithEmail}
          className={`w-full py-4 rounded-lg my-2 transition-colors duration-300 ${!email || !isTermsChecked || loading === "email" ? "bg-gray-800" : "bg-gray-600"}`}
        >
          {loading === "email" ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-white text-lg font-Poppins_600SemiBold text-center">
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSignInWithSSO("oauth_google")}
          disabled={!!loading}
          className={`w-full py-4 rounded-lg flex-row items-center justify-center bg-gray-800 gap-4`}
        >
          {loading === "email" ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color={"white"} />
              <Text className="text-white text-lg font-Poppins_600SemiBold text-center">
                Continue with google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSignInWithSSO("oauth_github")}
          disabled={!!loading}
          className={`w-full py-4 rounded-lg mt-4 flex-row items-center justify-center bg-gray-800 gap-4`}
        >
          {loading === "email" ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <>
              <Ionicons name="logo-github" size={24} color={"white"} />
              <Text className="text-white text-lg font-Poppins_600SemiBold text-center">
                Continue with github
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
