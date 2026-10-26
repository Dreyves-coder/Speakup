export type AuthUser = {
  displayName: string;
  email: string;
  id: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};
