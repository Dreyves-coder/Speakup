import { TabPageHeader } from "@/components/tab-page-header";
import { TabScreen } from "@/components/tab-screen";
import {
  CONVERSATION_FILTERS,
  CONVERSATION_SCENARIOS,
} from "@/constants/conversations";
import { useAuth } from "@/hooks/use-auth";
import { loadSpeakingResults } from "@/services/speaking-storage";
import type {
  ConversationCategory,
  ConversationScenario,
} from "@/types/conversation";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CATEGORY_LABELS: Record<ConversationCategory, string> = {
  "daily-life": "Daily life",
  travel: "Travel",
  work: "Work",
  developers: "Developers",
};

const CATEGORY_COLORS: Record<ConversationCategory, string> = {
  "daily-life": "#159C91",
  travel: "#2E78E5",
  work: "#7155D9",
  developers: "#D66C47",
};

const CATEGORY_BACKGROUNDS: Record<ConversationCategory, string> = {
  "daily-life": "#E3F8F4",
  travel: "#E7F1FF",
  work: "#F0ECFF",
  developers: "#FFF0E8",
};

const WAVEFORM_HEIGHTS = [18, 32, 46, 27, 39, 22, 34];

type SpeakFilter = (typeof CONVERSATION_FILTERS)[number]["value"];

function openScenario(scenario: ConversationScenario) {
  if (scenario.status === "locked") {
    return;
  }

  router.push({
    pathname: "/conversation/[id]",
    params: { id: scenario.id },
  });
}

function ScenarioCard({ scenario }: { scenario: ConversationScenario }) {
  const isLocked = scenario.status === "locked";
  const categoryColor = CATEGORY_COLORS[scenario.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={() => openScenario(scenario)}
      style={({ pressed }) => [
        styles.scenarioCard,
        isLocked && styles.scenarioCardLocked,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.scenarioIcon,
          { backgroundColor: CATEGORY_BACKGROUNDS[scenario.category] },
        ]}
      >
        <Text style={[styles.scenarioIconText, { color: categoryColor }]}>
          {scenario.level}
        </Text>
      </View>

      <View style={styles.scenarioCopy}>
        <View style={styles.scenarioHeading}>
          <Text numberOfLines={1} style={styles.scenarioTitle}>
            {scenario.title}
          </Text>
          {isLocked && <Text style={styles.lockedLabel}>LOCKED</Text>}
        </View>
        <Text numberOfLines={2} style={styles.scenarioDescription}>
          {scenario.description}
        </Text>
        <View style={styles.scenarioMeta}>
          <Text style={[styles.category, { color: categoryColor }]}>
            {CATEGORY_LABELS[scenario.category].toUpperCase()}
          </Text>
          <Text style={styles.metaText}>{scenario.durationMinutes} min</Text>
        </View>
      </View>

      <Text style={styles.chevron}>{isLocked ? "" : "\u203A"}</Text>
    </Pressable>
  );
}

