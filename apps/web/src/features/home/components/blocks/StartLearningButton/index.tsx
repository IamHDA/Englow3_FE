"use client";

import { Button } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import classes from "./StartLearningButton.module.css";

export function StartLearningButton() {
  return (
    <Button
      component={Link}
      href="/onboarding"
      variant="gradient"
      gradient={{ from: "amber.5", to: "amber.6", deg: 90 }}
      rightSection={<ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} />}
      classNames={{ root: classes.root, label: classes.label }}
    >
      Start Learning now
    </Button>
  );
}
