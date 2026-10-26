import { TabPageHeader } from "@/components/tab-page-header";
import { TabScreen } from "@/components/tab-screen";
import { ENGLISH_LEVELS } from "@/constants/user-preferences";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { getProgress } from "@/services/learning-api";
import type { ProgressSnapshot } from "@/types/learning-progress";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function ActivityChart({
  activity,
}: {
  activity: ProgressSnapshot["activity"];
}) {
  const maximum = Math.max(1, ...activity.map((item) => item.minutes));

  return (
    <View style={styles.chart}>
      {activity.map((item) => {
        const barHeight = item.minutes === 0 ? 5 : (item.minutes / maximum) * 92;

        return (
          <View
            accessibilityLabel={`${item.label}: ${item.minutes} minutes`}
            key={item.label}
            style={styles.chartColumn}
          >
            <Text style={styles.chartValue}>{item.minutes || "-"}</Text>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  { height: barHeight },
                  item.minutes === 0 && styles.emptyBar,
                ]}
              />
            </View>
            <Text style={styles.chartLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressScreen() {
  const { session } = useAuth();
  const { preferences } = useUserPreferences();
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const level = ENGLISH_LEVELS[preferences.englishLevel];
  const levelPercent = Math.round((progress?.levelProgress ?? 0) * 100);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (session) {
        void getProgress(session.accessToken, session.user.id).then((snapshot) => {
          if (isActive) setProgress(snapshot);
        });
      }

      return () => {
        isActive = false;
      };
    }, [session]),
  );

  const summary = useMemo(
    () => [
      {
        color: "#337DE8",
        detail: "total",
        label: "Lessons",
        value: String(progress?.lessonsCompleted ?? 0),
      },
      {
        color: "#16A99D",
        detail: "minutes",
        label: "Learning time",
        value: String(progress?.learningMinutes ?? 0),
      },
      {
        color: "#E5744D",
        detail: "average",
        label: "Accuracy",
        value: `${progress?.accuracy ?? 0}%`,
      },
      {
        color: "#7458DD",
        detail: "earned",
        label: "XP",
        value: String(progress?.totalXp ?? 0),
      },
    ],
    [progress],
  );

  return (
    <TabScreen>
        <TabPageHeader
          eyebrow="YOUR JOURNEY"
          title="Progress"
          right={<View style={styles.levelPill}>
            <Text style={styles.levelValue}>{level.code}</Text>
            <Text style={styles.levelLabel}>{level.label}</Text>
          </View>}
        />

        <View style={styles.levelCard}>
          <View style={styles.levelHeading}>
            <View>
              <Text style={styles.cardEyebrow}>LEVEL PROGRESS</Text>
              <Text style={styles.levelTitle}>Building your foundation</Text>
            </View>
            <Text style={styles.levelPercent}>{levelPercent}%</Text>
          </View>
          <View style={styles.levelTrack}>
            <View
              style={[
                styles.levelTrackValue,
                { width: `${levelPercent}%` as `${number}%` },
              ]}
            />
          </View>
          <View style={styles.levelFooter}>
            <Text style={styles.levelFooterText}>
              {level.code} {level.label}
            </Text>
            <Text style={styles.levelFooterText}>
              {progress?.lessonsCompleted ?? 0} lessons completed
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          {summary.map((metric) => (
            <View key={metric.label} style={styles.summaryCard}>
              <View style={[styles.summaryDot, { backgroundColor: metric.color }]} />
              <Text style={styles.summaryValue}>{metric.value}</Text>
              <Text style={styles.summaryLabel}>{metric.label}</Text>
              <Text style={styles.summaryDetail}>{metric.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning activity</Text>
          <Text style={styles.sectionMeta}>Last 7 days</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeading}>
            <View>
              <Text style={styles.chartTotal}>
                {progress?.learningMinutes ?? 0} min
              </Text>
              <Text style={styles.chartCaption}>Total learning time</Text>
            </View>
            <Text style={styles.sectionMeta}>
              {progress?.streakDays ?? 0} day streak
            </Text>
          </View>
          <ActivityChart activity={progress?.activity ?? []} />
        </View>

        <View style={styles.sectionHeaderSimple}>
          <Text style={styles.sectionTitle}>Skills overview</Text>
          <Text style={styles.sectionMeta}>Completed lessons</Text>
        </View>

        <View style={styles.skillsCard}>
          {(progress?.skills ?? []).map((skill, index, skills) => {
            const width = `${skill.progress * 100}%` as `${number}%`;
            const skillColor = {
              vocabulary: "#16B8A7",
              grammar: "#7659E8",
              listening: "#3183EB",
            }[skill.category];

            return (
              <View key={skill.category}>
                <View style={styles.skillHeading}>
                  <View style={styles.skillNameRow}>
                    <View
                      style={[styles.skillDot, { backgroundColor: skillColor }]}
                    />
                    <Text style={styles.skillName}>
                      {skill.category.charAt(0).toUpperCase() +
                        skill.category.slice(1)}
                    </Text>
                  </View>
                  <Text style={[styles.skillPercent, { color: skillColor }]}>
                    {Math.round(skill.progress * 100)}%
                  </Text>
                </View>
                <View style={styles.skillTrack}>
                  <View
                    style={[
                      styles.skillTrackValue,
                      { backgroundColor: skillColor, width },
                    ]}
                  />
                </View>
                {index < skills.length - 1 && (
                  <View style={styles.skillDivider} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeaderSimple}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionMeta}>Synced + offline</Text>
        </View>

        <View style={styles.activityList}>
          {progress?.recentActivity.length ? (
            progress.recentActivity.map((activity) => (
              <View key={activity.lessonId} style={styles.activityRow}>
                <View
                  style={[styles.activityMark, { backgroundColor: "#7659E8" }]}
                />
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{activity.lessonTitle}</Text>
                  <Text style={styles.activityDetail}>
                    {new Date(activity.completedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.activityResult}>
                  {activity.correctAnswers}/{activity.totalQuestions}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                Complete a lesson to start your history.
              </Text>
            </View>
          )}
        </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  levelPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#E8F7F7",
  },
  levelValue: { color: "#14878D", fontSize: 16, fontWeight: "900" },
  levelLabel: { color: "#567C85", fontSize: 10, fontWeight: "700" },
  levelCard: {
    marginTop: 23,
    padding: 18,
    borderRadius: 23,
    backgroundColor: "#213D8B",
    experimental_backgroundImage:
      "linear-gradient(135deg, #1B3C85 0%, #3C55BB 55%, #704ACB 100%)",
    shadowColor: "#28438C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  levelHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardEyebrow: {
    color: "#BFD8FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  levelTitle: { marginTop: 5, color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  levelPercent: { color: "#8FF0ED", fontSize: 20, fontWeight: "900" },
  levelTrack: {
    height: 8,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  levelTrackValue: {
    width: "35%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#63E5E2",
  },
  levelFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 9 },
  levelFooterText: { color: "#D5E1FF", fontSize: 10, fontWeight: "600" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11, marginTop: 13 },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: 145,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
  },
  summaryDot: { width: 9, height: 9, borderRadius: 5 },
  summaryValue: { marginTop: 11, color: "#142543", fontSize: 21, fontWeight: "900" },
  summaryLabel: { marginTop: 2, color: "#4E5F7D", fontSize: 12, fontWeight: "700" },
  summaryDetail: { marginTop: 2, color: "#8A98B0", fontSize: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 12,
  },
  sectionHeaderSimple: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 12,
  },
  sectionTitle: { color: "#10203E", fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: "#7E8DA8", fontSize: 11, fontWeight: "600" },
  periodControl: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 11,
    backgroundColor: "#E8EDF5",
  },
  periodButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  periodButtonSelected: { backgroundColor: "#FFFFFF" },
  periodText: { color: "#7C8AA4", fontSize: 10, fontWeight: "700" },
  periodTextSelected: { color: "#315FC1" },
  chartCard: {
    padding: 17,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  chartHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chartTotal: { color: "#142543", fontSize: 20, fontWeight: "900" },
  chartCaption: { marginTop: 3, color: "#8492AA", fontSize: 10 },
  trendPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#E4F8F4",
  },
  trendText: { color: "#16978B", fontSize: 11, fontWeight: "900" },
  chart: {
    height: 144,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
  },
  chartColumn: { flex: 1, alignItems: "center" },
  chartValue: { height: 17, color: "#7D8AA3", fontSize: 8, fontWeight: "700" },
  barArea: { height: 94, justifyContent: "flex-end" },
  bar: {
    width: 18,
    borderRadius: 6,
    backgroundColor: "#4B79E3",
    experimental_backgroundImage:
      "linear-gradient(180deg, #50CEC8 0%, #4B79E3 100%)",
  },
  emptyBar: { backgroundColor: "#E2E7EF", experimental_backgroundImage: "linear-gradient(#E2E7EF, #E2E7EF)" },
  chartLabel: { marginTop: 7, color: "#7C89A1", fontSize: 9, fontWeight: "700" },
  skillsCard: {
    padding: 17,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  skillHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skillNameRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  skillDot: { width: 9, height: 9, borderRadius: 5 },
  skillName: { color: "#243553", fontSize: 13, fontWeight: "800" },
  skillPercent: { fontSize: 12, fontWeight: "900" },
  skillTrack: {
    height: 6,
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#E9EDF5",
  },
  skillTrackValue: { height: "100%", borderRadius: 3 },
  skillDivider: { height: 1, marginVertical: 15, backgroundColor: "#EDF1F6" },
  activityList: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  activityRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },
  activityMark: { width: 11, height: 42, borderRadius: 6 },
  activityCopy: { flex: 1, marginLeft: 12 },
  activityTitle: { color: "#1B2C4A", fontSize: 13, fontWeight: "800" },
  activityDetail: { marginTop: 3, color: "#8794AA", fontSize: 10 },
  activityResult: { color: "#5363BC", fontSize: 12, fontWeight: "900" },
  emptyActivity: { padding: 20 },
  emptyActivityText: {
    color: "#7E8DA8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
