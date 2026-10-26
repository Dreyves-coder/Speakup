import { APP_COLORS } from "@/constants/theme";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ColorValue, StyleSheet, Text, View } from "react-native";

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  symbol: string;
};

function TabIcon({ color, focused, symbol }: TabIconProps) {
  return (
    <View style={[styles.icon, focused && styles.iconFocused]}>
      <Text style={[styles.iconText, { color }]}>{symbol}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          sceneStyle: styles.scene,
          tabBarActiveTintColor: APP_COLORS.primary,
          tabBarInactiveTintColor: "#7788AA",
          tabBarHideOnKeyboard: true,
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.label,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} symbol={"\u2302"} />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "Learn",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} symbol={"\u25A4"} />
            ),
          }}
        />
        <Tabs.Screen
          name="speak"
          options={{
            title: "Speak",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} symbol={"\u25CF"} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} symbol={"\u2197"} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} symbol={"\u25CB"} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: APP_COLORS.background },
  tabBar: {
    height: 76,
    paddingTop: 8,
    paddingBottom: 9,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surface,
    shadowColor: "#18356B",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 12,
  },
  label: { fontSize: 10, fontWeight: "700" },
  tabBarItem: { minWidth: 0 },
  icon: {
    width: 31,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  iconFocused: { backgroundColor: "#E9FAFC" },
  iconText: { fontSize: 21, lineHeight: 23, fontWeight: "800" },
});
