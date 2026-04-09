# Design System Document: The Tactile Sanctuary

## 1. Overview & Creative North Star: "The Tactile Sanctuary"
This design system rejects the high-friction, "grind-culture" aesthetics of traditional productivity tools. Instead of rigid grids and aggressive data density, we embrace **The Tactile Sanctuary**. 

The Creative North Star is centered on **Organic Breathing Room**. We prioritize psychological safety through intentional asymmetry, generous negative space, and "soft" edges. This is not a dashboard; it is a digital garden. By breaking the standard container-heavy layout in favor of floating, layered elements and editorial-style typography scales, we create an experience that feels "healing" rather than demanding.

---

### 2. Colors: Tonal Depth over Structural Lines
Our palette is rooted in soft pastels that mimic natural light—warm sun yellows, meadow greens, and sky blues. 

*   **Primary (`#745c00`) & Primary Container (`#f9d461`):** Use these for "Momentum" elements. The yellow is warm and supportive, never alarming.
*   **Secondary (`#4b6646`) & Secondary Container (`#dafad0`):** These represent growth and rest. Use for completed states and habit streaks.
*   **Tertiary (`#31638a`) & Tertiary Container (`#a1d1fe`):** Use for "Focus" and "Mindfulness" tasks, providing a calming contrast to the warmer tones.

#### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. To separate a section, transition from `surface` (`#faf9f8`) to `surface-container-low` (`#f4f3f2`). 

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to define importance:
1.  **Base:** `surface` (`#faf9f8`)
2.  **Sectioning:** `surface-container-low` (`#f4f3f2`)
3.  **Active Interactive Elements:** `surface-container-lowest` (`#ffffff`) to create a "lifted" paper effect.

#### The "Glass & Gradient" Rule
To avoid a flat, "templated" look, main CTAs and Hero sections should utilize subtle linear gradients—transitioning from `primary` to `primary_container` at a 15-degree angle. Floating elements (like navigation bars) should use **Glassmorphism**: a semi-transparent `surface` color with a 20px backdrop-blur.

---

### 3. Typography: Editorial Rhythm
We use **Plus Jakarta Sans** across the entire system. Its open counters and friendly curves support our "anti-anxiety" mission.

*   **Display & Headlines:** Use `display-lg` (3.5rem) for daily affirmations or "Hero" numbers. These should be set with a slightly tighter letter-spacing (-0.02em) to feel like a premium editorial headline.
*   **Titles:** `title-lg` (1.375rem) serves as the primary label for cards. It is large enough to feel confident but soft enough to remain approachable.
*   **Body & Labels:** `body-lg` (1rem) is our workhorse. Ensure a line-height of at least 1.6 to maintain "air" within text blocks.

**Hierarchy Strategy:** Use `on_surface_variant` (`#5d605f`) for secondary information. The contrast reduction between the background and text helps lower visual noise, reducing user anxiety during long sessions.

---

### 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too heavy for a "healing" app. We define depth through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a natural, soft lift without the "dirty" look of a standard shadow.
*   **Ambient Shadows:** When an element must float (e.g., a "Stamp" button), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(116, 92, 0, 0.08);`. Note the use of a tinted shadow (using the `primary` hue) rather than grey.
*   **The "Ghost Border" Fallback:** If a container needs more definition on a white background, use the `outline_variant` (`#b0b2b1`) at **15% opacity**. Never use 100% opacity borders.

---

### 5. Components

#### The "Pudding Stamp" (Primary Button)
*   **Shape:** `xl` roundedness (3rem) for a pill-like, organic feel.
*   **Style:** `primary_container` background with `on_primary_container` text.
*   **Interaction:** On press, the button should "sink" (scale 0.96) to mimic a physical rubber stamp hitting paper.

#### Soft-Shadowed Cards
*   **Layout:** Forbid divider lines. Separate content using `sm` (0.5rem) or `md` (1.5rem) vertical padding from the spacing scale.
*   **Background:** Use `surface-container-lowest` (`#ffffff`).
*   **Corner Radius:** `lg` (2rem).

#### Habit Selection Chips
*   **Style:** Use `secondary_container` (`#dafad0`) for unselected states and `secondary` (`#4b6646`) for selected states. 
*   **Radius:** `full` (9999px).

#### Tactile Input Fields
*   **Style:** No bottom-line inputs. Use a solid `surface-container-high` (`#e7e8e7`) fill with a `md` (1.5rem) corner radius.
*   **Focus State:** Transition the background to `primary_fixed_dim` with a "Ghost Border."

#### The "Bloom" Progress Indicator (Custom Component)
Instead of a linear progress bar (which triggers "deadline anxiety"), use a circular "Bloom" component. As habits are tracked, the shape expands slightly and the color shifts from `tertiary_container` to `secondary_container`, signaling growth.

---

### 6. Do's and Don'ts

#### Do
*   **Do** use asymmetrical layouts (e.g., offsetting a headline to the left and a card to the right) to create a premium, intentional feel.
*   **Do** use `display-sm` for "Quiet" moments, like empty states, to make them feel like pieces of art rather than "errors."
*   **Do** prioritize white space. If a screen feels "busy," increase the padding-global to `xl`.

#### Don't
*   **Don't** use pure black `#000000`. Use `on_surface` (`#303333`) for all high-contrast text to keep the vibe soft.
*   **Don't** use "Success Green" icons that are too bright. Stick to the `secondary` color palette for a more organic, herbal feel.
*   **Don't** stack more than three levels of surface containers. Too much nesting creates visual "weight" that contradicts the lightweight goal.