import { APP_COLORS } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type TabPageHeaderProps = {
  eyebrow: string;
  right?: ReactNode;
  title: string;
};

export function TabPageHeader({ eyebrow, right, title }: TabPageHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: APP_COLORS.mutedText,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 3,
    color: APP_COLORS.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
});
