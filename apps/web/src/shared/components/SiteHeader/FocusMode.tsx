/**
 * Puts the page in focus mode while it is rendered: the site header steps
 * aside and the page's own header is the only one on screen. For a screen
 * that needs the learner's whole attention - an exam being taken - and has a
 * header of its own, which would otherwise stick to the top of the window in
 * the same place as the site header and slide over it on scroll.
 *
 * A marker, not state: SiteHeader.module.css hides the header while the body
 * holds one, so it takes effect in the server-rendered HTML with no flash, and
 * leaving the page (unmounting it) brings the header back.
 */
export function FocusMode() {
  return <span data-focus-mode hidden />;
}
