import styles from "./ScenarioCard.module.scss";

interface ScenarioCardProps {
  icon: string;
  title: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export const ScenarioCard = ({
  icon,
  title,
  children,
  variant = "default",
  className,
}: ScenarioCardProps) => {
  const getCardStyle = () => {
    switch (variant) {
      case "success":
        return { borderColor: "#3b8f21", backgroundColor: "#f0fdf4" };
      case "warning":
        return { borderColor: "#ff8e12", backgroundColor: "#fffbeb" };
      default:
        return {};
    }
  };

  const getTitleStyle = () => {
    switch (variant) {
      case "success":
        return { color: "#166534" };
      case "warning":
        return { color: "#92400e" };
      default:
        return {};
    }
  };

  return (
    <div
      className={`${styles.scenarioCard} ${className || ""}`}
      style={getCardStyle()}
    >
      <div className={styles.scenarioHeader}>
        <span className={styles.icon}>{icon}</span>
        <h3 className={styles.title} style={getTitleStyle()}>
          {title}
        </h3>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
