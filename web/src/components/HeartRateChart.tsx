import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { heartRateYDomain } from "@/lib/heart-rate-bands";

type ChartPoint = {
  time: string;
  bpm: number;
  ts: number;
};

type HeartRateChartProps = {
  data: ChartPoint[];
};

export function HeartRateChart({ data }: HeartRateChartProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const margin = isMobile
    ? { top: 8, right: 4, left: 0, bottom: 4 }
    : { top: 8, right: 12, left: 0, bottom: 0 };

  const yAxisWidth = isMobile ? 36 : 40;
  const tickFontSize = isMobile ? 11 : 12;

  const yDomain = useMemo(
    () => heartRateYDomain(data.map((point) => point.bpm)),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
        <XAxis
          dataKey="time"
          tick={{ fill: "oklch(0.72 0.02 260)", fontSize: tickFontSize }}
          tickMargin={isMobile ? 4 : 8}
          minTickGap={isMobile ? 28 : 24}
          padding={{ left: 0, right: 0 }}
        />
        <YAxis
          domain={yDomain}
          width={yAxisWidth}
          tick={{ fill: "oklch(0.72 0.02 260)", fontSize: tickFontSize }}
          tickMargin={4}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          labelFormatter={(label) => label}
          formatter={(value) => [
            `${value} ${t("common.bpm")}`,
            t("session.tooltipBpm"),
          ]}
          contentStyle={{
            background: "oklch(0.18 0.03 260)",
            border: "1px solid oklch(1 0 0 / 12%)",
            borderRadius: "0.5rem",
            fontSize: isMobile ? "12px" : "14px",
          }}
        />
        <Line
          type="monotone"
          dataKey="bpm"
          stroke="oklch(0.62 0.24 25)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: isMobile ? 4 : 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
