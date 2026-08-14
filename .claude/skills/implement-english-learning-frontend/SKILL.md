---
name: implement-english-learning-frontend
description: Implement, extend, refactor, or review the English Learning web frontend built with Next.js App Router, TypeScript, and Mantine, talking to an Apollo GraphQL BFF. Use for pages, layouts, reusable components, onboarding, exam taking, quizzes, speaking practice, progress dashboards, forms, GraphQL queries and mutations, loading and skeleton states, Mantine components and theming, authentication-aware UI, Lucide and custom icons, and frontend tests. Trigger it even when the request sounds like a plain task ("add a page for exam results", "why does this flash on load", "where should this component go") and names none of the above, because the placement, loading, and browser-security rules still govern the answer.
---

# English Learning Frontend

Next.js App Router, TypeScript, Mantine, React Hook Form with Zod, Apollo Client against a GraphQL BFF. The BFF is the only application backend the browser talks to.

Mantine is the styling system: its components, style props, and CSS Modules. No Tailwind utility classes, and no second component library alongside it. Reach for a Mantine component before writing a CSS rule - a `<div>` carrying `display: flex`, a hand-styled scrollbar, or a hand-built tab strip is a component that was not used.

Build one complete user-facing slice at a time: the route, its components, its GraphQL operations, its loading and error states, its tests. Do not scaffold folders that hold nothing.

## Start from repository evidence

1. Read repository instructions - `CLAUDE.md`, `AGENTS.md`, or `README.md`, whichever exists.
2. Inspect `package.json`, the router in use, `tsconfig.json` path aliases, the Mantine theme setup, the GraphQL codegen setup, the auth setup, a neighbouring feature, and its tests.
3. Reuse what is installed. Do not migrate between App Router and Pages Router, do not introduce Tailwind or another component library alongside Mantine, and do not add a state or data-fetching library unless the task requires it.
4. Preserve unrelated user changes.

Read [architecture.md](references/architecture.md) before adding or moving pages, components, hooks, schemas, or loading states. Read [graphql-integration.md](references/graphql-integration.md) for every BFF call, auth, upload, or third-party integration. Read [exam-flow.md](references/exam-flow.md) when touching exam taking, timers, or answer saving. Read [forms-icons-testing.md](references/forms-icons-testing.md) for forms, icons, accessibility, and tests.

## Classify the work first

- **Route/page** - the route file reads params, loads data, redirects, sets metadata, composes components. Nothing else.
- **Reusable UI** - inside the feature's `components/`: a `views/` file per route that fetches and composes, `blocks/` that render from props and never fetch - every block is its own folder with an `index.tsx`, even a one-file block, and a sub-component is a folder nested inside whatever uses it - and `parts/` only when blocks actually share something. What Mantine does not ship and no feature owns goes to `src/shared`, itself organised as `components/`, `hooks/`, `constants/`.
- **Display constant** - navigation links, tab definitions, labels, editorial copy: a file under the owning feature's `constants/`, or `shared/constants/`, holding the values and the view-shape type declared for them. Never inside a component file.
- **Interactive UI** - add `"use client"` at the smallest boundary that needs state, effects, browser APIs, or handlers.
- **Form** - React Hook Form with a Zod schema and the Zod resolver. Validation independent from rendering.
- **Data** - a GraphQL operation in the owning feature, typed by codegen. Never a hand-written type for a response, never a raw `fetch` to the BFF.
- **Third-party** - browser-safe clients only. Anything needing a secret, costing money, or changing business state goes through the BFF.
- **Layout** - a Mantine layout component (`Stack`, `Group`, `Flex`, `Center`, `SimpleGrid`, `Grid`, `Container`), never a `<div>` with flex or grid CSS. Only `Flex` accepts responsive values and a `component` prop.
- **Icon** - `lucide-react`. Only draw an SVG when Lucide has nothing that fits, and then it becomes its own component, placed with what it belongs to - a block, a feature's `parts/`, or `shared/components` if shared across features.

## Loading states

Three rules, applied in this order:

1. **Whole page loading → a `loading.tsx` file** in the route segment. It is the route-level Suspense boundary and renders a page-shaped skeleton.
2. **Part of a page loading → `<Suspense>`** around that part, so the rest of the page renders immediately. Use this when one section is meaningfully slower than the others.
3. **Every loading fallback is a named skeleton component** - `<ExamListSkeleton />`, built from Mantine's `Skeleton`. Never a spinner, never a "Loading..." string, never an empty fragment.

