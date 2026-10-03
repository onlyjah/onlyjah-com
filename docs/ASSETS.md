# Temporary photograph credits

Downloaded 2 October 2026. These are existing camera photographs, not AI images. Local files are the source site's 1280-pixel JPEG previews; they were not edited or regenerated. The generic image card crops them through CSS to fit its layout.

| Local asset | Credit | Source and rights |
| --- | --- | --- |
| `public/images/earth-apollo-17.jpg` | NASA / Apollo 17 crew; Earth, 7 December 1972 | [Commons source and public-domain declaration](https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg) |
| `public/images/clouds-iss.jpg` | NASA / Johnson Space Center; ISS photograph iss073e0379986, 16 July 2025 | [Commons source and public-domain declaration](https://commons.wikimedia.org/wiki/File:Clouds_streak_across_the_Indian_Ocean_beneath_the_International_Space_Station_(iss073e0379986).jpg) |

The pages declare NASA public-domain status in the United States and identify the photographic source. Credit links are visible beside the images. These are replaceable placeholders, not representations of OnlyJah members, projects, products, or endorsements. No NASA logo or insignia was added.

`src/content/photos.ts` holds source URLs, credits, dimensions, alt text, and local paths. Keep a rights/source record when replacing these assets with Jah's photographs. The earlier unverified `src/assets/heroimg.jpeg` is retained only in the redesign source snapshot and is not shipped.

## Roots photograph · 2 October 2026

`public/images/sunlight-canopy.jpg`: Machli16, *Sunlight through the Canopy*, photographed 21 December 2014 in Ranthambore National Park. [Original/source and author declaration](https://commons.wikimedia.org/wiki/File:Sunlight_through_the_Canopy.jpg), [CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/). Downloaded the source's 1280 × 853 preview (636,816 bytes); no image editing or AI generation. CSS may crop the displayed preview; the shared ImageCard displays the creator/source and an explicit license link. The photo remains under CC BY-SA 4.0; the license does not imply endorsement of OnlyJah.

## Additional photographs · 3 October 2026

| Local asset | Credit | Source and rights | SHA-256 |
| --- | --- | --- | --- |
| `earthrise-apollo-8.jpg`, 1280 × 1280, 107262 bytes | NASA / Bill Anders, 24 December 1968 | [Commons photographic source and public-domain declaration](https://commons.wikimedia.org/wiki/File:NASA-Apollo8-Dec24-Earthrise.jpg) | `da22ac0b5fdbc1ebf1c080c8481d80e2b8b1ea22e2e7fee7215ab0c819e333e0` |
| `late-autumn-forest.jpg`, 1280 × 960, 422286 bytes | Archbob, 13 October 2012 | [Commons photographic source](https://commons.wikimedia.org/wiki/File:Lateautumnforest.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `57c709c2eb5bcfc777daf741d7b5d168ccce806f424afca72e0e0746c6b3cf0e` |

These are source-host JPEG previews, verified as images and visually inspected. No pixel edits or generated images. Captions/alt text are factual engineering accessibility metadata. Generic ImageCard displays source/creator and license. Earthrise appears on Ark; the forest appears on Forge.

## SVG motion

AmbientIcon uses existing `lucide-react` 1.49.0 glyphs and CSS animation. The original [Lucide license](design/LUCIDE-LICENSE.txt) is retained; the supplied Claude SVG placeholders were not imported. This component is decorative, hidden from assistive technology, and motion is opt-in with `prefers-reduced-motion` support.
