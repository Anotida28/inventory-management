export type DisplayUser = {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export const getUserDisplayName = (
  user?: DisplayUser | null,
  fallback = "System",
) => {
  if (!user) return fallback;
  const name = user.name?.trim();
  if (name) return name;
  const composed = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (composed) return composed;
  if (user.email) return user.email;
  return fallback;
};
