import { LESSON_CONTENT, STATIC_LESSON_IDS } from "@/constants/lesson-content";
import { useAuth } from "@/hooks/use-auth";
import { recordLessonCompletion } from "@/services/learning-api";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function generateStaticParams() {
  return STATIC_LESSON_IDS;
}

export default function LessonPlayerScreen() {
  const { session } = useAuth();
  const { preferences } = useUserPreferences();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSON_CONTENT[id];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "synced" | "offline"
  >("idle");
  const startedAt = useRef(0);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.missingScreen}>
        <Text style={styles.missingTitle}>Lesson unavailable</Text>
        <Pressable onPress={() => router.back()} style={styles.missingButton}>
          <Text style={styles.missingButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const exercise = lesson.exercises[currentIndex];
  const isCorrect = selectedAnswer === exercise.correctAnswer;
  const progress = `${((currentIndex + 1) / lesson.exercises.length) * 100}%` as `${number}%`;

  function resetLesson() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setCorrectCount(0);
    setIsComplete(false);
    setSaveStatus("idle");
    startedAt.current = Date.now();
  }

  function handleContinue() {
    if (!selectedAnswer) {
      return;
    }

    if (startedAt.current === 0) {
      startedAt.current = Date.now();
    }

    if (!isChecked) {
      setIsChecked(true);
      if (selectedAnswer === exercise.correctAnswer) {
        setCorrectCount((count) => count + 1);
      }
      if (preferences.hapticFeedback) {
        void Haptics.notificationAsync(
          selectedAnswer === exercise.correctAnswer
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }
      return;
    }

    if (currentIndex === lesson.exercises.length - 1) {
      setIsComplete(true);
      if (session) {
        setSaveStatus("saving");
        void recordLessonCompletion(session.accessToken, session.user.id, {
          correctAnswers: correctCount,
          durationMinutes: Math.max(
            1,
            Math.ceil((Date.now() - startedAt.current) / 60_000),
          ),
          lessonId: lesson.id,
          totalQuestions: lesson.exercises.length,
        }).then(setSaveStatus);
      }
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
    setIsChecked(false);
  }

  if (isComplete) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultContent}>
            <View style={styles.resultRing}>
              <View style={styles.resultCircle}>
                <Text style={styles.resultCheck}>{"\u2713"}</Text>
              </View>
            </View>
            <Text style={styles.resultEyebrow}>LESSON COMPLETE</Text>
            <Text style={styles.resultTitle}>Nice work!</Text>
            <Text style={styles.resultDescription}>
              You answered {correctCount} of {lesson.exercises.length} questions correctly.
            </Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>
                {Math.round((correctCount / lesson.exercises.length) * 100)}%
              </Text>
              <Text style={styles.scoreLabel}>Accuracy</Text>
            </View>

            {saveStatus !== "idle" && (
              <Text style={styles.saveStatus}>
                {saveStatus === "saving"
                  ? "Saving progress..."
                  : saveStatus === "synced"
                    ? "Progress synced"
                    : "Saved offline - sync will retry later"}
              </Text>
            )}

            <View style={styles.resultActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Back to lessons</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={resetLesson}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close lesson"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Text style={styles.closeText}>{"\u00D7"}</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressValue, { width: progress }]} />
          </View>
          <Text style={styles.questionCount}>
            {currentIndex + 1}/{lesson.exercises.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.lessonHeading}>
              <Text style={styles.category}>{lesson.category.toUpperCase()}</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.instruction}>{exercise.instruction}</Text>
              <Text style={styles.prompt}>{exercise.prompt}</Text>
            </View>

            <View style={styles.options}>
              {exercise.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === exercise.correctAnswer;
                const showCorrect = isChecked && isCorrectOption;
                const showIncorrect = isChecked && isSelected && !isCorrectOption;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    disabled={isChecked}
                    key={option}
                    onPress={() => setSelectedAnswer(option)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      showCorrect && styles.optionCorrect,
                      showIncorrect && styles.optionIncorrect,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                        showCorrect && styles.optionLetterCorrect,
                        showIncorrect && styles.optionLetterIncorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          isSelected && styles.optionLetterTextSelected,
                        ]}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {showCorrect && <Text style={styles.answerMark}>{"\u2713"}</Text>}
                    {showIncorrect && <Text style={styles.incorrectMark}>{"\u00D7"}</Text>}
                  </Pressable>
                );
              })}
            </View>

            {isChecked && (
              <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                <Text style={[styles.feedbackTitle, isCorrect ? styles.correctText : styles.incorrectText]}>
                  {isCorrect ? "Great answer!" : "Almost there"}
                </Text>
                <Text style={styles.feedbackText}>{exercise.explanation}</Text>
              </View>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedAnswer === null }}
            disabled={selectedAnswer === null}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.primaryButton,
              selectedAnswer === null && styles.primaryButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isChecked
                ? currentIndex === lesson.exercises.length - 1
                  ? "See results"
                  : "Next question"
                : "Check answer"}
            </Text>
            <Text style={styles.buttonArrow}>{"\u2192"}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FF" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DEE6F2",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  closeText: { color: "#4D5E7E", fontSize: 26, lineHeight: 28, fontWeight: "500" },
  progressTrack: {
    flex: 1,
    height: 7,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#DFE6F1",
  },
  progressValue: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#36C8BF",
  },
  questionCount: { color: "#7585A2", fontSize: 13, fontWeight: "800" },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 22,
  },
  lessonHeading: { marginBottom: 22 },
  category: {
    color: "#6C56D9",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  lessonTitle: { marginTop: 5, color: "#132442", fontSize: 18, fontWeight: "800" },
  questionCard: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    shadowColor: "#28466F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  instruction: {
    color: "#7787A5",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  prompt: {
    marginTop: 18,
    color: "#10203E",
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "900",
    textAlign: "center",
  },
  options: { gap: 11, marginTop: 24 },
  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DCE4EF",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  optionSelected: { borderColor: "#4B7EE7", backgroundColor: "#EDF3FF" },
  optionCorrect: { borderColor: "#22A995", backgroundColor: "#E9F9F5" },
  optionIncorrect: { borderColor: "#E86875", backgroundColor: "#FFF0F2" },
  optionLetter: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#EEF2F8",
  },
  optionLetterSelected: { backgroundColor: "#477BE6" },
  optionLetterCorrect: { backgroundColor: "#22A995" },
  optionLetterIncorrect: { backgroundColor: "#E86875" },
  optionLetterText: { color: "#60708E", fontSize: 14, fontWeight: "900" },
  optionLetterTextSelected: { color: "#FFFFFF" },
  optionText: { flex: 1, marginLeft: 14, color: "#1C2D4C", fontSize: 16, fontWeight: "700" },
  answerMark: { color: "#169886", fontSize: 20, fontWeight: "900" },
  incorrectMark: { color: "#D95665", fontSize: 21, fontWeight: "700" },
  feedback: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderRadius: 18,
  },
  feedbackCorrect: { borderColor: "#A5E4D8", backgroundColor: "#E9F9F5" },
  feedbackIncorrect: { borderColor: "#F0BBC1", backgroundColor: "#FFF0F2" },
  feedbackTitle: { fontSize: 15, fontWeight: "900" },
  correctText: { color: "#168B7C" },
  incorrectText: { color: "#C84C5B" },
  feedbackText: { marginTop: 5, color: "#52637F", fontSize: 13, lineHeight: 19 },
  primaryButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    marginTop: 30,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#5365E8",
    experimental_backgroundImage:
      "linear-gradient(100deg, #3B82F6 0%, #7458F5 58%, #8B5CF6 100%)",
  },
  primaryButtonDisabled: {
    backgroundColor: "#CAD3E2",
    experimental_backgroundImage: "linear-gradient(#CAD3E2, #CAD3E2)",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  buttonArrow: { color: "#FFFFFF", fontSize: 21, fontWeight: "700" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.988 }] },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  resultRing: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 58,
    backgroundColor: "#DDF7F4",
  },
  resultCircle: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 43,
    backgroundColor: "#31BCAE",
  },
  resultCheck: { color: "#FFFFFF", fontSize: 43, lineHeight: 48, fontWeight: "900" },
  resultEyebrow: {
    marginTop: 25,
    color: "#168E87",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  resultTitle: { marginTop: 8, color: "#10203E", fontSize: 34, fontWeight: "900" },
  resultDescription: {
    maxWidth: 340,
    marginTop: 10,
    color: "#687996",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  scoreCard: {
    width: 150,
    marginTop: 26,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEE6F2",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  scoreValue: { color: "#5263DD", fontSize: 28, fontWeight: "900" },
  scoreLabel: { marginTop: 4, color: "#7E8CA6", fontSize: 12, fontWeight: "700" },
  saveStatus: {
    marginTop: 12,
    color: "#687996",
    fontSize: 12,
    fontWeight: "700",
  },
  resultActions: { width: "100%", maxWidth: 420, marginTop: 34, gap: 10 },
  retryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  retryButtonText: { color: "#5263C9", fontSize: 14, fontWeight: "800" },
  missingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F8FF",
  },
  missingTitle: { color: "#10203E", fontSize: 26, fontWeight: "900" },
  missingButton: {
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#5365E8",
  },
  missingButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
