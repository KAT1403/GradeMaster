import { useEffect, useMemo, useRef, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useTranslation } from "react-i18next";
import { predictFutureGrades } from "../../../shared/lib/analytics";
import styles from "./TrendsChart.module.scss";

interface TrendsChartProps {
  fos: number[];
}

interface TrendItem {
  name: string;
  value?: number;
  forecast?: number;
}

interface TooltipLabels {
  badge: string;
  grade: string;
  expected: string;
}

interface TooltipPayload {
  payload: TrendItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  labels?: TooltipLabels;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  labels,
}: CustomTooltipProps) => {
  const item = payload?.[0]?.payload;
  if (!active || !item || !labels) return null;
  const isForecast = item.value === undefined;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>
        {label}
        {isForecast && <span className={styles.badge}>{labels.badge}</span>}
      </p>
      <p className={styles.tooltipRow}>
        <span>{isForecast ? labels.expected : labels.grade}</span>
        <b>{isForecast ? item.forecast : item.value}</b>
      </p>
    </div>
  );
};

export const TrendsChart = ({ fos }: TrendsChartProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const label = t("calculator.fo_short") || "ФО";

  const chartData = useMemo(() => {
    const data: TrendItem[] = fos.map((v, i) => ({
      name: `${label} ${i + 1}`,
      value: v,
    }));

    if (data.length > 0) {
      const lastIndex = data.length - 1;
      const lastValue = fos[lastIndex];
      data[lastIndex] = {
        ...data[lastIndex],
        forecast: lastValue,
      };

      predictFutureGrades(fos, 5).forEach((p, i) => {
        data.push({
          name: `${label} ${fos.length + i + 1}`,
          forecast: p.forecast,
        });
      });
    }

    return data;
  }, [fos, label]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [fos.length]);

  const handleDragStart = (pageX: number) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleDragMove = (pageX: number) => {
    if (!isDragging || !scrollRef.current) return;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <div className={styles.root}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <i className={styles.markerFact} />
          {t("analytics.chart_legend.fact")}
        </span>
        <span className={styles.legendItem}>
          <i className={styles.markerForecast} />
          {t("analytics.chart_legend.forecast")}
        </span>
      </div>

      <div
        className={styles.container}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className={styles.axisY}>
          {[10, 8, 6, 4, 2, 0].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>

        <div
          ref={scrollRef}
          onMouseDown={(e) => handleDragStart(e.pageX)}
          onMouseMove={(e) => handleDragMove(e.pageX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].pageX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].pageX)}
          onTouchEnd={handleDragEnd}
          className={styles.scrollArea}
        >
          <div
            className={styles.chartWrapper}
            style={{ width: Math.max(100, chartData.length * 15) + "%" }}
          >
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--chart-text)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                <Tooltip
                  content={
                    <CustomTooltip
                      labels={{
                        badge: t("analytics.chart_tooltip.badge"),
                        grade: t("analytics.chart_tooltip.grade"),
                        expected: t("analytics.chart_tooltip.expected"),
                      }}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent-primary)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--accent-primary)",
                    strokeWidth: 2,
                    stroke: "var(--bg-secondary)",
                  }}
                  isAnimationActive={!isDragging}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--accent-primary)"
                  strokeOpacity={0.55}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{
                    r: 3,
                    fill: "var(--bg-secondary)",
                    strokeWidth: 2,
                    stroke: "var(--accent-primary)",
                    strokeOpacity: 0.55,
                  }}
                  connectNulls
                  isAnimationActive={!isDragging}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
