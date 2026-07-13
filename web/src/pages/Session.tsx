import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { HeartRateChart } from "@/components/HeartRateChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHeartRateBand } from "@/lib/heart-rate-bands";
import { connectEmulatorsIfNeeded, db } from "@/lib/firebase";
import { formatTime24 } from "@/lib/time";
import { cn } from "@/lib/utils";

type HeartReading = {
  id: string;
  bpm: number;
  createdAt: Date;
};

type SessionMeta = {
  lastBpm?: number;
  lastAt?: Date;
};

const HOUR_MS = 60 * 60 * 1000;
const WINDOW_REFRESH_MS = 5 * 60 * 1000;

function toDate(value: { toDate: () => Date } | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return value.toDate();
}

export function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [readings, setReadings] = useState<HeartReading[]>([]);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [sessionExists, setSessionExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [resyncKey, setResyncKey] = useState(0);

  const language = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    const bump = () => {
      if (document.visibilityState === "visible") {
        setResyncKey((key) => key + 1);
      }
    };

    document.addEventListener("visibilitychange", bump);
    window.addEventListener("pageshow", bump);
    return () => {
      document.removeEventListener("visibilitychange", bump);
      window.removeEventListener("pageshow", bump);
    };
  }, []);

  useEffect(() => {
    if (showAll) {
      return;
    }
    const timer = window.setInterval(() => {
      setResyncKey((key) => key + 1);
    }, WINDOW_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [showAll]);

  useEffect(() => {
    if (!id) {
      return;
    }

    connectEmulatorsIfNeeded();
    setLoading(true);

    const sessionRef = doc(db, "sessions", id);
    const unsubscribeSession = onSnapshot(
      sessionRef,
      (snapshot) => {
        setSessionExists(snapshot.exists());
        if (!snapshot.exists()) {
          setSessionMeta(null);
          return;
        }
        const data = snapshot.data();
        setSessionMeta({
          lastBpm: typeof data.lastBpm === "number" ? data.lastBpm : undefined,
          lastAt: toDate(data.lastAt) ?? undefined,
        });
      },
      () => {
        setSessionExists(false);
      },
    );

    const heartsRef = collection(db, "sessions", id, "hearts");
    const heartsQuery = showAll
      ? query(heartsRef, orderBy("createdAt", "asc"))
      : query(
          heartsRef,
          where("createdAt", ">=", Timestamp.fromMillis(Date.now() - HOUR_MS)),
          orderBy("createdAt", "asc"),
        );

    const unsubscribeHearts = onSnapshot(
      heartsQuery,
      (snapshot) => {
        const next: HeartReading[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const createdAt = toDate(data.createdAt);
          if (typeof data.bpm !== "number" || !createdAt) {
            return;
          }
          next.push({
            id: docSnap.id,
            bpm: data.bpm,
            createdAt,
          });
        });
        next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setReadings(next);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => {
      unsubscribeSession();
      unsubscribeHearts();
    };
  }, [id, showAll, resyncKey]);

  const windowedReadings = useMemo(() => {
    if (showAll) {
      return readings;
    }
    const cutoff = Date.now() - HOUR_MS;
    return readings.filter((reading) => reading.createdAt.getTime() >= cutoff);
  }, [readings, showAll]);

  const displayBpm =
    sessionMeta?.lastBpm ??
    (windowedReadings.length > 0
      ? windowedReadings[windowedReadings.length - 1].bpm
      : undefined);
  const displayAt =
    sessionMeta?.lastAt ??
    (windowedReadings.length > 0
      ? windowedReadings[windowedReadings.length - 1].createdAt
      : undefined);

  const chartData = useMemo(
    () =>
      windowedReadings.map((reading) => ({
        time: formatTime24(reading.createdAt, language, { seconds: false }),
        bpm: reading.bpm,
        ts: reading.createdAt.getTime(),
      })),
    [windowedReadings, language],
  );

  const bpmBand = getHeartRateBand(displayBpm);

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">{t("session.missingId")}</p>
        <Link className="text-primary hover:underline" to="/">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  if (sessionExists === false) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">{t("session.notFoundTitle")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("session.notFoundDescription")}
        </p>
        <Link className="mt-6 inline-block text-primary hover:underline" to="/">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-3 py-8 sm:px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("session.liveSession")}
          </p>
          <h1 className="truncate font-mono text-sm">{id}</h1>
        </div>
        <Link className="text-sm text-primary hover:underline" to="/">
          {t("common.home")}
        </Link>
      </div>

      <Card className={cn("overflow-hidden", bpmBand.cardClass)}>
        <CardHeader className="pb-2">
          <CardTitle>{t("session.currentHeartRate")}</CardTitle>
          <CardDescription>
            {displayAt
              ? t("session.lastUpdated", {
                  time: formatTime24(displayAt, language),
                })
              : t("session.waitingFirstReading")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3 pb-8">
          <span className="mb-2 text-5xl leading-none sm:text-6xl" aria-hidden>
            {bpmBand.emoji}
          </span>
          <span
            className={cn(
              "pulse-heart text-7xl font-bold tabular-nums",
              bpmBand.valueClass,
            )}
          >
            {displayBpm ?? "--"}
          </span>
          <div className="mb-2 flex flex-col gap-1">
            <span className="text-2xl text-muted-foreground">
              {t("common.bpm")}
            </span>
            {displayBpm != null ? (
              <span className="text-sm font-medium text-muted-foreground">
                {t(`session.bands.${bpmBand.id}`)}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="-mx-3 rounded-none border-x-0 sm:mx-0 sm:rounded-xl sm:border-x">
        <CardHeader className="gap-3 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>{t("session.chartTitle")}</CardTitle>
              <CardDescription>
                {showAll
                  ? t("session.chartDescriptionAll")
                  : t("session.chartDescription")}
              </CardDescription>
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={showAll}
                onChange={(event) => setShowAll(event.target.checked)}
              />
              {t("session.showAll")}
            </label>
          </div>
        </CardHeader>
        <CardContent className="h-72 px-1 sm:px-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t("session.loadingReadings")}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center px-2 text-center text-muted-foreground">
              {t("session.noReadings")}
            </div>
          ) : (
            <HeartRateChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link className="hover:underline" to="/privacy">
          {t("common.privacy")}
        </Link>
      </p>
    </div>
  );
}
