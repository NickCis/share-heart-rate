const TIME_LOCALES: Record<string, string> = {
  en: "en-GB",
  es: "es-ES",
};

export function formatTime24(date: Date, language: string): string {
  const locale = TIME_LOCALES[language] ?? TIME_LOCALES.en;
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
