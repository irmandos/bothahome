# BothaHome — bothahome.co.za

This is a static HTML/CSS/JS site deployed on GitHub Pages via GitHub Actions.

## graphify

This project has a knowledge graph at graphify-out/ with 46 nodes, 42 edges, 14 communities.

Rules:
- For codebase questions, run `graphify query "<question>"` first (from the project root). This returns a scoped subgraph at ~71x fewer tokens than raw file reading.
- Use `graphify path "<A>" "<B>"` for relationships between two concepts.
- Use `graphify explain "<concept>"` for focused explanations.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Tech Stack

- Framework: Vanilla HTML/CSS/JS
- Build: Node.js build.js (sharp, CleanCSS, Terser)
- Tests: Vitest + JSDOM (tests/website.test.js)
- CI/CD: GitHub Actions (.github/workflows/deploy.yml)
- Hosting: GitHub Pages
- DNS: Cloudflare