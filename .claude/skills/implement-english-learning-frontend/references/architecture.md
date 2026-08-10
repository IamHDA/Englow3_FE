# Frontend architecture

## Contents

1. Baseline structure
2. Page and component ownership
3. Views, blocks, and parts
4. Splitting a component
5. File naming
6. Styling with Mantine
7. Server and client boundaries
8. Loading, skeletons, and Suspense
9. Types, schemas, hooks, and state
10. Effects
11. Feature examples

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
│       │   │   └── <BlockName>/     Every block is a folder, even a single file
│       │   └── parts/               UI shared between this feature's blocks
│       ├── hooks/                   Behaviour extracted out of components
│       ├── constants/               Display types and static values
│       ├── schemas/                 Zod schemas
│       ├── graphql/                 Documents and fragments
│       ├── types.ts
│       └── index.ts                 What other features may import
├── shared/                          The same shape, owned by no feature
│   ├── components/                  Wrappers and compositions Mantine does not ship
│   ├── hooks/
│   └── constants/
├── lib/
│   ├── apollo/                      Client setup, links, cache policies
│   ├── graphql/generated/           Codegen output - never edited by hand
│   ├── mantine/                     Theme and provider setup
│   └── auth/                        Session access, token retrieval
├── config/                          Typed public runtime configuration
└── types/                           Cross-feature types only - keep nearly empty
```

The division is **feature first, file kind second**. Everything about exams lives under `features/exam`, so changing that feature means opening one folder and removing it means deleting one folder. This mirrors how the backend is divided, and the reasoning is the same: ownership matters more than file kind.

`src/app` holds route files only. A route composes a view; it never holds the implementation.

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

`src/shared` is a module like any feature - `components/`, `hooks/`, `constants/` - it just belongs to no feature. Put in `shared/components` what Mantine does not already provide and no single feature owns: thin wrappers or compositions built from Mantine primitives - a `ConfirmDialog` built from Mantine's `Modal`, an empty-state block used on several screens, the site header. Do not rebuild `Button`, `Skeleton`, `Modal`, or `TextInput` from scratch here; Mantine already ships them. `ExamTimer`, `SpeakingRecorder`, and `SkillProgressChart` belong to their own features regardless.

Create only the `shared` subfolders that hold something. An empty `hooks/` waiting for its first hook is noise.

A feature may import `shared`, `lib`, `config`, and another feature's `index.ts`. Reaching into another feature's internal files is the frontend version of writing to another module's tables - if two features need the same piece, lift it into `shared` or its own feature rather than importing across.

Route protection belongs in middleware, not in each page. A per-page redirect check is one forgotten file away from an unprotected route. Page-level checks remain useful for role-specific redirects, but they are not the boundary - and neither is hiding a button.

## Views, blocks, and parts

Inside a feature, `components/` has three tiers, and the split is about **who fetches**:

- **`views/`** - one per route. Fetches the data and composes blocks. `ExamDetailView` pairs with `app/(learner)/exams/[id]/page.tsx`, and the page stays thin: read the params, render the view.
- **`blocks/`** - render from props. A block never fetches. If it needs data, its view passes it down.
- **`parts/`** - UI shared between this feature's own blocks. Create this folder only when something is actually shared; do not make it up front.

The rule that carries the weight is **blocks do not fetch**. It keeps the data boundary in one place per route, and it makes blocks testable without Apollo or a mocked schema. It also lines up with Server and Client Components: the view is usually a Server Component, and only the blocks that need interaction carry `"use client"`.

**Every block is a folder, always** - even one with a single file inside. This is not a threshold to cross; it is the shape from the start:

```text
blocks/ExamStartButton/
└── index.tsx                        the block itself, exports ExamStartButton

blocks/ExamHeader/
├── index.tsx                        the block itself, exports ExamHeader
├── ExamHeader.module.css
├── ExamHeaderSkeleton.tsx
└── ExamStatusBadge/
    ├── index.tsx
    └── ExamStatusBadge.module.css
