"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeHighlights.module.css";

/**
 * What the product covers. This used to be "150K+ learners, 98.4% improved,
 * 4.9/5" - figures nobody had measured. These are facts about Englow3 itself,
 * true on the day it launches.
 */
export function HomeHighlights() {
  const { t } = useLanguage();

  return (
    <section aria-label={t.home.highlightsAria} className={classes.strip}>
      <dl className={classes.list}>
        {t.home.highlights.map((item) => (
          <div key={item.value} className={classes.item}>
            <dt className={classes.value}>{item.value}</dt>
            <dd className={classes.label}>{item.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
