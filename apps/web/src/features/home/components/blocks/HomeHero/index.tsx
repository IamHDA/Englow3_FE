"use client";

import { Button, Flex, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AuthModal, useAuth } from "@/features/auth";
import { useOnboarding } from "@/features/onboarding";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeHero.module.css";

/** Đích của nút CTA khi người dùng đã đăng nhập và thiết lập xong. */
const READY_LEARNER_HREF = "/study/daily-path";

export function HomeHero() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { requiresOnboarding, open: openOnboarding } = useOnboarding();
  const [authOpened, auth] = useDisclosure(false);

  return (
    <Flex
      component="section"
      direction={{ base: "column", md: "row" }}
      align="center"
      justify={{ base: "flex-start", md: "space-between" }}
      gap={{ base: "xl", md: 64 }}
      pt={{ base: 48, md: 92 }}
      pb={{ base: 32, md: 40 }}
    >
      <Flex
        direction="column"
        gap={{ base: 40, md: 72 }}
        flex="1 1 auto"
        miw={0}
        maw={750}
      >
        <Flex direction="column" gap={{ base: 28, md: 42 }}>
          <Title order={1} className={classes.title}>
            {t.home.heroTitle}
          </Title>

          <Text className={classes.quote}>
            &ldquo;<em>{t.home.heroQuote}</em>&rdquo;
          </Text>

          <Text className={classes.description}>{t.home.heroDescription}</Text>
        </Flex>

        {/* Onboarding là popup bật ở mọi trang, không phải một trang riêng -
            nút này mở đúng thứ người dùng đang thiếu: đăng nhập, thiết lập,
            hoặc lộ trình học nếu đã xong cả hai. */}
        {session && !requiresOnboarding ? (
          <Button
            component={Link}
            href={READY_LEARNER_HREF}
            color="orange.5"
            rightSection={
              <ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} />
            }
            classNames={{ root: classes.cta, label: classes.ctaLabel }}
          >
            {t.home.heroCta}
          </Button>
        ) : (
          <Button
            onClick={() => (session ? openOnboarding() : auth.open())}
            color="orange.5"
            rightSection={
              <ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} />
            }
            classNames={{ root: classes.cta, label: classes.ctaLabel }}
          >
            {t.home.heroCta}
          </Button>
        )}

        <AuthModal opened={authOpened} onClose={auth.close} />
      </Flex>

      <Image
        src="/englow3_hero.png"
        alt={t.home.heroImageAlt}
        width={533}
        height={490}
        className={classes.illustration}
        priority
      />
    </Flex>
  );
}
