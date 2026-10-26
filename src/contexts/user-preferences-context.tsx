import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DEFAULT_USER_PREFERENCES } from "@/constants/user-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/services/user-preferences-storage";
import {
  getUserPreferences,
  syncUserPreferences,
} from "@/services/user-preferences-api";
import { syncDailyReminder } from "@/services/daily-reminder";
import type { UserPreferences } from "@/types/user-preferences";

export type PreferencesSyncStatus = "local" | "synced" | "syncing";

type UserPreferencesContextValue = {
  isReady: boolean;
  preferences: UserPreferences;
  syncStatus: PreferencesSyncStatus;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
};

export const UserPreferencesContext =
  createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [isReady, setIsReady] = useState(false);
  const [syncStatus, setSyncStatus] =
    useState<PreferencesSyncStatus>("local");
  const syncVersion = useRef(0);

  const synchronize = useCallback(async (value: UserPreferences) => {
    if (!session) {
      setSyncStatus("local");
      return;
    }

    const currentVersion = ++syncVersion.current;
    setSyncStatus("syncing");

    try {
      await syncUserPreferences(value, session.accessToken);

      if (currentVersion === syncVersion.current) {
        setSyncStatus("synced");
      }
    } catch {
      if (currentVersion === syncVersion.current) {
        setSyncStatus("local");
      }
    }
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    loadUserPreferences()
      .then((storedPreferences) => {
        if (isMounted) {
          setPreferences(storedPreferences);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !session) {
      // The sync state mirrors the external authentication session.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSyncStatus("local");
      return;
    }

    let isMounted = true;
    const currentVersion = ++syncVersion.current;
    setSyncStatus("syncing");

    getUserPreferences(session.accessToken)
      .then((remotePreferences) => {
        if (!isMounted || currentVersion !== syncVersion.current) return;

        setPreferences(remotePreferences);
        void saveUserPreferences(remotePreferences);
        setSyncStatus("synced");
      })
      .catch(() => {
        if (isMounted && currentVersion === syncVersion.current) {
          setSyncStatus("local");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, session]);

  useEffect(() => {
    if (!isReady) return;
    void syncDailyReminder(preferences.dailyReminder);
  }, [isReady, preferences.dailyReminder]);

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...updates };
        void saveUserPreferences(next);
        void synchronize(next);
        return next;
      });
    },
    [synchronize],
  );

  const value = useMemo<UserPreferencesContextValue>(
    () => ({
      isReady,
      preferences,
      syncStatus,
      updatePreferences,
    }),
    [isReady, preferences, syncStatus, updatePreferences],
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
