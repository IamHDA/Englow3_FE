"use client";

import {
  Alert,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check } from "lucide-react";
import { useState } from "react";

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAvatarPresetsQuery,
  useChooseAvatarMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { useAccountProfile } from "../../../hooks/useAccountProfile";

import classes from "./AvatarPicker.module.css";

/** The id a stored preset URL names, e.g. "/avatars/fox.svg" -> "fox". */
function presetIdOf(url: string | null | undefined): string | null {
  const match = url?.match(/\/([a-z0-9-]+)\.svg$/i);
  return match ? match[1] : null;
}

/**
 * Choosing a profile picture. There is no upload: a profile wears one of the
 * pictures the backend lists, so nothing a user sends is published as a face.
 */
export function AvatarPicker({
  opened,
  onClose,
  currentUrl,
}: {
  opened: boolean;
  onClose: () => void;
  currentUrl: string | null | undefined;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const { refresh } = useAccountProfile();
  const presets = useAvatarPresetsQuery({ skip: !opened });
  const [choose, choosing] = useChooseAvatarMutation();
  const [picked, setPicked] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const selected = picked ?? presetIdOf(currentUrl);

  async function save() {
    if (!picked) return;
    setFailed(false);
    try {
      await choose({ variables: { preset: picked } });
      // The header and every other avatar read the profile; reload it once.
      await refresh().catch(() => undefined);
      notifications.show({
        color: "teal",
        message: t("Đã đổi ảnh đại diện.", "Profile picture updated."),
      });
      setPicked(null);
      onClose();
    } catch {
      setFailed(true);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setPicked(null);
        setFailed(false);
        onClose();
      }}
      title={t("Chọn ảnh đại diện", "Choose a profile picture")}
      centered
      size="md"
    >
      <Stack gap="md">
        {presets.error ? (
          <Alert color="orange">
            {t(
              "Chưa tải được danh sách ảnh. Thử lại sau.",
              "Could not load the pictures. Try again later.",
            )}
          </Alert>
        ) : presets.loading && !presets.data ? (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        ) : (
          <SimpleGrid
            cols={4}
            spacing="sm"
            role="radiogroup"
            aria-label={t("Ảnh đại diện", "Profile pictures")}
          >
            {presets.data?.avatarPresets.map((preset) => {
              const active = preset.id === selected;
              return (
                <UnstyledButton
                  key={preset.id}
                  role="radio"
                  aria-checked={active}
                  aria-label={preset.id}
                  className={classes.option}
                  data-active={active || undefined}
                  onClick={() => setPicked(preset.id)}
                >
                  <Image src={preset.url} alt="" className={classes.image} />
                  {active && (
                    <span className={classes.check} aria-hidden>
                      <Check size={14} />
                    </span>
                  )}
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        )}

        {failed && (
          <Alert color="red">
            {t(
              "Không đổi được ảnh. Kiểm tra kết nối rồi thử lại.",
              "Could not change the picture. Check your connection and try again.",
            )}
          </Alert>
        )}

        <Text size="xs" c="ink.6">
          {t(
            "Ảnh đại diện được chọn từ bộ ảnh có sẵn của Englow3.",
            "Profile pictures are chosen from Englow3's own set.",
          )}
        </Text>

        <Group justify="flex-end">
          <Button
            color="orange"
            disabled={!picked || picked === presetIdOf(currentUrl)}
            loading={choosing.loading}
            onClick={() => void save()}
          >
            {t("Lưu ảnh", "Save picture")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
