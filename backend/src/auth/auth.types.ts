export type AuthTokenPayload = {
  email: string;
  sub: string;
};

export type AuthenticatedUser = AuthTokenPayload;
