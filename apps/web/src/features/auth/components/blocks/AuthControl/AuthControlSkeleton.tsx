import { Skeleton } from "@mantine/core";

type AuthControlSkeletonProps = {
  fullWidth?: boolean;
};

/**
 * Same 42px height as the Mantine `size="md"` button it stands in for, and the
 * same 12px left margin the button carries on desktop, so the nav row does not
 * shift when the session resolves.
 */
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
