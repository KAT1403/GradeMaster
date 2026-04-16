import { useEffect, useRef, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
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
  realistic?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  const val = item.value !== undefined ? item.value : item.realistic;
  
  return (
    <div className={styles.tooltip}>
      <p>{label}: {val}</p>
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
  const history: TrendItem[] = fos.map((v, i) => ({ name: `${label} ${i + 1}`, value: v }));
  const forecast = predictFutureGrades(fos, 5);
  
  const chartData: TrendItem[] = [...history];
  if (history.length > 0) {
    chartData[chartData.length - 1].realistic = history[history.length - 1].value;
    forecast.forEach((p, i) => {
      chartData.push({ name: `${label} ${history.length + i + 1}`, realistic: p.realistic });
    });
  }

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
    <div 
      className={styles.container} 
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className={styles.axisY}>
        {[10, 8, 6, 4, 2, 0].map(v => <span key={v}>{v}</span>)}
      </div>

      <div 
        ref={scrollRef}
        onMouseDown={e => handleDragStart(e.pageX)}
        onMouseMove={e => handleDragMove(e.pageX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={e => handleDragStart(e.touches[0].pageX)}
        onTouchMove={e => handleDragMove(e.touches[0].pageX)}
        onTouchEnd={handleDragEnd}
        className={styles.scrollArea}
      >
        <div 
          className={styles.chartWrapper}
          style={{ width: Math.max(100, chartData.length * 15) + "%" }}
        >
          <ResponsiveContainer width="100%" height={250} debounce={100}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--chart-text)" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis hide domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: 'var(--bg-secondary)' }} isAnimationActive={!isDragging} />
              <Line type="monotone" dataKey="realistic" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls isAnimationActive={!isDragging} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
