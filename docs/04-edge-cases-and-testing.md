# Edge cases and testing

The page was tested for behaviour with an automated script in a simulated browser (27 checks, all passing). Visual layout should still be checked by the squad in a real browser on a phone and a laptop (see the manual checklist).

## Edge cases handled

| Area | Edge case | How it is handled |
|---|---|---|
| Dates | Entries that are eras or ranges (Before 1950, 1980s, 2004 to 2007, 2010s, Future) | Shown exactly as written, with a separate numeric sort value so the order is stable |
| Dates | Two events in the same year (1956, 2020) | Sort values separate them by month |
| Content | Facts that are estimates or disputed ($25 million, 100 million users, who coined "AI") | A "Note on accuracy" box appears on the card instead of stating them as certain |
| Content | Layers are not strictly chronological (perceptron 1958 is in machine learning) | Explained in the design document and the layer legend |
| Data | Missing fields, duplicate ids, unknown layer or colour key | The bad entry is skipped, the rest still loads, a visible message appears and details go to the console |
| Data | `data.js` missing or empty | A clear error message replaces a blank page |
| Search | Extra spaces, capital letters, accents | Normalised before matching |
| Search | HTML typed into the box | Treated as plain text; the page never inserts text as HTML |
| Search | No results | An explanation and a "Show all events" button, and the result count is announced to screen readers |
| Filters | Search plus subfield filters together | Both must match; disabled tiles cannot be opened |
| Cards | Opened while a filter is on | Previous and Next move through matching events only, and the counter says "filtered" |
| Cards | Previous at the first event, Next at the last | Wraps around, so a button never becomes disabled under the user's focus |
| Cards | Browser without native `<dialog>` support | Falls back to a fixed-position card with manual Escape handling |
| Cards | Backdrop click, Escape, close button | All close the card and return focus to the tile that opened it |
| Links | `index.html#m16`, `#M16` | Opens that event on load; the address bar updates as you browse |
| Links | `#m99` (does not exist) | A short message appears and the hash is cleared |
| Links | Broken escape sequences in the hash | Caught; the page loads normally |
| Links | Skip-link hash `#pyramid` | Left alone |
| Sharing | Clipboard blocked (some browsers, file pages) | Falls back to an older copy method, then to a message pointing at the address bar |
| Storage | `localStorage` blocked (private mode) | Theme still works for the session; saving fails silently |
| Accessibility | Keyboard only | Real buttons, visible focus ring, Escape, Left and Right arrows inside the card, skip link |
| Accessibility | Screen reader | Layers are named lists, reading order is oldest to newest, counts and statuses are announced, card is a labelled dialog |
| Accessibility | Colour-blind users | Colour is never the only signal; every tile prints its subfield name |
| Accessibility | Reduced motion, forced colours | Animations are removed; borders are kept when the system overrides colours |
| Display | Phones from 320 px | Layers keep a stepped inset instead of percentage widths; tiles go full width below 420 px |
| Display | Dark mode | Follows the system, with a manual toggle; set before first paint so there is no flash |
| Display | Printing | Pyramid is replaced by the complete list of notes |
| Delivery | JavaScript disabled | A readable, complete list of all events appears instead |
| Delivery | Opened by double-clicking `index.html` | Works: data is a script file, not a fetch request, so no local server is needed |
| Delivery | No external requests | No CDN, web fonts or analytics, so nothing can fail or leak |

## Manual checklist (about ten minutes)

- [ ] Open on a phone and a laptop: all 23 tiles readable, pyramid silhouette visible
- [ ] Tab through the page: every tile reachable, focus ring always visible
- [ ] Open the first and last events: the card fits the screen and scrolls if needed
- [ ] Search for `2017`, `vision`, `zzz`
- [ ] Select one subfield, then clear
- [ ] Open `index.html#m17` in a new tab
- [ ] Switch theme and reload: choice is remembered
- [ ] Print preview: shows the notes list
- [ ] Read every note once for typos and for facts against lessons 2.3, 2.5, 2.7 and 2.8
