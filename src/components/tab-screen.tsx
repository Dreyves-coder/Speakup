import { APP_COLORS, APP_LAYOUT } from "@/constants/theme";
import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function TabScreen({ children, contentContainerStyle }: TabScreenProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: APP_COLORS.background },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: APP_LAYOUT.screenHorizontalPadding,
    paddingTop: APP_LAYOUT.screenTopPadding,
    paddingBottom: APP_LAYOUT.screenBottomPadding,
  },
  content: {
    width: "100%",
    maxWidth:
      APP_LAYOUT.maxContentWidth - APP_LAYOUT.screenHorizontalPadding * 2,
  },
});
