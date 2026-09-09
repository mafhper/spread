# Release Notes

Each Spread release can carry hand-written notes in markdown.
The file must be named after the exact release tag:

```text
.github/release-notes/v1.0.0.md
```

## Format

The content is free-form markdown. Example:

```markdown
- **New color palette.** Automatic palettes drawn from the cover image.
- **Export fix.** Exported PNGs now preserve the original resolution.
```

## Rules

- No emojis.
- One item per line.
- Information relevant to the end user.
- Technical details belong in the auto-generated changelog.

## Behavior

- If the file exists, its content is inserted in the "What's new in this version" section.
- If the file does not exist, the Release is created without manual notes.
- The technical changelog is generated automatically by GitHub and inserted in a collapsible block.
