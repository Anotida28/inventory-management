export type SystemMode = "CARDS" | "INVENTORY";

export const normalizeMode = (value?: string | null): SystemMode => {
  const upper = (value || "").toUpperCase();
  return upper === "INVENTORY" ? "INVENTORY" : "CARDS";
};

export const getModeFromRequest = (req: any): SystemMode => {
  const header = req?.headers?.["x-system-mode"] as string | undefined;
  const query = req?.query?.mode as string | undefined;
  return normalizeMode(header || query || null);
};
