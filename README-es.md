# Spread

Spread es una aplicación web de alto rendimiento diseñada para la creación de tarjetas estéticas de visualización de enlaces. La plataforma permite a los usuarios transformar URLs de diversos servicios —incluyendo plataformas de música, redes sociales y portales de noticias— en activos visuales profesionales, optimizados para el intercambio social.

![Banner](docs/assets/banner.png)

<div align="center">

[English](README.md) • [Português](README-ptBR.md) • [Español](README-es.md)

[![Live Demo](https://img.shields.io/badge/demo-live-EB5757?style=for-the-badge&logo=rocket&logoColor=white)](https://mafhper.github.io/spread)
[![Licencia: MIT](https://img.shields.io/badge/License-MIT-56CCF2?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Hecho con Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

</div>

---

## Funcionalidades Técnicas

- **Extracción Automatizada de Metadatos**: Utiliza protocolos Open Graph para recuperar títulos, descripciones e imágenes de alta calidad a partir de las URLs proporcionadas.
- **Análisis Inteligente de Colores**: Implementa un motor dedicado para la extracción de paletas cromáticas dominantes de las imágenes de origen, generando automáticamente degradados de fondo armoniosos.
- **Plantillas Especializadas**: Presenta configuraciones de diseño adaptativas y optimizadas para contenidos musicales, fotografías y artículos periodísticos.
- **Configuración Visual Avanzada**: Ofrece un editor de nivel profesional con soporte para glassmorphism, degradados de neón y controles exhaustivos de tipografía.
- **Exportación en Alta Resolución**: Utiliza los frameworks Astro 5 y React 19 para ofrecer una interfaz receptiva y exportaciones en formato PNG con una proporción de píxeles de 2x.

---

## Flujo Arquitectónico

La aplicación opera íntegramente en el lado del cliente (client-side), garantizando la privacidad de los datos y la agilidad en la ejecución.

```mermaid
graph LR
    A[Entrada de URL] --> B{Extracción}
    B -->|Metadatos| C[Procesamiento de Contenido]
    B -->|Imagen| D[Motor de Colores]
    C --> E[Selección de Plantilla]
    D --> F[Procesamiento de Degradado]
    E --> G[Editor Visual]
    F --> G
    G --> H[Exportación PNG]
    
    style A fill:#18181b,stroke:#a855f7,color:#fff
    style H fill:#18181b,stroke:#f43f5e,color:#fff
    style G fill:#18181b,stroke:#06b6d4,color:#fff
```

---

## Ejemplos Visuales

![Vistas previas de música y redes sociales](docs/assets/social-preview.png)
*Nota: Ejemplos de plantillas específicas para contenidos musicales y redes sociales.*

---

## Entorno de Desarrollo

El ciclo de vida del proyecto se gestiona a través del runtime **Bun**.

### Requisitos Previos

Asegúrese de que el runtime [Bun](https://bun.sh) esté debidamente instalado en el sistema.

### Instalación y Ejecución

```bash
# Instalación de las dependencias del proyecto
bun install

# Ejecución del servidor de desarrollo
bun dev

# Generación de la versión de producción
bun run build
```

---

## Estructura de Directorios

```text
spread/
├── src/
│   ├── components/      # Componentes modulares de interfaz en React
│   ├── store/           # Gestión de estado global mediante Zustand
│   ├── services/        # Integración de APIs y lógica de utilidades
│   └── styles/          # CSS global y configuraciones de Tailwind 4
├── docs/
│   └── assets/          # Medios y activos de la documentación
├── public/              # Activos estáticos y recursos de marca
└── Astro.config.mjs     # Configuración del framework
```

---

## Licencia

Este software se distribuye bajo la Licencia MIT. Consulte el archivo `LICENSE` para obtener información legal detallada.

---

<div align="center">
  <p>Mantenido por <b>mafhper</b></p>
  <a href="https://github.com/mafhper">
    <img src="https://img.shields.io/github/followers/mafhper?label=Follow&style=social" alt="Seguir a mafhper" />
  </a>
</div>
