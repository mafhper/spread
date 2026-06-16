# Spread

Spread is a high-fidelity web utility engineered for the generation of aesthetic link visualization assets. It facilitates the transformation of URLs from diverse digital platforms—including streaming services, social media, and news outlets—into professionally styled visual components optimized for high-resolution distribution.

![Banner](public/docs/assets/banner.jpeg)

<div align="center">

[English](README.md) • [Português](README-ptBR.md) • [Español](README-es.md)

[![Live Demo](https://img.shields.io/badge/deployment-live-EB5757?style=for-the-badge&logo=rocket&logoColor=white)](https://mafhper.github.io/spread)
[![License: MIT](https://img.shields.io/badge/License-MIT-56CCF2?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

</div>

---

## Technical Overview

- **Metadata Orchestration**: Implements automated Open Graph protocol extraction to retrieve canonical titles, descriptions, and high-quality iconography.
- **Heuristic Color Engine**: Leverages a specialized analysis module to derive dominant color palettes from source media, generating balanced chromatic gradients.
- **Adaptive Layout Templates**: Features a suite of specialized configurations optimized for varying content types, including music, photography, and journalism.
- **Layout Stability & UX**: Implements skeleton-based progressive loading and anchor-aware navigation to eliminate Cumulative Layout Shift (CLS) during content hydration.
- **High-Resolution Rendering**: Built on Astro 5 and React 19, delivering a low-latency interface with support for 2x pixel-ratio PNG asset exports.

---

## Live Evaluation

The production deployment is available for live testing and evaluation.

**Access Point:** [mafhper.github.io/spread](https://mafhper.github.io/spread)

1.  **Deployment**: Accessible via any standard modern web browser.
2.  **Usage**: Input valid URLs from supported platforms (Spotify, YouTube, News portals).
3.  **Governance**: Feedback and bug reports should be submitted via [GitHub Issues](https://github.com/mafhper/spread/issues).

---

## Quality Assurance

Spread uses a compact validation flow built from standard project scripts.

- **Static checks**: TypeScript, ESLint, and Prettier run independently.
- **Tests and coverage**: Vitest validates the React/Astro surface and can emit coverage for CI.
- **Security audit**: npm audit blocks high and critical vulnerabilities.

---

## Architectural Workflow

The application executes exclusively client-side to ensure maximum data privacy and computational efficiency.

```mermaid
graph LR
    A[URL Input] --> B{Extraction}
    B -->|Metadata| C[Content Processing]
    B -->|Image| D[Color Engine]
    C --> E[Template Selection]
    D --> F[Gradient Processing]
    E --> G[Visual Editor]
    F --> G
    G --> H[PNG Export]

    style A fill:#18181b,stroke:#a855f7,color:#fff
    style H fill:#18181b,stroke:#f43f5e,color:#fff
    style G fill:#18181b,stroke:#06b6d4,color:#fff
```

---

## Visual Reference

![Music Visualization](public/docs/assets/music-preview.png)
_Figure 1: Specialized layout configurations for music-centric metadata._

![Social Media Assets](public/docs/assets/social-preview.png)
_Figure 2: Professional-grade templates for social media distribution._

---

## Development & Deployment

The project supports a **cross-platform workflow** (Windows, macOS, Linux) and can be run with **Bun** (recommended) or **Node/npm**. Scripts are written to avoid shell-specific commands.

### Prerequisites

- [Node.js](https://nodejs.org) >= 20 (required)
- [npm](https://www.npmjs.com) >= 10
- [Bun Runtime](https://bun.sh) >= 1.1 (recommended)

### Universal Flow (Bun or Node)

```bash
# Dependency synchronization (choose one)
bun install
# or
npm install

# Development server
bun dev
# or
npm run dev

# Production build
bun run build
# or
npm run build
```

### Validation

```bash
# Fast local checks
bun run check

# CI preflight with coverage and security audit
bun run preflight:github
```

---

## Repository Structure

```text
spread/
├── src/
│   ├── components/      # React interface architecture
│   ├── store/           # State synchronization via Zustand
│   ├── services/        # Logic utilities and API abstraction
│   └── styles/          # PostCSS and Tailwind 4 configuration
├── public/              # Static assets and distribution resources
└── Astro.config.mjs     # Framework orchestration
```

---

## License

This project is licensed under the MIT License. Detailed legal terms are available in the [LICENSE](LICENSE) file.

---

<div align="center">
  <p>Maintained by <b>mafhper</b></p>
  <a href="https://github.com/mafhper">
    <img src="https://img.shields.io/github/followers/mafhper?label=Follow&style=social" alt="Follow mafhper" />
  </a>
</div>
