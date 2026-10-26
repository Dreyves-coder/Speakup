import { TabPageHeader } from "@/components/tab-page-header";
import { TabScreen } from "@/components/tab-screen";
import { LESSON_CONTENT } from "@/constants/lesson-content";
import { LEARN_FILTERS, LESSONS } from "@/constants/lessons";
import { useAuth } from "@/hooks/use-auth";
import { getLessons } from "@/services/learning-api";
import type { Lesson, LessonCategory } from "@/types/lesson";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CATEGORY_COLORS: Record<LessonCategory, string> = {
  vocabulary: "#14AFA1",
  grammar: "#7659E8",
  listening: "#3183EB",
};

const CATEGORY_BACKGROUNDS: Record<LessonCategory, string> = {
  vocabulary: "#E5F8F5",
  grammar: "#F0ECFF",
  listening: "#E8F2FF",
};

type LearnFilter = (typeof LEARN_FILTERS)[number]["value"];

function openLesson(lesson: Lesson) {
  if (lesson.status === "locked") {
    return;
  }

  if (!(lesson.id in LESSON_CONTENT)) return;

  router.push({
    pathname: "/lesson/[id]",
    params: { id: lesson.id },
  });
}

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const categoryColor = CATEGORY_COLORS[lesson.category];
  const categoryBackground = CATEGORY_BACKGROUNDS[lesson.category];
  const progressWidth = `${lesson.progress * 100}%` as `${number}%`;
  const isLocked = lesson.status === "locked";
  const isCompleted = lesson.status === "completed";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={() => openLesson(lesson)}
      style={({ pressed }) => [
        styles.lessonCard,
        isLocked && styles.lessonCardLocked,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.lessonNumber, { backgroundColor: categoryBackground }]}>
        <Text style={[styles.lessonNumberText, { color: categoryColor }]}>
          {isCompleted ? "\u2713" : index + 1}
        </Text>
      </View>

      <View style={styles.lessonCopy}>
        <View style={styles.lessonHeadingRow}>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
          {isLocked && <Text style={styles.lockedLabel}>LOCKED</Text>}
        </View>
        <Text style={styles.lessonDescription} numberOfLines={2}>
          {lesson.description}
        </Text>
        <View style={styles.lessonMeta}>
          <Text style={[styles.category, { color: categoryColor }]}>
            {lesson.category.toUpperCase()}
          </Text>
          <Text style={styles.metaText}>
            {lesson.durationMinutes} min / {lesson.exerciseCount} exercises
          </Text>
        </View>

        {!isLocked && (
          <View style={styles.cardProgressTrack}>
            <View
              style={[
                styles.cardProgressValue,
                { backgroundColor: categoryColor, width: progressWidth },
              ]}
            />
          </View>
        )}
      </View>

      <Text style={styles.chevron}>{isLocked ? "" : "\u203A"}</Text>
    </Pressable>
  );
}

