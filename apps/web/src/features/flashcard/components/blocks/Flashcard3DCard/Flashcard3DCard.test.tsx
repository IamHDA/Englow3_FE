import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FlashcardReviewStatus } from "@/lib/graphql/generated";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { FlashcardItem } from "../../../types";
import { useFlashcardStudy } from "../../../hooks/useFlashcardStudy";
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

const cards = [card];

function Harness({ onSpeak = vi.fn(), onFlip = vi.fn() }) {
  const { isFlipped, flipCard } = useFlashcardStudy({
    cards,
    setName: "Travel",
  });
  return (
    <MantineProvider theme={theme}>
      <LanguageProvider>
        <Flashcard3DCard
          card={card}
          isFlipped={isFlipped}
          onSpeak={onSpeak}
          onFlip={() => {
            onFlip();
            flipCard();
          }}
        />
      </LanguageProvider>
    </MantineProvider>
  );
}

describe("Flashcard face interaction", () => {
  it("lets Space flip the card after clicking any speaker with the pointer", async () => {
    const user = userEvent.setup();
    const onSpeak = vi.fn();
    const onFlip = vi.fn();
    render(<Harness onSpeak={onSpeak} onFlip={onFlip} />);
    const frontSpeakers = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-label") !== "Lật thẻ");

    for (const speaker of frontSpeakers) {
      await user.click(speaker);
      expect(screen.getByRole("group", { name: "airport" })).toHaveFocus();
      await user.keyboard(" ");
      expect(screen.getByRole("button", { name: "Lật lại" })).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Lật lại" }));
    }

    await user.click(screen.getByRole("button", { name: "Lật thẻ" }));
    const backSpeaker = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-label") !== null)!;
    await user.click(backSpeaker);
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Lật thẻ" })).toBeVisible();
    expect(onSpeak).toHaveBeenCalledTimes(3);
  });

  it("preserves native keyboard activation of the focused audio button", async () => {
    const user = userEvent.setup();
    const onSpeak = vi.fn();
    const onFlip = vi.fn();
    render(<Harness onSpeak={onSpeak} onFlip={onFlip} />);
    const speaker = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-label") !== "Lật thẻ")!;
    speaker.focus();
    await user.keyboard(" ");
    expect(onSpeak).toHaveBeenCalledTimes(1);
    expect(onFlip).not.toHaveBeenCalled();
    expect(speaker).toHaveFocus();
  });

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
