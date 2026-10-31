# Englow3 design system

Direction: **Minimalism & Swiss** with the **"Progress teal + achievement orange"** palette, from the
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) design-system search for an adult
online-learning / exam-prep product, adjusted so every text pairing meets WCAG 2.1 AA.

The implementation is `src/lib/mantine/theme.ts` and `src/app/globals.css`. Components take their look from the
theme defaults, so a plain `<Card>` or `<Button>` is already on-style; restyle a screen only when it needs
something the theme cannot express.

## Colour

| Role                  | Token                     | Value                | Notes                                                                                |
| --------------------- | ------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| Primary / brand       | `brand.7` (also `navy.7`) | `#0F766E`            | Filled buttons, links, focus ring. White text 5.5:1                                  |
| Headings, dark panels | `brand.9` (also `navy.9`) | `#134E4A`            | White text on it 9.4:1                                                               |
| Brand tint            | `brand.0`–`brand.1`       | `#F0FDFA`, `#CCFBF1` | Selected rows, icon tiles                                                            |
| Accent                | `orange.5`                | `#F97316`            | The one action that moves the learner on. **Dark text** (7:1), set by `autoContrast` |
| Accent text           | `orange.7`                | `#C2410C`            | Orange used as text (eyebrows, figures): 5.2:1 on white                              |
| Success               | `green.6`                 | `#16A34A`            | Correct answers, completion                                                          |
| Error                 | `warn.6`                  | `#DC2626`            | Validation, destructive actions                                                      |
| Page                  | `ink.0`                   | `#F8FAFC`            |                                                                                      |
| Hairline              | `ink.2`                   | `#E2E8F0`            | Card and table borders                                                               |
| Secondary text        | `ink.5` / `dimmed`        | `#5B6A80`            | 5.5:1 on white, 5:1 on `ink.1`                                                       |
| Body text             | `ink.8`                   | `#1E293B`            |                                                                                      |

`indigo`, `blue`, `violet`, `grape` and `cyan` resolve to `brand`; `gray` and `dark` to `ink`; `teal` to `green`;
`red` to `warn`; `yellow` to `orange`. Older modules that reached for a Mantine default therefore land on the
system. In new code, name the role (`brand`, `ink`, `orange`, `green`, `warn`), never a hex.

## Type

- Headings: **Lexend**, weight 600 (700 at most). Body: **Source Sans 3**. Both include the Vietnamese subset.
- Base size 16px, line-height 1.6. Sizes: xs 12, sm 14, md 16, lg 18, xl 20; h1 34, h2 26, h3 20, h4 17.
- No weight above 700. Headings balance their lines (`text-wrap: balance`).

## Shape and depth

- Radius: xs 4, sm 6, md 8 (default), lg 10 (cards), xl 14. Badges are pills.
- Flat surfaces separated by 1px `ink.2` hairlines. Shadows only on things that float: menus, popovers, modals,
  toasts (`shadow-md`/`lg`). No gradients; a dark panel is solid `brand.9`.
- Hover on a card changes its border colour (`brand.3`); nothing lifts or scales.

## Interaction and accessibility

- Default buttons and inputs are 44px tall (minimum touch target).
- Every focusable element shows a 2px `brand.7` outline on `:focus-visible`.
- "Skip to main content" is the first tab stop on every page and lands on `#main-content`.
- Transitions 150–250ms on colour only; `prefers-reduced-motion` turns them off.
- Text contrast ≥ 4.5:1 for all body text, checked with axe-core on every main page for each role.
- Icons are SVG (lucide / tabler), never emoji; icon-only buttons carry an `aria-label`.

## Checklist before shipping a screen

- [ ] Uses theme roles, no raw hex or gradient.
- [ ] Orange appears on at most one action per view.
- [ ] Works at 390px wide with no horizontal scroll.
- [ ] Every control reachable and visible by keyboard.
- [ ] axe-core: no serious or critical violations.
- [ ] Vietnamese and English labels both fit.
