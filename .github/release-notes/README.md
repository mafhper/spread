# Release Notes

Each Spread release can carry hand-written notes in markdown.
The file must be named after the exact release tag:

```text
.github/release-notes/v1.0.0.md
```

## Format

The content is free-form markdown. A `##` header is kept inside the file:
the core inserts the file content verbatim into the release body, right
after the image, title and tagline. Example:

```markdown
## What's new in this version

- **New color palette.** Automatic palettes drawn from the cover image.
- **Export fix.** Exported PNGs now preserve the original resolution.
```

## Rules

- No emojis.
- One item per line.
- Information relevant to the end user.
- Technical details belong in the auto-generated changelog.
- The first line is an optional `##` heading; if omitted, the notes are
  inserted as-is (before the `Usage` section).

## Behavior

- The release body is assembled by the Release Core
  (`mafhper/github-release-workflows`) from: release image, title, tagline,
  notes and configured sections.
- If the file exists, its content is inserted after the title/tagline.
- If the file does not exist, the Release is created without manual notes.
- The technical changelog is generated automatically by GitHub and inserted
  in a collapsible `<details>` block ("Automated changelog").
