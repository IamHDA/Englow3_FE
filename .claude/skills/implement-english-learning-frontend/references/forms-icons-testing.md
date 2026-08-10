# Forms, icons, accessibility, and testing

## Contents

1. React Hook Form and Zod
2. Server validation errors
3. Icons
4. Accessibility and interaction
5. Testing

## React Hook Form and Zod

Use Zod as the validation source and React Hook Form for form state:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  targetScore: z.coerce.number().min(0).max(9).optional(),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { targetScore: undefined },
});
```

Rules:

- Infer form values from the schema; do not manually duplicate the type.
- Use controlled adapters only for components that require them; prefer `register` for native inputs.
- Provide stable `defaultValues` to avoid uncontrolled/controlled transitions.
- Keep cross-field rules in `superRefine` and attach issues to the relevant field.
- Use `valueAsNumber`, `z.coerce`, or explicit preprocessing deliberately for HTML input strings.
- Plain Mantine inputs - `TextInput`, `Textarea`, `PasswordInput`, `Checkbox` - forward a ref and work directly with `register`. Inputs whose `onChange` receives a value instead of an event - `Select`, `NumberInput`, `DatePickerInput` - go through RHF's `Controller` instead; `register` on these silently gets the wrong shape.
- Disable or guard submission while pending, but still rely on backend idempotency for critical mutations.
- Keep backend validation authoritative; client validation improves feedback but is not a security boundary.

## Server validation errors

Field errors arrive on a `BAD_USER_INPUT` GraphQL error, in its `extensions`. Map them with `setError`:

```ts
const gqlError = error?.graphQLErrors[0];
if (gqlError?.extensions?.code === "BAD_USER_INPUT") {
  const fieldErrors = gqlError.extensions.fieldErrors as Record<string, string> | undefined;
  for (const [field, message] of Object.entries(fieldErrors ?? {})) {
    form.setError(field as keyof FormValues, { type: "server", message });
  }
}
```

Remember that a GraphQL error arrives with HTTP 200, so nothing throws on status alone.

Use a form-level alert for conflicts or errors not tied to a field. Focus or announce the error according to the repository's accessibility pattern.

## Icons

Icons come from `lucide-react`. There is no icons folder, because there is almost nothing to put in one.

```tsx
import { Volume2 } from "lucide-react";

<Volume2 aria-hidden="true" size={16} />
```

Size the icon with the `size` prop, not a utility class - there is no Tailwind in this project. For an icon inside a Mantine `Button` or `ActionIcon`, pass it through `leftSection` or as the `ActionIcon` child rather than positioning it by hand.

Decorative icons get `aria-hidden="true"`. An icon-only control needs an accessible name on the control, not on the icon:

```tsx
<button type="button" aria-label="Play audio">
  <Volume2 aria-hidden="true" />
</button>
```

Search Lucide before drawing anything. It covers the ordinary vocabulary - play, pause, microphone, chart, check, chevron - and a hand-drawn version of an icon that already exists is a maintenance cost for no gain.

When Lucide genuinely has nothing - a brand mark, a product-specific badge, an illustration - draw it, but as its own component file placed where it is used:

- used by one block only → beside that block, following the same folder-when-it-earns-one rule as any other block sub-component
- used across several blocks in one feature → that feature's `parts/`
- used across features → `components/ui/`

Accept standard SVG props, keep `currentColor` so it inherits text colour, and avoid hard-coded dimensions unless the artwork needs a fixed viewBox.

```tsx
import type { SVGProps } from "react";

export function IeltsBandBadge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* owned paths */}
    </svg>
  );
}
```

Never paste raw SVG markup into a page, form, card, or unrelated component. Inline markup makes the surrounding component harder to read and guarantees the icon is copied the second time it is needed.

## Accessibility and interaction

- Associate every form field with a visible label unless the design has an equivalent accessible name.
- Connect errors with `aria-describedby` and mark invalid controls with `aria-invalid`.
- Keep keyboard focus visible and preserve logical tab order.
- Use semantic buttons and links instead of clickable `div` elements.
- Announce asynchronous form errors and important status changes where appropriate.
- Support reduced motion for nonessential animation.
- Ensure icon-only controls have accessible names and adequate hit areas.

## Testing

Two things get unit tests: **forms**, and **hooks that hold logic**. Nothing else.

**Unit-test UI only where there is a form.** A component with no form gets no unit test. This is a deliberate scope decision, not an oversight - forms are where validation and error mapping actually live, and everything else is markup that a test would only restate.

So do not write unit tests for: presentational blocks, skeletons, layouts, views that only compose, cards, lists, badges, or anything whose test would assert that props were rendered.

**Unit-test a hook when it holds real logic** - time, persistence, retries, or multi-step state. A hook that only wraps a generated query or returns a boolean does not need one. This is where the risky code lives once logic has been extracted out of components, and testing it costs nothing because nothing has to render.

For a form-bearing component, cover:

- successful submit with valid values;
- client-side validation - each rule that can fail, and the message the user sees;
- server field errors mapped onto the right fields;
- duplicate-submit prevention;
- disabled and pending states.

Test Zod schemas directly for boundary values and conditional or cross-field rules. That is cheaper than driving them through the UI, and it is where the rules belong.

### Hooks

Use `renderHook`, and wrap anything that changes state in `act` - including timer advances, or `result.current` reads stale.

Cover what the hook is actually responsible for:

- **Time** - fake both the timers and the system clock. The case that matters is the clock jumping while timers did not run, which is what a sleeping laptop does: set the system time forward, dispatch `focus`, and assert the hook recomputed from the server expiry rather than continuing its own countdown. A hook that counts down from a duration fails this test, which is the point of writing it.
- **Debounce** - several rapid updates produce one call, carrying the last value.
- **Failure** - a rejected save leaves a visible failed state rather than passing silently.
- **Terminal states** - polling stops on both success and failure, and a countdown clamps at zero instead of going negative.

Inject collaborators through the hook's arguments rather than letting it reach for Apollo internally. It keeps the test free of transport setup, and it is part of why the logic was extracted into a hook in the first place. When a hook genuinely needs providers, pass a `wrapper` to `renderHook`.

Query by accessible role and name, not class names or internal state. Mock the generated hook or use Apollo's testing provider - never global `fetch`. When a form submits through GraphQL, assert the variables sent and that each error code maps to its intended outcome.

Beyond forms, rely on end-to-end coverage for the highest-value flows: onboarding completion, starting and submitting an exam, and speaking upload. One end-to-end test through a real flow catches more than a wall of component tests, and it survives refactoring that would break them.

Do not duplicate the same invariant at every layer. Test Zod rules at the schema, form behaviour at the component, and the full happy path end to end.
