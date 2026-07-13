import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LocaleSync() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? "en";
    document.title = t("appName");
  }, [i18n.resolvedLanguage, t]);

  return null;
}
