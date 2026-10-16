# Englow3 welcome: reference-aligned version

The requested reference is [VLearn welcome](https://vlearn.dev/welcome). This version follows its full-width campus hero, overlaid header, centered headline, Montserrat typography, three-number band, diamond learning cycle, faceted blue tutor band, navy journey panel, three feature cards, auditorium CTA and campus footer. Text and branding describe Englow3. The reference supplies layout and typography only. Colors follow the existing Englow3 design system: brand.7 teal for primary UI, brand.9 for dark panels, orange.5 with dark text for primary actions, orange.7 for accent text and ink neutrals. The logo retains its original colors on a white backing. Auditorium photography is desaturated under a teal overlay. Study and back-office pages keep their existing theme.

## Image assets

Generated with the built-in **imagegen** tool, then converted to WebP without changing the composition:

- `public/images/landing-campus-v3.webp`: fictional campus, hero and footer (about 277 KB).
- `public/images/landing-auditorium-v3.webp`: red lecture seats, bottom CTA (about 125 KB).
- `public/images/landing-study-v2.webp`: retained study illustration in the selected learning step (about 180 KB).

The original PNGs are preserved in the generated-image directory. The university imagery is illustrative and does not represent an affiliation with a real institution. The journey poster is native SVG/HTML in `HomeView.tsx`.

## Final imagegen prompts

Campus:

> Photorealistic panoramic university campus architecture photograph for a website hero background, 16:9 landscape composition. Symmetrical grand pale limestone university main building in a contemporary Asian university campus, central clock tower with a modest spire centered exactly on the image, long colonnaded wings, green lawns, circular terraced stone courtyard and low concentric steps in the foreground. Several modern residence buildings in the distant left background. Clear calm early morning daylight, pale blue sky, professionally composed architectural photography, natural neutral colors, all verticals straight, wide lens but no distortion, enough sky and foreground that the building occupies middle third of frame. No people, no logos, no signs, no text, no flags, no watermarks. A fictional university, not an identifiable real institution. This image will have a navy blue overlay and centered white headline added in HTML; do not add any typography or interface.

Auditorium:

> Photorealistic panoramic interior photograph, 16:9 landscape crop, of a contemporary university lecture auditorium with rows of deep red upholstered seats, viewed at a diagonal angle from the side. Warm amber side lighting illuminating the red fabric edges, rich dark shadows between the seats, elegant cinematic academic atmosphere. No people, no screen, no writing, no logos, no text, no watermarks. Most of the frame filled by rhythmic rows of red and dark burgundy chairs. Suitable as a website call-to-action background with white text added separately in HTML. Photograph only, not a webpage or mockup.

Study illustration (retained):

> Create one photographic editorial website hero asset, landscape 3:2 composition. A Vietnamese university student, woman age 22, in profile at a beautifully simple oak desk, wearing cream over-ear headphones, focused on writing in an open notebook beside a slim silver laptop. Subject framed on the right half, mid shot from the side, not looking at camera. Large bright window on the left casts soft late afternoon sunlight, textured warm ivory walls, deep forest teal desk lamp, a few books and small plant. Authentic lived-in contemporary study space, tactile paper and linen, editorial lifestyle photography, candid premium university magazine art direction, subtle film grain, natural skin, rich but restrained forest green and warm tan colors. Calm hopeful focused learning mood. Clear well-composed scene, no clutter. No words, logos, lettering, charts, interfaces, overlays or watermarks anywhere. This will be cropped to a tall 4:5 portrait frame on a language learning website; keep woman, headphones, notebook and laptop within the middle 70 percent. Do not render a website or UI, only the photograph.

## Interactions

The five diamonds are native accessible tabs (Left/Right, Home/End, Enter). The selected step updates the image panel and its description. Language controls switch both navigation and content. Authentication, learner onboarding and Admin/Staff workspace routing use the existing CTA flow.
