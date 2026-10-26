import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteAccountRequest,
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from "@/services/auth-api";
import {
  deleteAccessToken,
  loadAccessToken,
  saveAccessToken,
} from "@/services/auth-token-storage";
import type { AuthSession } from "@/types/auth";
import type { UserPreferences } from "@/types/user-preferences";

type AuthContextValue = {
  deleteAccount: () => Promise<void>;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    preferences: UserPreferences,
  ) => Promise<void>;
  session: AuthSession | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadAccessToken()
      .then(async (accessToken) => {
        if (!accessToken) return;

        const user = await getCurrentUserRequest(accessToken);
        if (isMounted) setSession({ accessToken, user });
      })
      .catch(() => deleteAccessToken())
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextSession: AuthSession) => {
    await saveAccessToken(nextSession.accessToken);
    setSession(nextSession);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await persistSession(await loginRequest(email.trim(), password));
    },
    [persistSession],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      preferences: UserPreferences,
    ) => {
      await persistSession(
        await registerRequest(email.trim(), password, preferences),
      );
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await deleteAccessToken();
    setSession(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!session) return;
    await deleteAccountRequest(session.accessToken);
    await deleteAccessToken();
    setSession(null);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({ deleteAccount, isReady, login, logout, register, session }),
    [deleteAccount, isReady, login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
