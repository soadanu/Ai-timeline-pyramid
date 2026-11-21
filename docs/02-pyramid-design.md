# Tier 2: Pyramid design

**Deliverable:** wireframe and mockup notes showing layers, event placement and where the clickable details appear.

## 1. Layers

The brief suggests five layers. This build uses six: machine learning and deep learning are split, because eleven events in one layer would crowd the shape and hide the difference between the data-driven era (2000s) and the deep-network era (2010s).

| Layer | Name | Width | Events |
|---|---|---|---|
| 6 | The future | 40% | AGI and beyond (Future) |
| 5 | Generative AI and large language models | 52% | GANs (2014); Transformers (2017); GPT-3 (2020); ChatGPT (2022) |
| 4 | Deep learning | 64% | ImageNet (2009); Deep learning revolution (2010s); AlexNet (2012); AlphaGo (2016); AlphaFold 2 (2020) |
| 3 | Machine learning | 76% | The perceptron (1958); Backpropagation (1986); DARPA challenges (2004–2007); Netflix Prize (2006–2009); IBM Watson (2011) |
| 2 | Symbolic AI, expert systems and search | 88% | Logic Theorist (1956); ELIZA chatbot (1966); Expert systems (1980s); AI winters (1980s–1990s); Deep Blue (1997) |
| 1 | Foundations | 100% | Roots of thinking machines (Before 1950); Turing Test (1950); Dartmouth workshop (1956) |

The layer order is by paradigm, so it is roughly, not strictly, chronological. The perceptron (1958) sits in *Machine learning* because it introduced learning from examples, while Deep Blue (1997) sits in *Symbolic AI and search* because it won by rules and search. This is explained to the viewer in the legend.

## 2. Visual narrative

- **Width means accumulated groundwork.** The base is 100% wide and each layer steps in by 12 points, so the shape narrows toward specialisation, as the brief asks.
- **Darkness means depth.** Layer fills run from deep slate at the base to pale blue at the apex, like strata of rock: older, heavier layers carry the newer ones.
- **Event count is deliberately not the width.** The base has three events and the middle layers have five, so width encodes meaning rather than quantity. Events wrap inside their layer, which keeps every layer readable.
- **Reading order is chronological, bottom to top**, for screen readers as well as for sighted viewers.

## 3. Wireframe

```
                 +--------------------------+
                 | 6  The future            |            more specialised
                 |      [ AGI and beyond ]  |                 ^
               +-+--------------------------+-+               |
               | 5  Generative AI and LLMs    |               |
               |  [GANs] [Transformers]       |               |
               |  [GPT-3] [ChatGPT]           |               |
             +-+------------------------------+-+             |
             | 4  Deep learning                 |             |
             |  [ImageNet] [DL revolution]      |             |
             |  [AlexNet] [AlphaGo] [AlphaFold] |             |
           +-+----------------------------------+-+           |
           | 3  Machine learning                  |           |
           |  [Perceptron] [Backprop] [DARPA]     |           |
           |  [Netflix] [Watson]                  |           |
         +-+--------------------------------------+-+         |
         | 2  Symbolic AI, expert systems, search   |         |
         |  [Logic Theorist] [ELIZA] [Expert sys]   |         |
         |  [AI winters] [Deep Blue]                |         |
       +-+------------------------------------------+-+       |
       | 1  Foundations                               |       |
       |  [Roots] [Turing Test] [Dartmouth]           |       v
       +----------------------------------------------+   accumulated groundwork

  Click any [event]  -->  +------------------------------------+
                          | coloured stripe  year  Title    [x]|
                          | What happened                      |
                          | Why it matters                     |
                          | Subfield                           |
                          | Impact on industry and daily life  |
                          | [Previous]  7 of 23  [Next] [Copy] |
                          +------------------------------------+
```

## 4. Tooling choice and why

**A single static HTML page (HTML, CSS and plain JavaScript, no framework).**

| Option | Verdict |
|---|---|
| Canva or Prezi | Quick to start, but clickable detail panels, search, filtering and deep links are limited or paid, and the squad could not test accessibility. |
| Figma | Excellent for the wireframe, but a prototype link is not a durable, searchable, accessible published page. |
| **HTML page** | Full control over interactivity and accessibility, free hosting on GitHub Pages, works offline when opened as a file, and the brief names it as an option. |

No build step, no dependencies and no network requests, so the page cannot break because a CDN or font host is down.

## 5. Interactivity plan

- Each event is a real `<button>`, so it works with mouse, touch, keyboard and screen readers.
- Selecting it opens a native `<dialog>` card with the four-part note. The browser handles focus trapping and the Escape key.
- Inside the card: Previous and Next (also Left and Right arrow keys), a position counter, Copy link, and Close.
- Each event has a shareable link of the form `index.html#m16`.
- Search and legend buttons dim events that do not match, so the shape of the pyramid never changes.

## 6. Layout grid and tokens

- **Container:** 1120 px maximum, 20 px side padding (14 px on phones).
- **Pyramid:** layers centred, 6 px apart; events are flexible tiles 150 to 210 px wide, 8 px gap.
- **Phones (under 760 px):** layers keep a stepped inset of 16 px per level instead of percentage widths, so the pyramid silhouette survives on a 360 px screen.
- **Type:** headings in an old-style serif system stack; interface and body in the system sans. No web fonts are loaded.
- **Theme:** light and dark, following the system setting, with a manual toggle remembered in the browser.

### Subfield colour coding

Colour is never the only signal: every tile also prints its subfield name, and the legend buttons carry text labels.

| Colour key | Subfield group | Events |
|---|---|---|
| `foundations` | Foundations | 3 |
| `symbolic` | Symbolic AI and search | 3 |
| `ml` | Machine learning | 2 |
| `deep` | Neural networks and deep learning | 4 |
| `nlp` | Language (NLP and LLMs) | 4 |
| `gen` | Generative AI | 2 |
| `vision` | Vision and robotics | 3 |
| `history` | Field history | 1 |
| `future` | Future and speculation | 1 |
