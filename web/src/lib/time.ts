const TIME_LOCALES: Record<string, string> = {
  en: "en-GB",
  es: "es-ES",
};

type FormatTimeOptions = {
  seconds?: boolean;
};

export function formatTime24(
  date: Date,
  language: string,
  options: FormatTimeOptions = {},
): string {
  const locale = TIME_LOCALES[language] ?? TIME_LOCALES.en;
  const withSeconds = options.seconds ?? true;
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" as const } : {}),
    hour12: false,
  });
}
