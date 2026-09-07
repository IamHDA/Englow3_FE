import { Skeleton } from "@mantine/core";
import classes from "./ExamLibrarySkeleton.module.css";

export function ExamLibrarySkeleton() {
  return (
    <div className={classes.container}>
      <div className={classes.grid}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className={classes.cardSkeleton}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton height={24} width={60} radius="xl" />
              <Skeleton height={18} width={80} radius="xl" />
            </div>

            <Skeleton
              height={14}
              width={100}
              radius="xs"
              style={{ marginTop: 8 }}
            />
            <Skeleton height={22} width="85%" radius="xs" />
            <Skeleton height={16} width="60%" radius="xs" />

            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <Skeleton height={20} width={64} radius="sm" />
              <Skeleton height={20} width={64} radius="sm" />
            </div>

            <div style={{ flex: 1 }} />

            <div
              style={{
                display: "flex",
                gap: 14,
                paddingTop: 12,
                borderTop: "1px solid var(--mantine-color-gray-2)",
              }}
            >
              <Skeleton height={16} width={70} radius="xs" />
              <Skeleton height={16} width={70} radius="xs" />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 4,
              }}
            >
              <Skeleton height={24} width={80} radius="xs" />
              <Skeleton height={34} width={110} radius="xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
