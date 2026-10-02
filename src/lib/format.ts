const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/** e.g. 29 sep · 4:25p */
export function formatStamp(iso: string, timeZone = "America/Los_Angeles"): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const month = MONTHS[Number(get("month")) - 1] ?? "jan";
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toLowerCase().startsWith("a") ? "a" : "p";

  return `${day} ${month} · ${hour}:${minute}${dayPeriod}`;
}
