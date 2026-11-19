"use client";

import { Alert, Stack, Text } from "@mantine/core";
import { EyeOff } from "lucide-react";

import { BlogPostStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

type PostStatusBannerProps = {
  status: BlogPostStatus;
  /** Why a moderator did it. Set only for the author, and only while the post is not published. */
  note: string | null;
};

/**
 * What the author reads at the top of their own post once a moderator hid or
 * removed it - with the reason. Nothing for a published one. Only its author is
 * ever shown a post in either state, so this is addressed to them.
 */
export function PostStatusBanner({ status, note }: PostStatusBannerProps) {
  const { t } = useLanguage();
  const copy = t.blog.post;
  switch (status) {
    case BlogPostStatus.PUBLISHED:
      return null;
    case BlogPostStatus.HIDDEN:
    case BlogPostStatus.REMOVED:
      return (
        <Alert
          color={status === BlogPostStatus.REMOVED ? "warn" : "orange"}
          radius="md"
          role="status"
          icon={<EyeOff size={20} aria-hidden="true" />}
        >
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {status === BlogPostStatus.REMOVED
                ? copy.authorBannerRemoved
                : copy.authorBannerHidden}
            </Text>
            {note && (
              <Text size="sm">
                <Text span fw={600}>
                  {copy.authorBannerNote}:
                </Text>{" "}
                {note}
              </Text>
            )}
          </Stack>
        </Alert>
      );
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}
