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
    ? { top: 4, right: 2, left: -12, bottom: 0 }
    : { top: 8, right: 12, left: 0, bottom: 0 };

  const yAxisWidth = isMobile ? 28 : 36;
  const tickFontSize = isMobile ? 10 : 12;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
        <XAxis
          dataKey="time"
          tick={{ fill: "oklch(0.72 0.02 260)", fontSize: tickFontSize }}
          tickMargin={isMobile ? 4 : 8}
          minTickGap={isMobile ? 16 : 24}
          padding={{ left: 0, right: 0 }}
        />
        <YAxis
          domain={["dataMin - 5", "dataMax + 5"]}
          width={yAxisWidth}
          tick={{ fill: "oklch(0.72 0.02 260)", fontSize: tickFontSize }}
          tickMargin={2}
          axisLine={false}
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
          dot={{ r: isMobile ? 2 : 3, fill: "oklch(0.62 0.24 25)" }}
          activeDot={{ r: isMobile ? 4 : 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
