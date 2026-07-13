import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("privacy.title")}
        </h1>
        <Link className="text-sm text-primary hover:underline" to="/">
          {t("common.home")}
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">{t("privacy.updated")}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.overviewTitle")}
          </h2>
          <p>{t("privacy.overview")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.dataTitle")}
          </h2>
          <p>{t("privacy.data")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.sharingTitle")}
          </h2>
          <p>{t("privacy.sharing")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.cookiesTitle")}
          </h2>
          <p>{t("privacy.cookies")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.retentionTitle")}
          </h2>
          <p>{t("privacy.retention")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.thirdPartyTitle")}
          </h2>
          <p>{t("privacy.thirdParty")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.contactTitle")}
          </h2>
          <p>{t("privacy.contact")}</p>
        </section>
      </div>
    </div>
  );
}
