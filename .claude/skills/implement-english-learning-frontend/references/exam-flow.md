# Exam taking

The hardest UI in this product, and the one most likely to fail in front of an audience. Everything here is about a session that must survive a refresh, a lost connection, and a closed laptop.

## Contents

1. The timer
2. Saving answers
3. Recovering a session
4. Submitting
5. Rendering question types

## The timer

The backend owns the deadline. The attempt has a server-issued expiry, and that is the only authority.

- Compute remaining time from the server expiry, not by counting down from a duration. A tab that was backgrounded, a sleeping laptop, and a clock skew all break a local countdown.
- Re-derive remaining time on mount, on tab focus, and after any server response that carries the expiry.
- Never let the client decide the attempt has expired for scoring purposes. It stops the UI; the backend rejects late submissions.
- Show a warning threshold, and make the final minute visually distinct without being alarming.

If the timer reaches zero, submit what exists rather than discarding it, then let the server decide the outcome.

## Saving answers

Save as the learner answers, not only at the end. A single submit at the end means one network failure loses the whole attempt.

- Save per answer, debounced, keyed by attempt and question.
- Saving is idempotent - the same answer sent twice is one row, and the backend enforces that with its uniqueness rule.
- Failed saves retry with backoff and remain visible in the UI. A silent failure is the worst outcome here.
- Keep a local copy of unsaved answers so a refresh or a dropped connection does not lose typing in progress.
- Show save state per question or as one quiet indicator - never a skeleton, and never a blocking spinner.

Do not block navigation between questions on a save completing. The learner should keep moving while saves settle behind them.

## Recovering a session

A learner will refresh, or their browser will crash. On entering an attempt that is already in progress:

1. Load the attempt with its answers from the server.
2. Merge anything held locally that the server has not acknowledged, preferring the newer value and flagging genuine conflicts rather than silently overwriting.
3. Restore position - the question they were on - so they are not dropped back at question one.
4. Re-derive the remaining time from the server expiry.

An attempt in a terminal state redirects to the result view rather than reopening the exam.

## Submitting

- Disable the submit control while the request is in flight, and rely on backend idempotency as the real guard - a disabled button is not a guarantee.
- Confirm before submitting, and show how many questions are unanswered.
- After submitting, the attempt usually enters a scoring state rather than completing immediately, because free-text and audio answers are graded asynchronously. Show the result page with a skeleton for the parts not yet scored, and poll until the attempt reaches a terminal state.
- Warn on navigating away mid-attempt, but do not rely on that warning - the session must survive leaving anyway.

## Rendering question types

One renderer per answer format, chosen by the question's type, not by its skill or category:

- **Single and multiple choice** - options belonging to the question.
- **Matching** - options shared across a group of questions. When the group's options are single-use, reflect that in the UI: an option already chosen elsewhere is shown as taken, and choosing it moves it rather than duplicating it.
- **Fill in blank and short answer** - a text input, with any word limit shown from the group's instruction.
- **Essay** - a textarea with a word counter and local drafting.
- **Audio response** - recording, with explicit permission handling, a visible recording state, playback before submitting, and upload through a pre-signed URL.

Shared context - a passage, an audio clip, an image, a cue card - belongs to the part or group and is rendered once for all its questions, never repeated per question.

Audio in listening sections often has play-count rules. If the exam defines one, enforce it in the UI and record what happened; do not assume unlimited replays.
