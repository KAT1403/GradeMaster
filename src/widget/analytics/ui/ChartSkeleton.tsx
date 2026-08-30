import styles from "./ChartSkeleton.module.scss";

interface ChartSkeletonProps {
  variant: "stability" | "trends";
}

export const ChartSkeleton = ({ variant }: ChartSkeletonProps) => (
  <div
    className={`${styles.skeleton} ${styles[variant]}`}
    role="presentation"
    aria-hidden="true"
  />
);
