import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTranslation } from "react-i18next";
import type { SOR, SOCH } from "../../../shared/types/academic";
import styles from "./StabilityChart.module.scss";

interface StabilityChartProps {
  fos: number[];
  sors: SOR[];
  soch: SOCH | null;
}

interface ChartItem {
  id: string;
  name: string;
  value: number;
  hasData: boolean;
  type: "fo" | "sor" | "soch";
}

interface TooltipPayload {
  payload: ChartItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const COLORS = {
  fo: "#3b82f6",
  sor: "#10b981",
  soch: "#8b5cf6",
  empty: "transparent"
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const data = payload?.[0]?.payload;
  if (!active || !data?.hasData) return null;
  
  return (
    <div className={styles.tooltip}>
      <p>{data.name}: {data.value}</p>
    </div>
  );
};

export const StabilityChart = ({ fos, sors, soch }: StabilityChartProps) => {
  const { t } = useTranslation();
  const avgFO = fos.length > 0 ? fos.reduce((a, b) => a + b, 0) / fos.length : 0;
  
  const getVal = (score: number, max: number) => 
    max > 0 ? parseFloat(((score / max) * 10).toFixed(1)) : 0;

  const chartData: ChartItem[] = [
    {
      id: "fo",
      name: t("calculator.fo_short") || "ФО",
      value: avgFO > 0 ? parseFloat(avgFO.toFixed(1)) : 0,
      hasData: avgFO > 0,
      type: "fo",
    },
    ...sors.slice(0, 4).map((sor, i) => ({
      id: `sor-${i}`,
      name: `${t("calculator.sor_short")} ${i + 1}`,
      value: getVal(sor.score, sor.max),
      hasData: sor.max > 0,
      type: "sor" as const,
    })),
    {
      id: "soch",
      name: t("calculator.soch_short") || "СОЧ",
      value: soch ? getVal(soch.score, soch.max) : 0,
      hasData: !!(soch && soch.max > 0),
      type: "soch",
    },
  ];

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={250} debounce={100}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="name" stroke="var(--chart-text)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="var(--chart-text)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
            {chartData.map((entry) => (
              <Cell 
                key={entry.id} 
                fill={!entry.hasData ? COLORS.empty : COLORS[entry.type]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
