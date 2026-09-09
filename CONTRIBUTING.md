# Contributing to Spread

Thank you for considering contributing to Spread. We value community contributions that enhance the technical and visual quality of this project.

## Development Workflow

This project utilizes **Bun** as the only supported runtime and package manager.

### Package Manager

Do not run `npm install`, `npm ci`, `npm update`, or any other npm command that modifies dependencies. The `bun.lock` file is the only source of truth for dependency resolution. If a `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` appears in the repository, it will be rejected by CI.

```bash
bun install            # install dependencies
bun install --frozen-lockfile  # deterministic CI-style install
bun add <package>      # add a dependency
bun run <script>       # run a project script
```

Use `bun run security:audit` (or `bun run check:package-manager`) before pushing to verify the dependency state.

### Contribution Process

1. **Fork the Repository**
2. **Clone the Local Repository**

   ```bash
   git clone https://github.com/YOUR-USER/spread.git
   cd spread
   ```

3. **Dependency Installation**

   ```bash
   bun install
   ```

4. **Branch Creation**

   ```bash
   git checkout -b feature/contribution-name
   ```

5. **Implementation Guidelines**
   - Adhere to the modular architecture located in `src/components`.
   - Maintain code quality and ensure consistency with existing styling.
   - Validate implementation locally using `bun dev`.

6. **Version Control Integration**
   We utilize semantic commit conventions:
   - `feat:` for functional enhancements
   - `fix:` for defect resolution
   - `docs:` for documentation modifications
   - `style:` for formatting adjustments
   - `refactor:` for code restructuring
   - `test:` for test suite updates
   - `chore:` for developmental maintenance

7. **Synchronization**

   ```bash
   git push origin feature/contribution-name
   ```

8. **Pull Request Submission**

## Issue Reporting

Technical issues or feature requests should be submitted via GitHub Issues, including:

- Detailed technical descriptions.
- Procedures for reproduction.
- Expected behavior versus observed behavior.

## Code of Conduct

All contributors are expected to maintain professional, respectful, and constructive interactions.

---

Built with **Astro**, **React**, and **Tailwind CSS**.
