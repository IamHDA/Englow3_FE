import { Skeleton } from "@mantine/core";

type AuthControlSkeletonProps = {
  fullWidth?: boolean;
};

/** Same 42px height and rough width as the control it stands in for. */
export function AuthControlSkeleton({ fullWidth }: AuthControlSkeletonProps) {
  return (
    <Skeleton
      height={42}
      radius="md"
      width={fullWidth ? "100%" : 116}
      ml={fullWidth ? undefined : 12}
    />
  );
}