```

The folder is the block's name, so imports stay short and constant whether the block has one file or five: `blocks/ExamStartButton`, `blocks/ExamHeader`. Adding a skeleton or a sub-component later never changes the import path or requires moving the block's own file - there is no promotion step from file to folder to get right or forget.

The folder gives room for sub-components without cluttering `blocks/` or being promoted to `parts/` they do not belong in. Anything in a block folder is private to that block; the moment a second block needs it, move it to `parts/`.

**A sub-component nests inside whatever uses it, and it is a folder too.** The same rule applies at every depth, so the folder tree is the component tree - open a folder and you see what that component is made of, without reading its imports. Something used by exactly one sub-component sits inside *that* sub-component, not beside it:

```text
shared/components/SiteHeader/
├── index.tsx                        SiteHeader - renders the logo and the nav
├── SiteHeader.module.css
└── SiteHeaderNav/                   the only thing SiteHeader composes
    ├── index.tsx
    ├── SiteHeaderNav.module.css
    ├── SiteHeaderLoginButton/       used by the nav, so it lives under the nav
    │   ├── index.tsx
    │   └── SiteHeaderLoginButton.module.css
    └── StudyMenuDropdown/
        ├── index.tsx
        └── StudyMenuDropdown.module.css
```

Flattening those four into one folder loses the fact that the login button and the dropdown belong to the nav rather than to the header, and it is the first step towards someone importing one of them from elsewhere.

The one thing that stays a flat file beside its component is its skeleton: `ExamHeaderSkeleton.tsx` is not a component in its own right, it is the same component's placeholder.

Deep nesting is a symptom, not a goal. Four levels means the top component does too much - the fix is a smaller component, not a shallower folder.

A small feature - one view, two blocks - can stay flat in `components/` and grow into the three tiers later. Three folders holding one file each help nobody.

Shared beyond one feature goes to `shared/components` if it is domain-neutral, or to its own feature if it is not. Never import another feature's blocks directly.

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

### When not to split

A component file has to answer what it buys. These count:

- it is used in more than one place;
- it owns state, an effect, or a handler nothing else touches;
- it is a distinct section of the page with its own CSS Module, so its class names stay short and cannot collide;
- it is one of several interchangeable variants chosen at runtime - one renderer per question type;
- it is the `"use client"` boundary that keeps a parent on the server, *and* that parent has a real reason to stay there - it fetches, it reads server-only configuration, or the subtree it would drag across is large.

None of them apply? Write it where it is used. A wrapper whose whole body is one Mantine component with props is not a component, it is a variable that took a folder.

The last one is the trap, and it needs measuring rather than assuming. Mantine components carry their own `"use client"`, so rendering one from a Server Component already works - but passing `component={Link}` to it does not, because a component reference is a function and functions do not cross the server-client boundary. That failure is what usually produces the one-line client wrapper. Before keeping the wrapper for that reason, check what absorbing the boundary into the parent actually costs: for a static marketing section whose children are Mantine components anyway, it was measured at under 2 KB of extra client JavaScript with the page still fully prerendered. For a view that fetches, the same move costs the whole data boundary and is not on the table.

Under about 50 lines with none of the benefits above is the familiar shape of a file that should not exist - but 50 is a prompt to look, not a rule. A 29-line block that is a real page section with 57 lines of its own CSS earns its place; a 22-line wrapper around one `<Button>` does not.

Splitting is not free. Every split adds a folder to open, an import to follow, and a name to invent. One 60-line component is easier to read than three 20-line files pointing at each other.

A sub-flow with four or five components that serve only it - for example an exam-taking flow with a runner, a timer, a navigator, a save indicator, and one renderer per answer format - can be grouped under a shared subfolder inside `blocks/`, each still its own block folder: `blocks/exam-taking/ExamRunner/`, `blocks/exam-taking/ExamTimer/`. This is about grouping related blocks together, not about whether any single block is a folder - every block is a folder regardless of group size.

## File naming

- Component files use UpperCamelCase matching the export: `ExamCard.tsx` exports `ExamCard`. No `.skeleton.tsx` or `.block.tsx` suffixes - the file name is the export name.
- A skeleton sits beside its component: `ExamCard.tsx` and `ExamCardSkeleton.tsx`.
- The one exception is a block folder's entry file, which is `index.tsx` and holds the block itself. It takes its name from the folder: `blocks/ExamHeader/index.tsx` exports `ExamHeader`, imported as `blocks/ExamHeader`. Every other file in that folder still uses its own name.
- Hooks use camelCase with the `use` prefix: `useExamTimer.ts`.
- Next.js reserved files keep their required lowercase names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `middleware.ts`.
- Everything else follows the convention already in the repository.

## Styling with Mantine

Mantine is the only styling system. No Tailwind, no second component library, no ad hoc inline `style` objects except for values computed at runtime that cannot be expressed any other way.

- **Theme** lives in `src/lib/mantine/theme.ts` and is passed to a single `MantineProvider` in the root layout, alongside Mantine's colour-scheme script. Do not create a second provider or a second theme object anywhere else in the tree.
- **One-off spacing and layout** use Mantine's style props - `p`, `m`, `gap`, `w`, `c`, `bg` - directly on the component. Reach for these first.
- **Anything reused, or a real selector** - hover states, pseudo-elements, media queries - goes in a colocated CSS Module: `ExamHeader.module.css` beside `index.tsx` in that block's folder. Import it as `classes` and apply with `className={classes.header}`.
- **Do not reimplement what Mantine ships.** A loading placeholder is Mantine's `Skeleton`, a dialog is `Modal`, a form field is `TextInput` or `Select` - not a hand-rolled div styled to look like one.

Mantine hooks - `useDisclosure`, `useMantineTheme`, and similar - only work in a Client Component, same as any other hook. This is an ordinary instance of the Server/Client boundary rule below, not a special case.

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

- A fallback is always a named feature skeleton - `<ExamListSkeleton />` - not a bare `<Skeleton />`. That named component is built *from* Mantine's `Skeleton`, which needs no wrapper of its own in `shared/components`.
- A feature skeleton lives beside the component it stands in for - `ExamList.tsx` and `ExamListSkeleton.tsx`.
- The skeleton mirrors the real layout - same rough box sizes, same number of rows, same spacing - so nothing shifts when content arrives. A wrongly sized skeleton is worse than none.
- Skeletons are for content not yet present. A submitting button or a saving indicator is not a skeleton case: disable the control and show its own pending state.

`error.tsx` is the matching boundary for failures and is a Client Component. A route with a `loading.tsx` and no `error.tsx` degrades badly on failure.

## Types, schemas, hooks, and state

- Response types come from GraphQL codegen. Do not hand-write a type for something the schema already describes.
- Keep display types and static values under the feature's `constants/`, one file per subject - navigation links, tab definitions, level labels, editorial copy the design ships with, and the view-shape type each of them is declared against. `shared/constants/navigation.ts` holds `NavLink` next to the links themselves, because the type exists to describe that data and nothing else.
- `types.ts` is for the few types a feature uses across several of its files and that are not tied to one constant. If a feature's `types.ts` holds one type used by one constant, they belong in the same `constants/` file.
- A `constants/` file is fixed content the design owns. The moment a value comes from the BFF it is a query result, not a constant, no matter how rarely it changes.
- Keep Zod schemas under the feature's `schemas/`; colocate a one-off schema with its form if repository convention prefers that.

### No magic numbers

A bare literal in a condition or a calculation is a value whose meaning lives only in the head of whoever typed it. Give it a name.

```tsx
if (remainingMs < 60_000) { ... }                  // no - 60000 what, and why?
if (remainingMs < TIMER_WARNING_MS) { ... }        // yes

