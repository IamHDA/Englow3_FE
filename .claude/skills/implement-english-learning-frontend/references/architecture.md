# Frontend architecture

## Contents

1. Baseline structure
2. Page and component ownership
3. Server and client boundaries
4. Loading, skeletons, and Suspense
5. Types, schemas, hooks, and state
6. Feature examples

## Baseline structure

```text
src/
├── app/                             Route tree only - page, layout, loading, error
│   ├── (auth)/
│   ├── (learner)/
│   └── (admin)/
├── features/
│   └── <feature>/
│       ├── components/
│       │   ├── views/               Fetch data, compose blocks
│       │   ├── blocks/              Render from props, never fetch
│       │   │   └── <BlockName>/     Folder once it has a skeleton or sub-components
│       │   └── parts/               UI shared between this feature's blocks
│       ├── hooks/                   Behaviour extracted out of components
│       ├── schemas/                 Zod schemas
│       ├── graphql/                 Documents and fragments
│       ├── types.ts
│       └── index.ts                 What other features may import
├── components/
│   └── ui/                          Domain-neutral primitives, including Skeleton
├── lib/
│   ├── apollo/                      Client setup, links, cache policies
│   ├── graphql/generated/           Codegen output - never edited by hand
│   └── auth/                        Session access, token retrieval
├── config/                          Typed public runtime configuration
└── types/                           Cross-feature types only - keep nearly empty
```

The division is **feature first, file kind second**. Everything about exams lives under `features/exam`, so changing that feature means opening one folder and removing it means deleting one folder. This mirrors how the backend is divided, and the reasoning is the same: ownership matters more than file kind.

`src/app` holds route files only. A route composes a view; it never holds the implementation.


The division is **feature first, file kind second**. Everything about exams lives under `features/exam`, so changing that feature means opening one folder and removing it means deleting one folder. This mirrors how the backend is divided, and the reasoning is the same: ownership matters more than file kind.

`src/app` holds route files only. A route composes feature components; it never holds the implementation.


If the repository uses Pages Router, preserve it and apply the same separation. Do not create both routers without an explicit migration plan.

## Page and component ownership

Keep `page.tsx` small. It may read route and search params, load data, apply auth redirects, set metadata, and compose feature components. Move substantial rendering and interaction into the feature's view and blocks.

```tsx
// src/app/(learner)/onboarding/page.tsx
import { OnboardingFlow } from "@/features/onboarding";

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
```

Use `src/components/ui` only for domain-neutral primitives - button, field, dialog, skeleton. `ExamTimer`, `SpeakingRecorder`, and `SkillProgressChart` belong to their own features.

A feature may import `components/ui`, `lib`, `config`, and another feature's `index.ts`. Reaching into another feature's internal files is the frontend version of writing to another module's tables - if two features need the same piece, lift it into `components/ui` or its own feature rather than importing across.

Route protection belongs in middleware, not in each page. A per-page redirect check is one forgotten file away from an unprotected route. Page-level checks remain useful for role-specific redirects, but they are not the boundary - and neither is hiding a button.

## Views, blocks, and parts

Inside a feature, `components/` has three tiers, and the split is about **who fetches**:

- **`views/`** - one per route. Fetches the data and composes blocks. `ExamDetailView` pairs with `app/(learner)/exams/[id]/page.tsx`, and the page stays thin: read the params, render the view.
- **`blocks/`** - render from props. A block never fetches. If it needs data, its view passes it down.
- **`parts/`** - UI shared between this feature's own blocks. Create this folder only when something is actually shared; do not make it up front.

The rule that carries the weight is **blocks do not fetch**. It keeps the data boundary in one place per route, and it makes blocks testable without Apollo or a mocked schema. It also lines up with Server and Client Components: the view is usually a Server Component, and only the blocks that need interaction carry `"use client"`.

**A block starts as a single file and becomes a folder when it earns one** - when it gains a skeleton, or sub-components that only it uses:

```text
blocks/ExamStartButton.tsx           still one file

blocks/ExamHeader/                   grew a skeleton and a sub-component
├── index.tsx                        the block itself, exports ExamHeader
├── ExamHeaderSkeleton.tsx
└── ExamStatusBadge.tsx
```

The folder is the block's name, so imports stay short: `blocks/ExamHeader`. The skeleton and sub-components are imported by their own path.

The folder gives those sub-components somewhere to live without cluttering `blocks/` or being promoted to `parts/` they do not belong in. Anything in a block folder is private to that block; the moment a second block needs it, move it to `parts/`.

A small feature - one view, two blocks - can stay flat in `components/` and grow into the three tiers later. Three folders holding one file each help nobody.

Shared beyond one feature goes to `components/ui` if it is domain-neutral, or to its own feature if it is not. Never import another feature's blocks directly.

## Splitting a component

One component per file, named for what it renders.

When a file feels long, check what is making it long. Usually it is logic, not markup - and extracting more components pushes that logic into props passed back and forth, which reads worse. Extract the logic into a hook instead:

```tsx
export function ExamRunner({ attempt }: { attempt: Attempt }) {
  const { remaining, expired } = useExamTimer(attempt.expiresAt);
  const { save, saveState } = useAnswerAutosave(attempt.id);
  ...
}
```

`useExamTimer` then holds the recomputation on focus, the sleep handling, and the warning threshold - and is testable without rendering anything.

