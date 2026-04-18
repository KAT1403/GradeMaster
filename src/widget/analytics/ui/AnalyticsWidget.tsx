import { useTranslation } from "react-i18next";
import { useAcademicRecordStore } from "../../../entities/academic-record/model/store";
import { Card } from "../../../shared/ui/card";
import {
  TrendingUp,
  Activity,
  Target,
  BarChart2,
  HelpCircle,
} from "lucide-react";
import {
  calculateStdDev,
  calculateVolatility,
  calculateTextualTrend,
} from "../../../shared/lib/analytics";
import type { TrendType } from "../../../shared/lib/analytics";
import { TrendsChart } from "./TrendsChart";
import { StabilityChart } from "./StabilityChart";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { useUIStore } from "../../../app/store/uiStore";
import styles from "./AnalyticsWidget.module.scss";

const COLORS = {
  progress: "#10b981",
  regress: "#ef4444",
  stable: "#3b82f6",
  neutral: "#64748b",
  volLow: "#10b981",
  volMed: "#f59e0b",
  volHigh: "#ef4444",
};

export const AnalyticsWidget = () => {
  const { t } = useTranslation();
  const { fos, sors, soch } = useAcademicRecordStore();
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  if (fos.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState onNavigate={() => setActiveTab("calculator")} />
      </div>
    );
  }

  const stdDev = calculateStdDev(fos);
  const volatility = calculateVolatility(stdDev);
  const trend = calculateTextualTrend(fos);

  const getTrendColor = (type: TrendType) => COLORS[type] || COLORS.stable;
  const getVolatilityColor = (v: number) =>
    v > 60 ? COLORS.volHigh : v > 30 ? COLORS.volMed : COLORS.volLow;

  const avgFO = (fos.reduce((a, b) => a + b, 0) / fos.length).toFixed(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("analytics.title")}</h2>
      </div>

      <div className={styles.mainGrid}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.stability}`}>
              <Target size={20} color={COLORS.progress} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>
                {t("analytics.stability_title")}
              </h3>
              <p className={styles.cardSubtitle}>
                {t("analytics.stability_desc")}
              </p>
            </div>
          </div>
          <StabilityChart fos={fos} sors={sors} soch={soch} />
        </Card>

        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.trend}`}>
              <TrendingUp size={20} color={COLORS.stable} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>{t("analytics.trend")}</h3>
              <p className={styles.cardSubtitle}>
                {t("analytics.volatility_desc")}
              </p>
            </div>
          </div>
          <TrendsChart fos={fos} />
        </Card>
      </div>

      <div className={styles.smallGrid}>
        <Card className={styles.rectCard}>
          <div className={styles.rectHeader}>
            <BarChart2 size={16} color={COLORS.neutral} />
            <span className={styles.rectLabel}>
              {t("analytics.trend_text_title")}
            </span>
          </div>
          <div className={styles.rectContent}>
            <span
              className={styles.trendBadge}
              style={{ backgroundColor: getTrendColor(trend) }}
            >
              {t(`analytics.trend_text.${trend}`)}
            </span>
            <p className={styles.rectDesc}>{t("analytics.trend_desc")}</p>
          </div>
        </Card>

        <Card className={styles.rectCard}>
          <div className={styles.rectHeader}>
            <Activity size={16} color={COLORS.neutral} />
            <span className={styles.rectLabel}>
              {t("analytics.volatility")}
            </span>
          </div>
          <div className={styles.rectContent}>
            <div className={styles.volatilityBar}>
              <div
                className={styles.volatilityFill}
                style={{
                  width: `${volatility}%`,
                  background: getVolatilityColor(volatility),
                }}
              />
            </div>
            <div className={styles.volatilityMeta}>
              <span>{t("analytics.low_volatility")}</span>
              <span>{t("analytics.high_volatility")}</span>
            </div>
          </div>
        </Card>

        <Card className={styles.rectCard}>
          <div className={styles.rectHeader}>
            <HelpCircle size={16} color={COLORS.neutral} />
            <span className={styles.rectLabel}>{t("analytics.mean")}</span>
          </div>
          <div className={styles.rectContent}>
            <span className={styles.bigValue}>{avgFO}</span>
            <span className={styles.subValue}>±{stdDev.toFixed(2)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
