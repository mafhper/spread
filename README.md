# Spread

Spread is a high-performance web application designed for the creation of aesthetic link visualization cards. It enables users to transform URLs from various platforms—including music services, social media, and news outlets—into professionally styled visual assets optimized for social sharing.

![Banner](public/assets/banner.png)

<div align="center">

[English](README.md) • [Português](README-ptBR.md) • [Español](README-es.md)

[![Live Demo](https://img.shields.io/badge/demo-live-EB5757?style=for-the-badge&logo=rocket&logoColor=white)](https://mafhper.github.io/spread)
[![License: MIT](https://img.shields.io/badge/License-MIT-56CCF2?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Built with Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

</div>

---

## Technical Features

- **Automated Metadata Extraction**: Utilizes Open Graph protocols to retrieve titles, descriptions, and high-quality imagery from provided URLs.
- **Intelligent Color Analysis**: Implements a dedicated engine to extract dominant color palettes from source images, automatically generating harmonious background gradients.
- **Specialized Templates**: Features adaptive layout configurations optimized for music content, photography, and journalistic articles.
- **Advanced Visual Configuration**: Provides a professional-grade editor with support for glassmorphism, neon gradients, and comprehensive typography controls.
- **High-Resolution Export**: Leverages the Astro 5 and React 19 frameworks to deliver a responsive interface and 2x pixel ratio PNG exports.

---

## Architectural Workflow

The application operates entirely on the client side to ensure data privacy and optimal execution speed.

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

## Visual Examples

![Music Previews](public/assets/music-preview.png)
_Note: Examples of platform-specific templates for music content._

![Social Previews](public/assets/social-preview.png)
_Note: Examples of platform-specific templates for social media content._

---

## Development Environment

The project lifecycle is managed via the **Bun** runtime.

### Prerequisites

Ensure the [Bun](https://bun.sh) runtime is installed on your system.

### Installation and Execution

```bash
# Install project dependencies
bun install

# Execute the development server
bun dev

# Generate a production build
bun run build
```

---

## Directory Structure

```text
spread/
├── src/
│   ├── components/      # Modular React interface components
│   ├── store/           # Global state management via Zustand
│   ├── services/        # API integration and utility logic
│   └── styles/          # Global CSS and Tailwind 4 configuration
├── docs/
│   └── assets/          # Documentation media and assets
├── public/              # Static assets and brand resources
└── Astro.config.mjs     # Framework configuration
```

---

## License

This software is distributed under the MIT License. Refer to the `LICENSE` file for detailed legal information.

---

<div align="center">
  <p>Maintained by <b>mafhper</b></p>
  <a href="https://github.com/mafhper">
    <img src="https://img.shields.io/github/followers/mafhper?label=Follow&style=social" alt="Follow mafhper" />
  </a>
</div>
