import { TabScreen } from "@/components/tab-screen";
import { LESSONS } from "@/constants/lessons";
import { ENGLISH_LEVELS } from "@/constants/user-preferences";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { getLessons, getProgress } from "@/services/learning-api";
import type { Lesson } from "@/types/lesson";
import type { ProgressSnapshot } from "@/types/learning-progress";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { session } = useAuth();
  const { preferences } = useUserPreferences();
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([...LESSONS]);
  const level = ENGLISH_LEVELS[preferences.englishLevel];
  const firstName = preferences.displayName.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();
  const levelPercent = Math.round((progress?.levelProgress ?? 0) * 100);
  const featuredLesson =
    lessons.find((lesson) => lesson.status === "available") ??
    lessons.find((lesson) => lesson.status === "completed") ??
    LESSONS[0];
  const skills = (progress?.skills ?? []).map((skill) => ({
    color: {
      vocabulary: "#16B8A7",
      grammar: "#7659E8",
      listening: "#3183EB",
    }[skill.category],
    detail: `${skill.completed}/${skill.total} lessons`,
    name:
      skill.category.charAt(0).toUpperCase() + skill.category.slice(1),
    progress: skill.progress,
  }));

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (session) {
        void Promise.all([
          getProgress(session.accessToken, session.user.id),
          getLessons(session.accessToken, session.user.id),
        ]).then(([nextProgress, nextLessons]) => {
          if (!isActive) return;
          setProgress(nextProgress);
          setLessons(nextLessons);
        });
      }

      return () => {
        isActive = false;
      };
    }, [session]),
  );

  return (
    <TabScreen>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Ready to level up, {firstName}?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelTopRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{level.code}</Text>
            </View>
            <View style={styles.levelCopy}>
              <Text style={styles.cardLabel}>CURRENT LEVEL</Text>
              <Text style={styles.levelTitle}>{level.label}</Text>
            </View>
            <Text style={styles.levelPercent}>{levelPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressValue,
                { width: `${levelPercent}%` as `${number}%` },
              ]}
            />
          </View>
          <Text style={styles.progressCaption}>
            {"Keep going - you're building momentum."}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.streakIcon]}>
              <Text style={styles.statIconText}>3</Text>
            </View>
            <View>
              <Text style={styles.statValue}>
                {progress?.streakDays ?? 0} days
              </Text>
              <Text style={styles.statLabel}>Current streak</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.xpIcon]}>
              <Text style={styles.statIconText}>XP</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{progress?.totalXp ?? 0} XP</Text>
              <Text style={styles.statLabel}>Total earned</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{"Today's lesson"}</Text>
          <Text style={styles.sectionMeta}>{preferences.dailyGoal} min goal</Text>
        </View>

        <View style={styles.lessonCard}>
          <View style={styles.lessonPill}>
            <Text style={styles.lessonPillText}>LESSON 1</Text>
          </View>
          <Text style={styles.lessonTitle}>{featuredLesson.title}</Text>
          <Text style={styles.lessonDescription}>
            {featuredLesson.description}
          </Text>
          <View style={styles.lessonFooter}>
            <Text style={styles.lessonDetails}>
              {featuredLesson.exerciseCount} short exercises
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/lesson/[id]",
                  params: { id: featuredLesson.id },
                })
              }
              style={({ pressed }) => [
                styles.lessonButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.lessonButtonText}>Start lesson</Text>
              <Text style={styles.lessonArrow}>{"\u2192"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your skills</Text>
          <Text style={styles.sectionMeta}>This week</Text>
        </View>

        <View style={styles.skillGrid}>
          {skills.map((skill) => (
            <Pressable
              accessibilityRole="button"
              key={skill.name}
              onPress={() => router.push("/learn")}
              style={({ pressed }) => [
                styles.skillCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.skillTopRow}>
                <View
                  style={[styles.skillDot, { backgroundColor: skill.color }]}
                />
                <Text style={[styles.skillPercent, { color: skill.color }]}>
                  {Math.round(skill.progress * 100)}%
                </Text>
              </View>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillDetail}>{skill.detail}</Text>
              <View style={styles.skillTrack}>
                <View
                  style={[
                    styles.skillValue,
                    {
                      backgroundColor: skill.color,
                      width: `${skill.progress * 100}%`,
                    },
                  ]}
                />
              </View>
            </Pressable>
          ))}
        </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { color: "#6B7A99", fontSize: 14, fontWeight: "600" },
  name: {
    marginTop: 3,
    color: "#0D1D3D",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#665CF2",
    experimental_backgroundImage:
      "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
  },
  avatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  levelCard: {
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DFE7F4",
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    shadowColor: "#234578",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 3,
  },
  levelTopRow: { flexDirection: "row", alignItems: "center" },
  levelBadge: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#E7F9FA",
  },
  levelBadgeText: { color: "#148A96", fontSize: 17, fontWeight: "900" },
  levelCopy: { flex: 1, marginLeft: 13 },
  cardLabel: {
    color: "#8898B6",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  levelTitle: { marginTop: 3, color: "#152644", fontSize: 18, fontWeight: "800" },
  levelPercent: { color: "#3477E9", fontSize: 16, fontWeight: "900" },
  progressTrack: {
    height: 8,
    marginTop: 17,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#E8EDF6",
  },
  progressValue: {
    width: "35%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#37C9C3",
  },
  progressCaption: { marginTop: 10, color: "#71809E", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  statCard: {
    flex: 1,
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F3",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  statIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderRadius: 13,
  },
  streakIcon: { backgroundColor: "#FFF0E7" },
  xpIcon: { backgroundColor: "#EFEAFF" },
  statIconText: { color: "#6254DF", fontSize: 13, fontWeight: "900" },
  statValue: { color: "#172746", fontSize: 14, fontWeight: "800" },
  statLabel: { marginTop: 2, color: "#8492AC", fontSize: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 12,
  },
  sectionTitle: { color: "#10203E", fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: "#71809E", fontSize: 12, fontWeight: "600" },
  lessonCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#3B6FEB",
    experimental_backgroundImage:
      "linear-gradient(135deg, #2E88F0 0%, #585DEB 52%, #7D4FDB 100%)",
    shadowColor: "#395BD2",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.23,
    shadowRadius: 18,
    elevation: 6,
  },
  lessonPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
  },
  lessonPillText: {
    color: "#EAFDFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  lessonTitle: { marginTop: 16, color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  lessonDescription: {
    maxWidth: 330,
    marginTop: 8,
    color: "#E2E9FF",
    fontSize: 14,
    lineHeight: 20,
  },
  lessonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  lessonDetails: { flex: 1, color: "#D8E5FF", fontSize: 12, fontWeight: "600" },
  lessonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  lessonButtonText: { color: "#4058CC", fontSize: 13, fontWeight: "800" },
  lessonArrow: { color: "#4058CC", fontSize: 17, fontWeight: "700" },
  skillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  skillCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: 145,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E1E8F3",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  skillTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skillDot: { width: 10, height: 10, borderRadius: 5 },
  skillPercent: { fontSize: 12, fontWeight: "900" },
  skillName: { marginTop: 14, color: "#172746", fontSize: 15, fontWeight: "800" },
  skillDetail: { marginTop: 3, color: "#8997B0", fontSize: 11 },
  skillTrack: {
    height: 5,
    marginTop: 13,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#E9EDF5",
  },
  skillValue: { height: "100%", borderRadius: 3 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
