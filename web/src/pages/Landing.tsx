import { Heart, Watch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GARMIN_CONNECT_URL =
  "https://apps.garmin.com/en-US/apps/placeholder-share-heart-rate";

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-4 py-12 sm:px-6">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Heart className="size-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t("appName")}</h1>
        <p className="text-lg text-muted-foreground">{t("landing.tagline")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="size-5" />
            {t("landing.watchAppTitle")}
          </CardTitle>
          <CardDescription>{t("landing.watchAppDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <a href={GARMIN_CONNECT_URL} target="_blank" rel="noreferrer">
              {t("landing.openGarminConnect")}
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("landing.howItWorksTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t("landing.step1")}</p>
          <p>{t("landing.step2")}</p>
          <p>{t("landing.step3")}</p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {t("landing.sessionLinkHint")}{" "}
        <Link className="text-primary hover:underline" to="/session/demo">
          {t("landing.viewExample")}
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        <Link className="hover:underline" to="/privacy">
          {t("common.privacy")}
        </Link>
      </p>
    </div>
  );
}