export default function LearnScreen() {
  const { session } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([...LESSONS]);
  const [selectedFilter, setSelectedFilter] = useState<LearnFilter>("all");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (session) {
        void getLessons(session.accessToken, session.user.id).then((items) => {
          if (isActive) setLessons(items);
        });
      }

      return () => {
        isActive = false;
      };
    }, [session]),
  );

  const filteredLessons = useMemo(
    () =>
      selectedFilter === "all"
        ? lessons
        : lessons.filter((lesson) => lesson.category === selectedFilter),
    [lessons, selectedFilter],
  );
  const completedCount = lessons.filter(
    (lesson) => lesson.status === "completed",
  ).length;
  const completionRate =
    lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100);
  const featuredLesson =
    lessons.find((lesson) => lesson.id === "everyday-questions") ?? LESSONS[1];

  return (
    <TabScreen>
        <TabPageHeader
          eyebrow="LEARNING PATH"
          title="Learn"
          right={<View style={styles.streakPill}>
            <Text style={styles.streakValue}>3</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>}
        />

        <View style={styles.overviewCard}>
          <View style={styles.overviewTopRow}>
            <View>
              <Text style={styles.overviewLabel}>{"TODAY'S PROGRESS"}</Text>
              <Text style={styles.overviewTitle}>
                {completedCount} of {lessons.length} lessons
              </Text>
            </View>
            <Text style={styles.overviewPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.overviewTrack}>
            <View
              style={[
                styles.overviewValue,
                { width: `${completionRate}%` as `${number}%` },
              ]}
            />
          </View>
          <Text style={styles.overviewCaption}>
            Your completed lessons are saved automatically
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue learning</Text>
          <Text style={styles.sectionMeta}>
            {Math.round(featuredLesson.progress * 100)}%
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => openLesson(featuredLesson)}
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>GRAMMAR</Text>
          </View>
          <Text style={styles.featuredTitle}>Everyday questions</Text>
          <Text style={styles.featuredDescription}>
            {"Pick up where you stopped and finish today's grammar practice."}
          </Text>
          <View style={styles.featuredFooter}>
            <View style={styles.featuredProgressTrack}>
              <View
                style={[
                  styles.featuredProgressValue,
                  {
                    width: `${featuredLesson.progress * 100}%` as `${number}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.continueCircle}>
              <Text style={styles.continueArrow}>{"\u2192"}</Text>
            </View>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Explore lessons</Text>
        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {LEARN_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={filter.value}
                onPress={() => setSelectedFilter(filter.value)}
                style={({ pressed }) => [
                  styles.filter,
                  isSelected && styles.filterSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.lessonList}>
          {filteredLessons.map((lesson) => (
            <LessonCard
              index={lessons.findIndex((item) => item.id === lesson.id)}
              key={lesson.id}
              lesson={lesson}
            />
          ))}
        </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  streakPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#FFF0E7",
  },
  streakValue: { color: "#E96E43", fontSize: 16, fontWeight: "900" },
  streakLabel: { color: "#A35539", fontSize: 11, fontWeight: "700" },
  overviewCard: {
    marginTop: 23,
    padding: 17,
    borderWidth: 1,
    borderColor: "#DFE7F4",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  overviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overviewLabel: {
    color: "#8291AE",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  overviewTitle: { marginTop: 4, color: "#172746", fontSize: 17, fontWeight: "800" },
  overviewPercent: { color: "#188F96", fontSize: 17, fontWeight: "900" },
  overviewTrack: {
    height: 7,
    marginTop: 15,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#E8EDF5",
  },
  overviewValue: {
    width: "33%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#35C7BE",
  },
  overviewCaption: { marginTop: 9, color: "#7786A3", fontSize: 11 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 11,
  },
  sectionTitle: { color: "#10203E", fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: "#755AE2", fontSize: 12, fontWeight: "800" },
  featuredCard: {
    padding: 19,
    borderRadius: 23,
    backgroundColor: "#624FDE",
    experimental_backgroundImage:
      "linear-gradient(135deg, #3D7DEB 0%, #6256DF 55%, #7F4FD4 100%)",
    shadowColor: "#4659CA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
  },
  featuredBadgeText: {
    color: "#F2F4FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  featuredTitle: { marginTop: 14, color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
  featuredDescription: {
    maxWidth: 330,
    marginTop: 7,
    color: "#E3E8FF",
    fontSize: 13,
    lineHeight: 19,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 18,
  },
  featuredProgressTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  featuredProgressValue: {
    width: "45%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  continueCircle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  continueArrow: { color: "#5360D8", fontSize: 19, fontWeight: "800" },
  filterScroll: { marginHorizontal: -20, marginTop: 13, marginBottom: 14 },
  filters: { gap: 9, paddingHorizontal: 20 },
  filter: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DEE6F2",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  filterSelected: { borderColor: "#3E7AE6", backgroundColor: "#3E7AE6" },
  filterText: { color: "#6D7D9B", fontSize: 12, fontWeight: "700" },
  filterTextSelected: { color: "#FFFFFF" },
  lessonList: { gap: 11 },
  lessonCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  lessonCardLocked: { opacity: 0.58, backgroundColor: "#F0F3F8" },
  lessonNumber: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  lessonNumberText: { fontSize: 16, fontWeight: "900" },
  lessonCopy: { flex: 1, marginLeft: 12 },
  lessonHeadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lessonTitle: { flex: 1, color: "#172746", fontSize: 15, fontWeight: "800" },
  lockedLabel: {
    color: "#8491A8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  lessonDescription: {
    marginTop: 4,
    color: "#7786A2",
    fontSize: 11,
    lineHeight: 16,
  },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 },
  category: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  metaText: { color: "#8A98B0", fontSize: 9 },
  cardProgressTrack: {
    height: 4,
    marginTop: 8,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "#E9EDF5",
  },
  cardProgressValue: { height: "100%", borderRadius: 2 },
  chevron: { width: 18, color: "#7082A4", fontSize: 25, textAlign: "right" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
