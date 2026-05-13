export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      first: fullName.trim(),
      last: "",
    };
  }

  return {
    first: parts.slice(0, -1).join(" "),
    last: parts.at(-1) ?? "",
  };
}