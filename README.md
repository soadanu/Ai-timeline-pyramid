# The AI Timeline Pyramid

An interactive, shareable, pyramid-shaped timeline of artificial intelligence: 23 milestones from ancient myths to large language models, each with a four-part note (what happened, why it matters, subfield, impact on industry and daily life).

## Open it

Double-click `index.html`. No installation or server is needed. To preview as a website instead:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Publish it (free, gives you the shareable link)

1. Create a new public repository on GitHub and upload everything in this folder.
2. Repository **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then save.
4. After a minute your link appears: `https://<your-username>.github.io/<repository-name>/`.
5. Individual events can be linked directly, for example `.../#m16` for the Transformer.

Put the link in `docs/05-reflection.md`.

## What is in the folder

| File | Purpose |
|---|---|
| `index.html` | The page |
| `styles.css` | Design, themes, responsive and print rules |
| `app.js` | Rendering, search, filters, detail card, deep links |
| `data.js` | All milestones and notes (the only file to edit to change content) |
| `docs/01-research.md`, `01-research.csv` | Tier 1: research table, 23 rows |
| `docs/02-pyramid-design.md` | Tier 2: layers, wireframe, tooling choice, interactivity plan |
| `docs/03-explanatory-notes.md` | Tier 3: one four-part note per milestone |
| `docs/04-edge-cases-and-testing.md` | Edge cases covered and a manual test checklist |
| `docs/05-reflection.md` | Tier 4 reflection template for your squad |

## Mission checklist

- [x] 15 or more milestones (23)
- [x] History, major advances and subfields covered
- [x] Every note states impact on industry and daily life
- [x] Clickable, legend with layers and colour coding, title and introduction
- [x] Shareable as a hosted page or a plain file
- [ ] Verify facts against lessons 2.3, 2.5, 2.7, 2.8 (checklist in `docs/01-research.md`)
- [ ] Fill in the reflection and add your published link

## Changing content

Edit `data.js`. Each entry needs `id`, `year`, `sort`, `title`, `short`, `layer`, `field`, `subfield`, `sig`, `what`, `why`, `impact`. If an entry is incomplete the page skips it and shows a message instead of breaking.
