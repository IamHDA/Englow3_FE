import { Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

import { Page, PageHeader } from "@/shared/components/Page";

import type { LegalSection } from "../constants/legalContent";
import { LEGAL_UPDATED } from "../constants/operator";
import classes from "./LegalDocument.module.css";

type LegalDocumentProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
  /** The other document, linked at the foot so a reader of one finds the other. */
  sibling: { href: string; label: string };
};

/** A terms or privacy page: readable line length, numbered sections, nothing else on the page. */
export function LegalDocument({
  title,
  intro,
  sections,
  sibling,
}: LegalDocumentProps) {
  return (
    <Page width="focus">
      <PageHeader title={title} />
      <Text size="sm" c="ink.6">
        Cập nhật lần cuối: {LEGAL_UPDATED}
      </Text>
      <Text className={classes.intro}>{intro}</Text>
      <Stack gap="xl" component="article" className={classes.article}>
        {sections.map((section) => (
          <section key={section.title} aria-labelledby={slug(section.title)}>
            <Title
              order={2}
              id={slug(section.title)}
              className={classes.heading}
            >
              {section.title}
            </Title>
            {section.blocks.map((block, index) =>
              typeof block === "string" ? (
                <p key={index} className={classes.paragraph}>
                  {block}
                </p>
              ) : (
                <ul key={index} className={classes.list}>
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}
      </Stack>
      <Text size="sm">
        <Link href={sibling.href} className={classes.link}>
          {sibling.label}
        </Link>
        {" · "}
        <Link href="/pricing" className={classes.link}>
          Bảng giá
        </Link>
      </Text>
    </Page>
  );
}

function slug(title: string): string {
  return `legal-${title
    .replace(/^\d+\.\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9à-ỹ]+/gi, "-")}`;
}
