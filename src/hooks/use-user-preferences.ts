import { useContext } from "react";

import { UserPreferencesContext } from "@/contexts/user-preferences-context";

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error(
      "useUserPreferences must be used inside UserPreferencesProvider",
    );
  }

  return context;
}
