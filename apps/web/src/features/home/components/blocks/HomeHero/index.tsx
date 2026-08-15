"use client";

import { Button, Flex, Text, Title } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import classes from "./HomeHero.module.css";

export function HomeHero() {
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
            Chinh phục tiếng Anh cùng Englow3
          </Title>

          <Text className={classes.quote}>
            &ldquo;<em>Con đường của riêng bạn, tương lai trong tay bạn</em>
            &rdquo;
          </Text>

          <Text className={classes.description}>
            Nâng tầm khả năng nói lưu loát với chấm điểm phát âm AI theo thời
            gian thực, chat bot cá nhân hóa, thẻ ghi nhớ 3D, thử thách chính tả
            và các bài thi thử IELTS/TOEIC đầy đủ.
          </Text>
        </Flex>

        <Button
          component={Link}
          href="/onboarding"
          color="orange.5"
          rightSection={
            <ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} />
          }
          classNames={{ root: classes.cta, label: classes.ctaLabel }}
        >
          Bắt đầu học ngay
        </Button>
      </Flex>

      <Image
        src="/englow3_hero.png"
        alt="Không gian học tập Englow3 với phân tích phát âm, bộ thẻ ghi nhớ và trình theo dõi tiến độ hàng ngày"
        width={533}
        height={490}
        className={classes.illustration}
        priority
      />
    </Flex>
  );
}
