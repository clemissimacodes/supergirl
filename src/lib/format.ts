const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/** e.g. [september 29th, 2026, 4:25pm pst] */
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

  const month = MONTHS[Number(get("month")) - 1] ?? "january";
  const day = ordinal(Number(get("day")));
  const year = get("year");
  const hour = get("hour").toLowerCase();
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toLowerCase();

  return `[${month} ${day}, ${year}, ${hour}:${minute}${dayPeriod} pst]`;
}
