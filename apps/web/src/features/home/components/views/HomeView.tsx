"use client";

import { Button, Tabs } from "@mantine/core";
import {
  ArrowRight,
  BookOpen,
  Bot,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { isBackOfficeRole, useAuth } from "@/features/auth";
import { HomeCtaButton } from "@/features/home/components/blocks/HomeCtaButton";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { landingFont } from "@/shared/styles/landingFont";
import { landingContent } from "../../constants/landingContent";
import classes from "./HomeView.module.css";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/englow3-logo.png"
      alt="Englow3"
      width={compact ? 180 : 220}
      height={compact ? 56 : 69}
      className={classes.brand}
    />
  );
}

export function HomeView() {
  const { language, setLanguage } = useLanguage();
  const c = landingContent[language];
  const { session } = useAuth();
  const actionLabel = session
    ? isBackOfficeRole(session.role)
      ? c.workspace
      : c.continueLearning
    : c.start;
  return (
    <div className={`${classes.page} ${landingFont.variable}`}>
      <section className={classes.hero} aria-labelledby="landing-title">
        <Image
          src="/images/landing-campus-v3.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={classes.heroPhoto}
        />
        <div className={classes.heroShade} />
        <div className={classes.heroInner}>
          <h1 id="landing-title">
            {c.title}
            <br />
            {c.titleAccent}
          </h1>
          <p className={classes.heroDescription}>{c.description}</p>
          <div className={classes.actions}>
            <HomeCtaButton
              label={actionLabel}
              color="orange.5"
              className={classes.primary}
            />
            <Button
              component="a"
              href="#how-it-works"
              variant="white"
              color="brand.9"
              className={classes.secondary}
            >
              {c.how}
            </Button>
          </div>
          <p className={classes.heroNote}>
            <ShieldCheck size={16} aria-hidden="true" />
            {session ? c.signedInNote : c.note}
          </p>
        </div>
      </section>

      <section
        className={classes.numbersSection}
        aria-labelledby="numbers-title"
      >
        <div className={classes.container}>
          <h2 id="numbers-title">
            {c.numbersTitle} <span>{c.numbersAccent}</span>
          </h2>
          <p className={classes.sectionDescription}>{c.numbersDescription}</p>
          <dl className={classes.numbers}>
            {c.numbers.map((item) => (
              <div key={item.value}>
                <dt>{item.value}</dt>
                <dd>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="how-it-works"
        className={classes.stepsSection}
        aria-labelledby="steps-title"
      >
        <div className={classes.container}>
          <h2 id="steps-title">
            {c.stepsTitle} <span>{c.stepsAccent}</span>
          </h2>
          <p className={classes.sectionDescription}>{c.stepsDescription}</p>
          <Tabs
            defaultValue="0"
            orientation="horizontal"
            keepMounted={false}
            className={classes.journeyTabs}
          >
            <Tabs.List
              aria-label={c.stepsLabel}
              className={classes.diamondList}
            >
              {c.steps.map((step, i) => (
                <Tabs.Tab
                  key={step.title}
                  value={String(i)}
                  className={classes.diamondTab}
                >
                  <span className={classes.diamondFace} aria-hidden="true" />
                  <span className={classes.diamondText}>
                    <span className={classes.stepNumber}>0{i + 1}</span>
                    <span>{step.title}</span>
                  </span>
                </Tabs.Tab>
              ))}
            </Tabs.List>
            <div className={classes.loopDiamond} aria-hidden="true">
              <span className={classes.diamondFace} />
              <span className={classes.loopText}>{c.loopTile}</span>
            </div>
            {c.steps.map((step, i) => (
              <Tabs.Panel
                key={step.title}
                value={String(i)}
                tabIndex={0}
                className={classes.stepPanel}
              >
                <Image
                  src="/images/landing-study-v2.webp"
                  alt=""
                  fill
                  sizes="(min-width: 48em) 760px, 90vw"
                  className={classes.stepPhoto}
                />
                <div className={classes.stepShade} />
                <div className={classes.stepCopy}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </Tabs.Panel>
            ))}
          </Tabs>
        </div>
      </section>

      <section className={classes.tutorSection} aria-labelledby="tutor-title">
        <svg
          className={classes.tutorPattern}
          viewBox="0 0 1440 480"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path fill="var(--mantine-color-brand-9)" d="M0 0h1440v480H0z" />
          <path
            fill="var(--mantine-color-brand-8)"
            d="m720 0 240 240-240 240H240z"
          />
          <path
            fill="var(--mantine-color-brand-9)"
            d="m960 0 240 240-240 240H480z"
          />
          <path
            fill="var(--mantine-color-brand-7)"
            d="m1200 0 240 240-240 240H720z"
          />
          <path
            fill="var(--mantine-color-brand-8)"
            d="m1440 0-240 240 240 240z"
          />
          <path
            fill="var(--mantine-color-orange-5)"
            d="m-35 175 100 65-100 65z"
          />
        </svg>
        <div className={`${classes.container} ${classes.tutorGrid}`}>
          <div className={classes.tutorCopy}>
            <h2 id="tutor-title">
              {c.tutorTitle}
              <br />
              {c.tutorAccent}
            </h2>
            <p>{c.tutorDescription}</p>
          </div>
          <div className={classes.conversation}>
            <div className={classes.chatHeader}>
              <span>
                <Bot size={18} aria-hidden="true" /> Englow3 Tutor
              </span>
              <span>{c.illustration}</span>
            </div>
            <div className={classes.chatBody}>
              <div className={classes.studentBubble}>{c.chatQuestion}</div>
              <p>{c.chatAnswer}</p>
              <div className={classes.studentBubble}>
                I went to the library yesterday.
              </div>
              <p>{c.chatFeedback}</p>
            </div>
            <p className={classes.chatDisclaimer}>{c.chatDisclaimer}</p>
          </div>
        </div>
      </section>

      <section
        id="learning-path"
        className={classes.pathSection}
        aria-labelledby="path-title"
      >
        <div className={classes.container}>
          <p className={classes.eyebrow}>{c.pathEyebrow}</p>
          <h2 id="path-title">
            {c.pathTitle} <span>{c.pathAccent}</span>
          </h2>
          <p className={classes.sectionDescription}>{c.pathDescription}</p>
          <div className={classes.pathGrid}>
            <div className={classes.journeyPoster}>
              <svg
                className={classes.posterArt}
                viewBox="0 0 440 500"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="englow-poster-grid"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M22 0H0v22"
                      fill="none"
                      stroke="var(--mantine-color-brand-7)"
                      strokeWidth=".6"
                    />
                  </pattern>
                  <radialGradient id="englow-poster-glow">
                    <stop
                      stopColor="var(--mantine-color-brand-2)"
                      stopOpacity=".75"
                    />
                    <stop
                      offset="1"
                      stopColor="var(--mantine-color-brand-9)"
                      stopOpacity="0"
                    />
                  </radialGradient>
                </defs>
                <path fill="var(--mantine-color-brand-9)" d="M0 0h440v500H0z" />
                <path fill="url(#englow-poster-grid)" d="M0 0h440v500H0z" />
                <path
                  fill="none"
                  stroke="var(--mantine-color-brand-3)"
                  strokeOpacity=".65"
                  strokeWidth="3"
                  d="M0 0 220 330 440 0M0 36 220 365 440 36M0 95 220 410 440 95M0 220 220 460 440 220M0 380 220 490 440 380"
                />
                <ellipse
                  cx="220"
                  cy="365"
                  rx="180"
                  ry="115"
                  fill="url(#englow-poster-glow)"
                />
                <path
                  fill="var(--mantine-color-brand-4)"
                  fillOpacity=".2"
                  stroke="var(--mantine-color-brand-2)"
                  strokeWidth="2"
                  d="m95 365 125-57 125 57-125 57z"
                />
                <path
                  fill="var(--mantine-color-brand-0)"
                  d="m171 354 49-23 49 23-49 23z"
                />
              </svg>
              <div className={classes.posterContent}>
                <Brand compact />
                <strong>
                  ENGLISH
                  <br />
                  IN ACTION
                </strong>
                <p>{c.posterCaption}</p>
                <div className={classes.posterSymbol}>
                  <GraduationCap
                    size={54}
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <BookOpen size={30} strokeWidth={1.3} aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className={classes.pathCopy}>
              <p className={classes.pathListTitle}>{c.yourJourney}</p>
              <ol className={classes.pathList}>
                {c.path.map((item, i) => (
                  <li key={item.title}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className={classes.featuresSection}
        aria-labelledby="features-title"
      >
        <div className={classes.container}>
          <h2 id="features-title">
            {c.featuresTitle} <span>{c.featuresAccent}</span>
          </h2>
          <p className={classes.sectionDescription}>{c.featuresDescription}</p>
          <div className={classes.features}>
            {c.principles.map((item) => (
              <article key={item.title} className={classes.feature}>
                <span>{c.featuresNav}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={classes.ctaSection} aria-labelledby="cta-title">
        <Image
          src="/images/landing-auditorium-v3.webp"
          alt=""
          fill
          sizes="100vw"
          className={classes.ctaPhoto}
        />
        <div className={classes.ctaShade} />
        <div className={classes.ctaInner}>
          <Brand />
          <h2 id="cta-title">{c.ctaTitle}</h2>
          <p>{session ? c.signedInNote : c.ctaDescription}</p>
          <HomeCtaButton
            label={session ? actionLabel : c.loginCta}
            color="orange.5"
            className={classes.primary}
          />
        </div>
      </section>

      <footer className={classes.footer}>
        <Image
          src="/images/landing-campus-v3.webp"
          alt=""
          fill
          sizes="100vw"
          className={classes.footerPhoto}
        />
        <div className={classes.footerShade} />
        <div className={classes.container}>
          <div className={classes.footerGrid}>
            <div className={classes.footerBrand}>
              <Brand compact />
              <p>{c.footerDescription}</p>
            </div>
            <nav aria-label={c.footerNav}>
              <strong>{c.explore}</strong>
              <a href="#how-it-works">{c.howNav}</a>
              <a href="#features">{c.featuresNav}</a>
              <a href="#learning-path">{c.pathNav}</a>
            </nav>
            <div className={classes.footerAccess}>
              <strong>{c.accessNav}</strong>
              <HomeCtaButton
                label={session ? actionLabel : c.login}
                variant="transparent"
                className={classes.footerCta}
              />
              <p>{c.footerCta}</p>
            </div>
            <div className={classes.footerLanguages}>
              <strong>{c.languageNav}</strong>
              <button
                type="button"
                onClick={() => setLanguage("vi")}
                aria-pressed={language === "vi"}
              >
                Tiếng Việt <ArrowRight size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
              >
                English <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={classes.footerBottom}>
            <span>
              © {new Date().getFullYear()} Englow3 · {c.footerNote}
            </span>
            <span>{c.skills.join(" · ")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
