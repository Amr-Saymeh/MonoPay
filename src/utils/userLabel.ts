export type UserLabelProfile = {
  name?: string | null;
  email?: string | null;
} | null | undefined;

export function getUserLabel(profile: UserLabelProfile, uid?: string | null) {
  const name = typeof profile?.name === "string" ? profile.name.trim() : "";
  if (name) return name;

  const email = typeof profile?.email === "string" ? profile.email.trim() : "";
  if (email) return email;

  const id = typeof uid === "string" ? uid.trim() : "";
  return id || "—";
}