const WORD_LIMIT = 250;
const AUTOSAVE_DEBOUNCE_MS = 800;
const MAX_LISTENING_PLAYS = 2;
```

Where the name goes follows the same rule as any other code:

- Used once, inside one file → a `const` at the top of that file. Do not create a `constants/` file for it.
- Used by more than one file in a feature, or part of the product's rules rather than one component's layout → the feature's `constants/`.
- Coming from the backend - a deadline, a word limit the exam defines, a play count - it is not a constant at all. Read it from the query result. A hard-coded copy of a backend rule is worse than a magic number, because it goes stale without anything failing.

The same applies to strings that act as identifiers: a status, a question type, a role, a storage key. If it comes from the schema, use the generated enum; if it is ours, name it.

Not every literal needs a name. `0`, `1`, and `-1` in ordinary arithmetic, an array index, and a value whose meaning is complete in the line it appears on - `items.length > 0`, `gap={4}` on a Mantine component - stay as they are. Naming those adds a lookup without adding meaning. The test is whether a reader has to ask *why that number*.

Sizes, spacing, colours, and breakpoints are not this problem - they belong in the theme or a CSS Module, not in a named JavaScript constant.
- Keep hooks under the feature's `hooks/`, named by behaviour - `useSpeakingRecorder`. A hook used by several features moves to `lib/`.
- Local state for local UI; React Hook Form for form state; the Apollo cache for server state. Do not add TanStack Query, SWR, Redux, or Zustand speculatively - Apollo already holds server state.
- Do not mirror backend entities in global frontend types. Define only the view shapes the UI needs.

## Effects

`useEffect` is for synchronizing with something outside React - a media device, a browser event, a timer, a subscription. It is not a general-purpose "run some code" hook, and most effects in a codebase like this one are a sign that data is being fetched or derived in the wrong place.

Legitimate here: recording audio, listening for `focus` or `visibilitychange` to recompute a deadline, debounced autosave timers, a polling loop with a terminal condition. Each of these talks to something React does not own, and each belongs in a hook rather than inline in a component.

Not an effect - each of these has a direct replacement:

| Reaching for an effect to... | Do this instead |
|---|---|
| Fetch data on mount | Fetch in the view - a Server Component, or `useSuspenseQuery` |
| Reset a form once data arrives | Pass values as props from the view, or use React Hook Form's `values` option |
| Derive state from props | Compute it during render; memoize only if profiling says so |
| Copy a prop into state to keep them in sync | Use the prop; if it must be resettable, key the component instead |
| React to a user action | Do it in the event handler |

The rule of thumb: if an effect's dependency array is made of props or state and its body sets state, it is derived data and belongs in the render path.

Cleanup is part of the contract, not an optional extra. Every listener, timer, interval, subscription, and media stream started in an effect is torn down in its cleanup function - an exam page that leaves a recorder or an interval running behind it is a bug that only shows up after navigating a few times.

## Feature examples

```text
src/app/(learner)/exams/[examId]/page.tsx
src/app/(learner)/exams/[examId]/loading.tsx
src/features/exam/components/views/ExamDetailView.tsx
src/features/exam/components/blocks/ExamHeader/index.tsx
src/features/exam/components/blocks/ExamHeader/ExamHeaderSkeleton.tsx
src/features/exam/components/blocks/ExamHeader/ExamStatusBadge.tsx
src/features/exam/components/blocks/ExamStartButton/index.tsx
src/features/exam/constants/examStatusLabels.ts
src/features/exam/graphql/examDetail.graphql
src/features/exam/index.ts
```

```text
src/shared/components/SiteHeader/index.tsx
src/shared/components/SiteHeader/SiteHeaderNav/index.tsx
src/shared/components/SiteHeader/SiteHeaderNav/StudyMenuDropdown/index.tsx
src/shared/constants/navigation.ts
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
