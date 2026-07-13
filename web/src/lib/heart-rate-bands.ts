export type HeartRateBandId =
  | "hibernating"
  | "zen"
  | "vibing"
  | "warming"
  | "working"
  | "cooking"
  | "melting"
  | "orbit";

export type HeartRateBand = {
  id: HeartRateBandId;
  emoji: string;
  /** Tailwind classes for the current-BPM card shell */
  cardClass: string;
  /** Tailwind classes for the big BPM number */
  valueClass: string;
};

/**
 * Absolute BPM bands for casual live viewing (no age / max-HR input).
 * Roughly maps to rest → light → moderate → vigorous → near-max effort.
 */
const BANDS: Array<{ max: number; band: HeartRateBand }> = [
  {
    max: 59,
    band: {
      id: "hibernating",
      emoji: "💤",
      cardClass: "border-sky-400/40 bg-gradient-to-br from-card to-sky-500/15",
      valueClass: "text-sky-300",
    },
  },
  {
    max: 79,
    band: {
      id: "zen",
      emoji: "😌",
      cardClass: "border-teal-400/40 bg-gradient-to-br from-card to-teal-500/15",
      valueClass: "text-teal-300",
    },
  },
  {
    max: 99,
    band: {
      id: "vibing",
      emoji: "🙂",
      cardClass: "border-lime-400/35 bg-gradient-to-br from-card to-lime-500/12",
      valueClass: "text-lime-300",
    },
  },
  {
    max: 119,
    band: {
      id: "warming",
      emoji: "🚶",
      cardClass:
        "border-yellow-400/40 bg-gradient-to-br from-card to-yellow-500/15",
      valueClass: "text-yellow-300",
    },
  },
  {
    max: 139,
    band: {
      id: "working",
      emoji: "😅",
      cardClass:
        "border-orange-400/45 bg-gradient-to-br from-card to-orange-500/15",
      valueClass: "text-orange-300",
    },
  },
  {
    max: 159,
    band: {
      id: "cooking",
      emoji: "🔥",
      cardClass: "border-orange-500/50 bg-gradient-to-br from-card to-red-500/18",
      valueClass: "text-orange-400",
    },
  },
  {
    max: 179,
    band: {
      id: "melting",
      emoji: "🥵",
      cardClass: "border-red-500/55 bg-gradient-to-br from-card to-red-600/22",
      valueClass: "text-red-400",
    },
  },
  {
    max: Number.POSITIVE_INFINITY,
    band: {
      id: "orbit",
      emoji: "🚀",
      cardClass:
        "border-fuchsia-500/55 bg-gradient-to-br from-card to-fuchsia-600/25",
      valueClass: "text-fuchsia-300",
    },
  },
];

const IDLE_BAND: HeartRateBand = {
  id: "zen",
  emoji: "❤️",
  cardClass: "border-primary/30 bg-gradient-to-br from-card to-primary/5",
  valueClass: "text-primary",
};

export function getHeartRateBand(bpm: number | undefined): HeartRateBand {
  if (typeof bpm !== "number" || !Number.isFinite(bpm)) {
    return IDLE_BAND;
  }
  for (const entry of BANDS) {
    if (bpm <= entry.max) {
      return entry.band;
    }
  }
  return BANDS[BANDS.length - 1].band;
}

/** Adaptive Y-axis domain from plotted points; pads and keeps a readable span. */
export function heartRateYDomain(values: number[]): [number, number] {
  if (values.length === 0) {
    return [50, 120];
  }

  let min = values[0];
  let max = values[0];
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  const pad = Math.max(8, Math.round((max - min) * 0.2));
  let lo = Math.floor((min - pad) / 5) * 5;
  let hi = Math.ceil((max + pad) / 5) * 5;

  const minSpan = 30;
  if (hi - lo < minSpan) {
    const mid = (lo + hi) / 2;
    lo = Math.floor((mid - minSpan / 2) / 5) * 5;
    hi = lo + minSpan;
  }

  lo = Math.max(30, lo);
  hi = Math.min(250, Math.max(hi, lo + minSpan));
  return [lo, hi];
}