```tsx
// route level - src/app/(learner)/exams/loading.tsx
export default function Loading() {
  return <ExamListSkeleton />;
}

// section level
<Suspense fallback={<ProgressPanelSkeleton />}>
  <ProgressPanel />
</Suspense>;
```

A skeleton mirrors the shape of the content it stands in for, so nothing shifts when the real content arrives. A skeleton that is the wrong size is worse than no skeleton.

Skeletons are for content that is not there yet. A pending button or a saving indicator is not a skeleton case - disable the control and show its own state.

## Design the slice before editing

State briefly:

1. The owning feature and route.
2. Server Component and Client Component boundaries.
3. The GraphQL operations needed, and whether any field may come back null on partial failure.
4. Loading, empty, error, unauthorized, and success states - and where the skeleton boundaries sit.
5. Component inputs, callbacks, and what is reusable.
6. Zod validation and server-error mapping when a form is involved.
7. Auth, secret exposure, and idempotency concerns.
8. Whether this slice has a form or a logic-bearing hook - those get unit tests, nothing else does.

## Implement the smallest complete slice

1. Write the GraphQL operation and run codegen before wiring any UI.
2. Build the skeleton alongside the component, not after, named `<Component>Skeleton.tsx`.
3. Implement reusable components, then compose them in the route.
4. Represent loading, empty, error, validation, disabled, and success states explicitly.
5. Keep secrets and permanent provider credentials out of the browser.
6. Add unit tests for forms and for hooks holding time, persistence, retry, or multi-step state; otherwise rely on end-to-end coverage.
7. Run the formatter, linter, type checker, codegen, and relevant tests.

## Preserve boundaries

- No large feature implementation inside `page.tsx`; route files compose, they do not implement.
- No importing another feature's internal files - go through its `index.ts`, or lift the shared piece out.
- No fetching inside a block; the view owns the data boundary.
- No component split you cannot name with a business noun.
- No component file used in one place that holds no state and is not a client boundary worth paying for - write it where it is used.
- No file name that differs from its export, apart from a block folder's `index.tsx`, which takes the folder's name.
- No raw `fetch` to the BFF, and no hand-written response types where codegen produces them.
- No comparing a schema enum against a bare string or number - use the generated enum, and `switch` on it exhaustively.
- No magic number or identifier string in a condition or calculation - name it, in the file if it is used once, in `constants/` if it is shared. A rule the backend owns is read from the query, not copied.
- No `NEXT_PUBLIC_*` variable holding a secret.
- No direct call to PostgreSQL, to object storage with permanent credentials, or to an AI provider with a permanent key.
- No hand-drawn SVG where Lucide has the icon, and no SVG markup pasted inline into a page or feature component.
- No Tailwind utility classes and no CSS-in-JS - style with Mantine props for one-off spacing and colocated CSS Modules for anything reused.
- No `<div>` carrying `display: flex` or `display: grid` - that is `Stack`, `Group`, `Flex`, `Center`, `SimpleGrid`, or `Grid`. Nest two of them for uneven rhythm rather than putting margins back on the children.
- No rebuilding what Mantine already ships, in `shared/components` or inline - `Button`, `Skeleton`, `Modal`, `TextInput`, and equally `ScrollArea` for a styled scrollbar, `Tabs`, `Accordion`, `Tooltip`, `Popover`, `Drawer`, `Stepper`, `Pagination`, `Table`, `Divider`, `Paper`. Wrap or theme it instead; a hand-rolled one is the keyboard handling and ARIA you now own.
- No sub-component sitting beside its parent instead of inside it, and no empty `shared/` subfolder waiting for its first file.
- No duplicated Zod rules inside event handlers.
- No global state for local component or form state.
- No `useEffect` for fetching, deriving state, or resetting a form - effects are for synchronizing with something outside React, and each one started must be cleaned up.
- No `utils` or `helpers` dumping grounds.
- No unit test for a component without a form, and none for a hook that only wraps a query or returns a flag.

## Verify before handing off

Formatting, linting, type checking, codegen output committed, Zod and form behaviour, component roles and accessible names, no remaining CSS that a Mantine component already expresses, GraphQL operation and error handling, server/client boundaries, every loading and error state rendered, production build and affected end-to-end flows.

Report the behaviour implemented, the boundary decisions made, the checks actually run, and any remaining risk. Do not claim validation that was skipped or failed.
