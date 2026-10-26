import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{"‹"}</Text>
          </Pressable>
          <Text style={styles.title}>Help & privacy</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.heading}>Need help?</Text>
            <Text style={styles.body}>
              If a lesson, account or synchronization issue occurs, contact the
              SpeakUp team and include the email used for your account.
            </Text>
            <Pressable
              onPress={() =>
                void Linking.openURL("mailto:support@speakup.app?subject=SpeakUp support")
              }
              style={styles.contactButton}
            >
              <Text style={styles.contactText}>Contact support</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Privacy</Text>
            <Text style={styles.body}>
              SpeakUp stores your account, learning preferences and lesson
              results to provide progress synchronization. Your password is
              stored only as a secure cryptographic hash. Local progress remains
              on your device when the API is unavailable.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Terms</Text>
            <Text style={styles.body}>
              SpeakUp is an educational tool. Exercises and automated feedback
              support practice but do not guarantee a certification level.
              Users remain responsible for keeping their account credentials
              private.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FF" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#FFFFFF" },
  backText: { color: "#52637F", fontSize: 30, lineHeight: 32 },
  title: { marginLeft: 14, color: "#132442", fontSize: 22, fontWeight: "900" },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", gap: 14, padding: 22, paddingBottom: 40 },
  card: { padding: 20, borderWidth: 1, borderColor: "#DFE7F2", borderRadius: 21, backgroundColor: "#FFFFFF" },
  heading: { color: "#172746", fontSize: 18, fontWeight: "900" },
  body: { marginTop: 9, color: "#687996", fontSize: 13, lineHeight: 21 },
  contactButton: { alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: "#5365E8" },
  contactText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