Split a component when it does two jobs, when a piece is reused, or when a piece owns state nothing else touches. Do not split merely because a file is long, and do not split a piece you cannot name.

The naming test: a business noun means it is a real component - `ExamTimer`, `QuestionNav`, `SaveIndicator`. `ExamDetailSection2` is not a concept, it is a cut.

Create a subfolder under `blocks/` when a sub-flow reaches four or five components that serve only it - for example an exam-taking flow with a runner, a timer, a navigator, a save indicator, and one renderer per answer format. Below that, keep it flat.

## File naming

- Component files use UpperCamelCase matching the export: `ExamCard.tsx` exports `ExamCard`. No `.skeleton.tsx` or `.block.tsx` suffixes - the file name is the export name.
- A skeleton sits beside its component: `ExamCard.tsx` and `ExamCardSkeleton.tsx`.
- The one exception is a block folder's entry file, which is `index.tsx` and holds the block itself. It takes its name from the folder: `blocks/ExamHeader/index.tsx` exports `ExamHeader`, imported as `blocks/ExamHeader`. Every other file in that folder still uses its own name.
- Hooks use camelCase with the `use` prefix: `useExamTimer.ts`.
- Next.js reserved files keep their required lowercase names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `middleware.ts`.
- Everything else follows the convention already in the repository.

## Server and client boundaries

Server Components by default. Add `"use client"` only when a component needs state or effects, event handlers, React Hook Form, browser storage, media devices or recording, WebSocket, or a browser-only SDK.

Keep the client boundary low in the tree. Do not mark a whole page as a Client Component because one child is interactive.

Never import server-only modules, secret configuration, or privileged SDKs into a Client Component.

## Loading, skeletons, and Suspense

`<Suspense>` comes from React; Next.js uses it for streaming, so parts of a page can arrive independently.

**Route level.** A `loading.tsx` in the segment is an automatic Suspense boundary around it. Use it whenever the whole page has nothing meaningful to show yet.

```tsx
// src/app/(learner)/exams/loading.tsx
import { ExamListSkeleton } from "@/features/exam";

export default function Loading() {
  return <ExamListSkeleton />;
}
```

**Section level.** Wrap the slow part so the rest renders immediately.

```tsx
export default function DashboardPage() {
  return (
    <>
      <ProfileHeader />
      <Suspense fallback={<ProgressPanelSkeleton />}>
        <ProgressPanel />
      </Suspense>
    </>
  );
}
```

Note what this does and does not split. Suspense boundaries follow *which component fetches*, not which field of one response is slow. A single aggregate query behind one component gets one boundary; showing panels independently means separate operations per panel, which trades round trips for perceived speed. Decide deliberately rather than by accident.

**The fallback is always a skeleton.** Never a spinner, never a "Loading..." string, never an empty fragment.

- The `Skeleton` primitive lives in `src/components/ui/skeleton.tsx`.
- A feature skeleton lives beside the component it stands in for - `ExamList.tsx` and `ExamListSkeleton.tsx`.
- The skeleton mirrors the real layout - same rough box sizes, same number of rows, same spacing - so nothing shifts when content arrives. A wrongly sized skeleton is worse than none.
- Skeletons are for content not yet present. A submitting button or a saving indicator is not a skeleton case: disable the control and show its own pending state.

`error.tsx` is the matching boundary for failures and is a Client Component. A route with a `loading.tsx` and no `error.tsx` degrades badly on failure.

## Types, schemas, hooks, and state

- Response types come from GraphQL codegen. Do not hand-write a type for something the schema already describes.
- Keep Zod schemas under the feature's `schemas/`; colocate a one-off schema with its form if repository convention prefers that.
- Keep hooks under the feature's `hooks/`, named by behaviour - `useSpeakingRecorder`. A hook used by several features moves to `lib/`.
- Local state for local UI; React Hook Form for form state; the Apollo cache for server state. Do not add TanStack Query, SWR, Redux, or Zustand speculatively - Apollo already holds server state.
- Do not mirror backend entities in global frontend types. Define only the view shapes the UI needs.

## Feature examples

```text
src/app/(learner)/exams/[examId]/page.tsx
src/app/(learner)/exams/[examId]/loading.tsx
src/features/exam/components/views/ExamDetailView.tsx
src/features/exam/components/blocks/ExamHeader/index.tsx
src/features/exam/components/blocks/ExamHeader/ExamHeaderSkeleton.tsx
src/features/exam/components/blocks/ExamHeader/ExamStatusBadge.tsx
src/features/exam/components/blocks/ExamStartButton.tsx
src/features/exam/graphql/examDetail.graphql
src/features/exam/index.ts
```

```text
src/app/(learner)/speaking/page.tsx
src/features/speaking/components/views/SpeakingView.tsx
src/features/speaking/components/blocks/SpeakingRecorder/index.tsx
src/features/speaking/components/blocks/SpeakingRecorder/RecordingLevelMeter.tsx
src/features/speaking/components/blocks/AnalysisResult/index.tsx
src/features/speaking/components/blocks/AnalysisResult/AnalysisResultSkeleton.tsx
src/features/speaking/components/parts/ScoreBadge.tsx
src/features/speaking/hooks/useSpeakingRecorder.ts
src/features/speaking/graphql/submitSpeaking.graphql
```
