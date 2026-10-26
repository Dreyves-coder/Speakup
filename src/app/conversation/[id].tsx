import { CONVERSATION_CONTENT } from "@/constants/conversation-content";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { saveSpeakingResult } from "@/services/speaking-storage";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { preferences } = useUserPreferences();
  const conversation = CONVERSATION_CONTENT[id];
  const [turnIndex, setTurnIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const turn = conversation?.turns[turnIndex];

  useEffect(() => {
    if (!turn || !preferences.soundEffects) return;
    Speech.stop();
    Speech.speak(turn.partnerLine, { language: "en-US", rate: 0.9 });
    return () => {
      Speech.stop();
    };
  }, [preferences.soundEffects, turn]);

  if (!conversation || !turn) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Conversation unavailable</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isCorrect = selected === turn.suggestedResponse;

  async function handleContinue() {
    if (!selected) return;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);

    if (preferences.hapticFeedback) {
      await Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
    }

    if (turnIndex === conversation.turns.length - 1) {
      setCorrectCount(nextCorrectCount);
      setIsComplete(true);
      Speech.stop();
      if (session) {
        await saveSpeakingResult(session.user.id, {
          correctAnswers: nextCorrectCount,
          scenarioId: conversation.id,
          totalTurns: conversation.turns.length,
        });
      }
      return;
    }

    setCorrectCount(nextCorrectCount);
    setTurnIndex((current) => current + 1);
    setSelected(null);
  }

  if (isComplete) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.result}>
          <Text style={styles.eyebrow}>CONVERSATION COMPLETE</Text>
          <Text style={styles.resultTitle}>Well spoken!</Text>
          <Text style={styles.resultText}>
            You chose {correctCount} of {conversation.turns.length} natural responses.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Back to scenarios</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>{"×"}</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{conversation.title}</Text>
            <Text style={styles.headerMeta}>
              {turnIndex + 1}/{conversation.turns.length} · {conversation.partnerRole}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.partnerCard}>
            <Text style={styles.partnerLabel}>{conversation.partnerRole.toUpperCase()}</Text>
            <Text style={styles.partnerLine}>{turn.partnerLine}</Text>
            <Pressable
              onPress={() =>
                Speech.speak(turn.partnerLine, { language: "en-US", rate: 0.9 })
              }
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>Replay audio</Text>
            </Pressable>
          </View>

          <Text style={styles.instruction}>
            Say your answer aloud, then choose the closest sentence.
          </Text>

          <View style={styles.responses}>
            {turn.responses.map((response) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: selected === response }}
                key={response}
                onPress={() => setSelected(response)}
                style={[
                  styles.response,
                  selected === response && styles.responseSelected,
                ]}
              >
                <Text
                  style={[
                    styles.responseText,
                    selected === response && styles.responseTextSelected,
                  ]}
                >
                  {response}
                </Text>
              </Pressable>
            ))}
          </View>

          {selected && (
            <View style={[styles.feedback, isCorrect ? styles.correct : styles.warning]}>
              <Text style={styles.feedbackTitle}>
                {isCorrect ? "Natural answer" : "Try this phrasing"}
              </Text>
              {!isCorrect && (
                <Text style={styles.suggestion}>{turn.suggestedResponse}</Text>
              )}
              <Text style={styles.feedbackText}>{turn.explanation}</Text>
            </View>
          )}

          <Pressable
            disabled={!selected}
            onPress={() => void handleContinue()}
            style={[
              styles.primaryButton,
              !selected && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryText}>
              {turnIndex === conversation.turns.length - 1 ? "Finish" : "Continue"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FF" },
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#FFFFFF" },
  closeText: { color: "#52637F", fontSize: 26 },
  headerCopy: { marginLeft: 13 },
  headerTitle: { color: "#132442", fontSize: 18, fontWeight: "900" },
  headerMeta: { marginTop: 3, color: "#7C8AA4", fontSize: 11 },
  content: { flex: 1, width: "100%", maxWidth: 540, alignSelf: "center", padding: 22 },
  partnerCard: { alignItems: "center", padding: 24, borderRadius: 25, backgroundColor: "#203F8E" },
  partnerLabel: { color: "#9FEAE8", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  partnerLine: { marginTop: 16, color: "#FFFFFF", fontSize: 24, lineHeight: 32, fontWeight: "900", textAlign: "center" },
  listenButton: { marginTop: 18, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.14)" },
  listenText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  instruction: { marginTop: 22, color: "#52637F", fontSize: 13, lineHeight: 19, textAlign: "center" },
  responses: { gap: 10, marginTop: 18 },
  response: { minHeight: 58, justifyContent: "center", padding: 15, borderWidth: 1, borderColor: "#DCE4EF", borderRadius: 17, backgroundColor: "#FFFFFF" },
  responseSelected: { borderColor: "#5365E8", backgroundColor: "#EDF2FF" },
  responseText: { color: "#233451", fontSize: 14, fontWeight: "700" },
  responseTextSelected: { color: "#4255C7" },
  feedback: { marginTop: 16, padding: 16, borderRadius: 17 },
  correct: { backgroundColor: "#E8F8F4" },
  warning: { backgroundColor: "#FFF4E8" },
  feedbackTitle: { color: "#193551", fontSize: 14, fontWeight: "900" },
  suggestion: { marginTop: 7, color: "#5363D5", fontSize: 14, fontWeight: "800" },
  feedbackText: { marginTop: 6, color: "#63738D", fontSize: 12, lineHeight: 18 },
  primaryButton: { minHeight: 56, alignItems: "center", justifyContent: "center", marginTop: 22, paddingHorizontal: 22, borderRadius: 17, backgroundColor: "#5365E8" },
  primaryButtonDisabled: { backgroundColor: "#C8D1E0" },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  title: { color: "#132442", fontSize: 24, fontWeight: "900" },
  result: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  eyebrow: { color: "#168E87", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  resultTitle: { marginTop: 10, color: "#10203E", fontSize: 32, fontWeight: "900" },
  resultText: { maxWidth: 340, marginTop: 10, color: "#687996", fontSize: 15, lineHeight: 22, textAlign: "center" },
});