export default function SpeakScreen() {
  const { session } = useAuth();
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<SpeakFilter>("all");

  const filteredScenarios = useMemo(
    () =>
      selectedFilter === "all"
        ? CONVERSATION_SCENARIOS
        : CONVERSATION_SCENARIOS.filter(
            (scenario) => scenario.category === selectedFilter,
          ),
    [selectedFilter],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (session) {
        void loadSpeakingResults(session.user.id).then((results) => {
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (isActive) {
            setWeeklyCount(
              results.filter(
                (result) => new Date(result.completedAt).getTime() >= weekAgo,
              ).length,
            );
          }
        });
      }
      return () => {
        isActive = false;
      };
    }, [session]),
  );

  return (
    <TabScreen>
        <TabPageHeader
          eyebrow="CONVERSATION PRACTICE"
          title="Speak"
          right={<View style={styles.weeklyCard}>
            <Text style={styles.weeklyValue}>{weeklyCount}</Text>
            <Text style={styles.weeklyLabel}>this week</Text>
          </View>}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => openScenario(CONVERSATION_SCENARIOS[0])}
          style={({ pressed }) => [styles.challengeCard, pressed && styles.pressed]}
        >
          <View style={styles.challengeTopRow}>
            <View style={styles.challengePill}>
              <Text style={styles.challengePillText}>DAILY CHALLENGE</Text>
            </View>
            <Text style={styles.challengeTime}>4 min</Text>
          </View>

          <View style={styles.waveform}>
            {WAVEFORM_HEIGHTS.map((height, index) => (
              <View
                key={`${height}-${index}`}
                style={[styles.waveformBar, { height }]}
              />
            ))}
          </View>

          <Text style={styles.challengeTitle}>Order a coffee</Text>
          <Text style={styles.challengeDescription}>
            Practice a short everyday exchange at your own pace.
          </Text>

          <View style={styles.challengeFooter}>
            <Text style={styles.previewNotice}>Guided practice with audio prompts</Text>
            <View style={styles.startCircle}>
              <Text style={styles.startArrow}>{"\u2192"}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.tipCard}>
          <View style={styles.tipMark}>
            <Text style={styles.tipMarkText}>!</Text>
          </View>
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Speak without pressure</Text>
            <Text style={styles.tipText}>
              Focus on communicating first. Perfect grammar can come later.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose a situation</Text>
        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {CONVERSATION_FILTERS.map((filter) => {
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

        <View style={styles.scenarioList}>
          {filteredScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  weeklyCard: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#E9F8FA",
  },
  weeklyValue: { color: "#12848D", fontSize: 16, fontWeight: "900" },
  weeklyLabel: { color: "#477D86", fontSize: 11, fontWeight: "700" },
  challengeCard: {
    marginTop: 23,
    padding: 20,
    borderRadius: 25,
    backgroundColor: "#172F67",
    experimental_backgroundImage:
      "linear-gradient(145deg, #112A60 0%, #294DA5 52%, #6546C5 100%)",
    shadowColor: "#203B78",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  challengeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  challengePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(103, 232, 249, 0.16)",
  },
  challengePillText: {
    color: "#A8F4F5",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  challengeTime: { color: "#D4E2FF", fontSize: 12, fontWeight: "700" },
  waveform: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 18,
  },
  waveformBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: "#69E6EA",
  },
  challengeTitle: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  challengeDescription: {
    maxWidth: 330,
    alignSelf: "center",
    marginTop: 7,
    color: "#D5E0FA",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  challengeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  previewNotice: { flex: 1, color: "#B9CBEF", fontSize: 10, fontWeight: "600" },
  startCircle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  startArrow: { color: "#4055BB", fontSize: 20, fontWeight: "800" },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDEBEF",
    borderRadius: 19,
    backgroundColor: "#F0FBFB",
  },
  tipMark: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#D7F4F2",
  },
  tipMarkText: { color: "#128A85", fontSize: 18, fontWeight: "900" },
  tipCopy: { flex: 1, marginLeft: 12 },
  tipTitle: { color: "#18334A", fontSize: 13, fontWeight: "800" },
  tipText: { marginTop: 3, color: "#647B8D", fontSize: 11, lineHeight: 16 },
  sectionTitle: { marginTop: 26, color: "#10203E", fontSize: 19, fontWeight: "900" },
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
  scenarioList: { gap: 11 },
  scenarioCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  scenarioCardLocked: { opacity: 0.58, backgroundColor: "#F0F3F8" },
  scenarioIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  scenarioIconText: { fontSize: 14, fontWeight: "900" },
  scenarioCopy: { flex: 1, marginLeft: 12 },
  scenarioHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  scenarioTitle: { flex: 1, color: "#172746", fontSize: 15, fontWeight: "800" },
  lockedLabel: {
    color: "#8491A8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  scenarioDescription: {
    marginTop: 4,
    color: "#7786A2",
    fontSize: 11,
    lineHeight: 16,
  },
  scenarioMeta: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 7 },
  category: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  metaText: { color: "#8A98B0", fontSize: 9 },
  chevron: { width: 18, color: "#7082A4", fontSize: 25, textAlign: "right" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
