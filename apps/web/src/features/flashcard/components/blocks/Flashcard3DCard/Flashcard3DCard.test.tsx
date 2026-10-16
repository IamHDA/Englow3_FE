import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FlashcardReviewStatus } from "@/lib/graphql/generated";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { FlashcardItem } from "../../../types";
import { Flashcard3DCard } from "./index";

const card: FlashcardItem = {
  id: "card",
  orderNo: 1,
  lemma: "airport",
  partOfSpeech: "noun",
  senseLabel: "airport",
  ipaUs: "/ˈer.pɔːrt/",
  ipaUk: null,
  audioUsUrl: null,
  audioUkUrl: null,
  definitionVi: "sân bay",
  definitionEn: "A place where aircraft arrive and depart.",
  exampleSentence: "We arrived at the airport.",
  exampleTranslationVi: null,
  mnemonicTipVi: null,
  cefrLevel: "A1",
  status: FlashcardReviewStatus.NEW,
  dueAt: null,
  lapseCount: 0,
};

function Harness({ onSpeak = vi.fn(), onFlip = vi.fn() }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <MantineProvider theme={theme}>
      <LanguageProvider>
        <Flashcard3DCard
          card={card}
          isFlipped={flipped}
          onSpeak={onSpeak}
          onFlip={() => {
            onFlip();
            setFlipped((value) => !value);
          }}
        />
      </LanguageProvider>
    </MantineProvider>
  );
}

describe("Flashcard face interaction", () => {
  it("exposes only the current face and flips back exactly once", () => {
    const onFlip = vi.fn();
    render(<Harness onFlip={onFlip} />);
    expect(
      screen.queryByRole("button", { name: "Lật lại" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Lật thẻ" }));
    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Lật lại" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Lật thẻ" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Lật lại" }));
    expect(onFlip).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Lật thẻ" })).toBeInTheDocument();
  });

  it("does not flip when playing pronunciation and makes the hidden face inert", () => {
    const onFlip = vi.fn(),
      onSpeak = vi.fn();
    const { container } = render(<Harness onFlip={onFlip} onSpeak={onSpeak} />);
    const face = container.querySelector('[aria-hidden="true"]');
    expect(face).toHaveAttribute("inert");
    fireEvent.click(
      screen
        .getAllByRole("button")
        .find((button) => button.getAttribute("aria-label") !== "Lật thẻ")!,
    );
    expect(onSpeak).toHaveBeenCalledWith("airport");
    expect(onFlip).not.toHaveBeenCalled();
  });
});
