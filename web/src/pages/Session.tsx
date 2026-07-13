import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
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
import { connectEmulatorsIfNeeded, db } from "@/lib/firebase";
import { formatTime24 } from "@/lib/time";

type HeartReading = {
  id: string;
  bpm: number;
  createdAt: Date;
};

type SessionMeta = {
  lastBpm?: number;
  lastAt?: Date;
};

function toDate(value: Timestamp | null | undefined): Date | null {
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

  const language = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    if (!id) {
      return;
    }

    connectEmulatorsIfNeeded();

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

    const heartsQuery = query(
      collection(db, "sessions", id, "hearts"),
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
  }, [id]);

  const latestBpm = useMemo(() => {
    if (readings.length > 0) {
      return readings[readings.length - 1].bpm;
    }
    return sessionMeta?.lastBpm;
  }, [readings, sessionMeta]);

  const latestAt = useMemo(() => {
    if (readings.length > 0) {
      return readings[readings.length - 1].createdAt;
    }
    return sessionMeta?.lastAt;
  }, [readings, sessionMeta]);

  const chartData = useMemo(
    () =>
      readings.map((reading) => ({
        time: formatTime24(reading.createdAt, language),
        bpm: reading.bpm,
        ts: reading.createdAt.getTime(),
      })),
    [readings, language],
  );

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

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle>{t("session.currentHeartRate")}</CardTitle>
          <CardDescription>
            {latestAt
              ? t("session.lastUpdated", {
                  time: formatTime24(latestAt, language),
                })
              : t("session.waitingFirstReading")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3 pb-8">
          <span className="pulse-heart text-7xl font-bold tabular-nums text-primary">
            {latestBpm ?? "--"}
          </span>
          <span className="mb-3 text-2xl text-muted-foreground">
            {t("common.bpm")}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("session.chartTitle")}</CardTitle>
          <CardDescription>{t("session.chartDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="h-72 px-2 sm:px-6">
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
    </div>
  );
}
