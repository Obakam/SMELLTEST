# SMELLTEST — Fragrance House Website

**Course:** CSC 106 / IFT 203 — Introduction to Web Technologies
**Assessment:** Tutor-Marked Assessment (group)

A six-page static e-commerce website for a fictional Lagos fashion house that sells
its own perfume line. Built with plain HTML, CSS and JavaScript. No frameworks, no
build step, no internet connection required — open `index.html` in any modern browser.

---

## 1. Page inventory

| File | Purpose | JavaScript on the page |
|---|---|---|
| `index.html` | Home: hero, featured fragrances, house story, animated statistics | Count-up statistics that run when scrolled into view |
| `products.html` | Shop: 8 fragrances, category filters, quick view, add to bag | Filtering, modal dialog, shopping bag persisted with `localStorage` |
| `trustees.html` | Board of Trustees: 5 members with portraits, roles and profiles | Expand / collapse each member's profile |
| `events.html` | Upcoming launches and clinics, live countdown, archive | Real-time countdown timer |
| `contact.html` | Inquiry form, scent-consultation booking, saved requests, FAQ | Form validation, `localStorage` persistence, accordion |
| `dom-structure.html` | DOM tree diagram and explanation (requirement 10) | Shared behaviour only |

Supporting files:

```
css/style.css      one external stylesheet for the whole site
js/script.js       one shared script; each page calls its own module
images/*.svg       15 pieces of lightweight vector artwork
Smelltest-Site.pdf   all six pages exported as one A4 PDF (for submission)
```

The shopping bag appears in the header of **every** page, so a customer can open it
from anywhere. Its contents are stored in `localStorage` under the key `bt_bag`.

The PDF was produced from these same pages, not retyped. `css/style.css` ends with a
`@media print` block, and any page opened with `?print=1` swaps the scrolling marquee
for a static strip, reveals the scroll animations and writes the final values into the
statistics before printing — so the paper copy says exactly what the screen says.

---

## 2. How each lab requirement is met

1. **Naming** — the house is called *SMELLTEST*; the debut perfume line is
   *Adíre Noir*.
2. **Product Showcase** — `products.html` is a working shop: eight perfumes and home
   scents, each with price, size, concentration, notes and availability. Cards can be
   filtered by Eau de Parfum / Extrait / Discovery Sets / Home, opened in a quick-view
   dialog, and added to a persistent bag with quantity controls and a running subtotal.
3. **Consistent Link Structure** — the `header > nav > ul` block is identical on every
   page: Home · Products · Trustees · Events · Contact, in that order. The footer and
   marquee are identical too.
4. **Board of Trustees** — `trustees.html` shows one card per group member, each with a
   portrait, an English name and an assigned position (Chairperson, Vice Chairperson,
   Company Secretary, Treasurer, Marketing & Brand Director), plus a summary table.
5. **Inquiries and Appointments** — `contact.html` carries two independent forms:
   a general inquiry form and a dated scent-consultation request form.
6. **Upcoming Events** — `events.html` lists four forthcoming dates and two past ones.
7. **Marquee** — a `<marquee>` announcement bar appears on all six pages, directly
   below the header.
8. **JavaScript Features** — every page loads `js/script.js`, which provides the mobile
   navigation, the marquee pause-on-hover, scroll reveals, the back-to-top button, the
   shopping bag and the page-specific feature listed in the table above.
9. **External CSS** — all styling lives in `css/style.css`. There are no `<style>`
   blocks and no `style="..."` attributes anywhere in the HTML.
10. **DOM Structure** — `dom-structure.html` shows the full tree for a page and explains
    why each landmark sits where it does.

---

## 3. Before you submit

1. **Replace the trustee portraits.** `images/trustee-1.svg` … `trustee-5.svg` are
   generated illustrations, not photographs. Swap each for a real photo of the group
   member it represents (600 × 600 px, JPG or PNG is fine — update the `src` and `alt`
   text in `trustees.html`).
2. **Keep or edit the names and positions.** The five trustees are fictional:
   Margaret Ellison (Chairperson), Daniel Whitmore (Vice Chairperson), Charlotte Hayes
   (Company Secretary), James Ashcroft (Treasurer) and Eleanor Bennett
   (Marketing & Brand Director). Replace them with the real group members if your
   tutor expects actual names.
3. **Check the contact details.** The address, phone number (+234 801 234 5678) and
   email (hello@smelltest.com) are placeholders.
4. **Confirm the date/venue** on `events.html` and the countdown target
   (`data-target` on `#countdown`).
5. **Print to PDF for the report** if required: open each page, `Ctrl + P`, choose
   "Save as PDF".

> The perfume line is titled *"Adíre Noir"* — a product-line name, independent of the
> house name. Rename it with find-and-replace if you prefer something else.

---

## 4. Editing tips

- **Brand name** — it appears in the header, footer, `<title>` and page copy. Use
  find-and-replace across all six `.html` files.
- **Colour palette** — all colours are CSS custom properties at the top of
  `css/style.css` (`--ink`, `--ivory`, `--clay`, `--gold`, …). Change them there and the
  whole site follows.
- **Adding a fragrance** — copy one `<article class="product">` block in `products.html`
  and edit its `data-*` attributes; the filters, the modal and the bag pick it up
  automatically.
- **Prices** — each card carries two price values: `data-price-value` (a number, used by
  the bag arithmetic) and `data-price` (the formatted string shown in the modal). When
  you change a price, change both.
- **Adding a page** — copy any page, change `<body data-page="…">` and swap `<main>`.
  Then add the link to the nav and footer of *all* pages to keep the link structure
  consistent.

---

## 5. Accessibility notes

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- Skip link as the first focusable element.
- Every image has an `alt`; decorative SVG icons are `aria-hidden="true"`.
- Forms use real `<label>` elements, `aria-invalid`, `role="alert"` error slots and
  `aria-live` status regions.
- The quick-view modal and the bag drawer both close on Escape, restore focus, and are
  marked `aria-modal="true"`.
- `prefers-reduced-motion` disables the reveal animations.

---

## 6. Artwork

Every image is a hand-written SVG, so the whole site works offline and stays crisp at
any size:

| File | Shows |
|---|---|
| `hero.svg` | the Adíre Noir bottle with botanicals |
| `atelier.svg` | bottle, citrus, petals and fabric on the atelier bench |
| `product-1.svg` … `product-6.svg` | individual flacons with colour-coded juice |
| `product-7.svg` | the five-vial discovery set |
| `product-8.svg` | the Atelier No. 14 candle |
| `trustee-1.svg` … `trustee-5.svg` | illustrated trustee portraits |

The portraits are illustrations, not photographs. If the brief insists on photographs,
replace those five files — nothing else needs to change.
