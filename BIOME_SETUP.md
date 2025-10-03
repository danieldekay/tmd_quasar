# Biome Setup Guide

## 🚀 What is Biome?

Biome is a fast, modern toolchain for web development that combines:

- **Linter** (replaces ESLint)
- **Formatter** (replaces Prettier)
- **Import Organizer** (built-in)

Written in Rust, it's **20x faster** than ESLint and Prettier combined.

## 📦 Installation

Already installed! Run:

```bash
pnpm install
```

Biome extension should be recommended when you open this workspace in VS Code.

## 🎯 Usage

### Command Line

```bash
# Format code (auto-fix)
pnpm format:biome

# Lint code (auto-fix)
pnpm lint:biome

# Run both linting + formatting (RECOMMENDED)
pnpm check:biome

# CI mode (no auto-fix, just report)
pnpm ci:biome
```

**Note:** Biome auto-fixed **116 files** on first run! It's fast and effective.

### What Biome Fixes Automatically

✅ **Import organization** - Alphabetically sorted imports
✅ **Code formatting** - Consistent style (2 spaces, single quotes, etc.)
✅ **parseInt → Number.parseInt** - Modern JavaScript standards
✅ **Unused imports** - Automatically removed (with `--unsafe` flag)

### Known False Positives (Configured to Ignore)

- **Vue composables** (`useHookAtTopLevel`) - Vue 3 Composition API is not React hooks
- **Non-null assertions in Vue** - Sometimes necessary with Vue reactivity

### VS Code Tasks

Press `Cmd+Shift+P` → "Run Task" and choose:

**Individual Tasks:**

- `Biome: Format Code` - Format with Biome
- `Biome: Lint & Fix` - Lint with Biome
- `Biome: Check All (Lint + Format)` - Run both
- `Biome: CI Check` - Check without fixing

**Compound Tasks:**

- `Quality: Full Check (Biome)` - Type-check + Biome + Tests
- `Quality: Pre-Commit (Biome)` - Full quality check with Biome

### VS Code Extension

Install the recommended **Biome** extension:

1. Press `Cmd+Shift+X`
2. Search for "Biome"
3. Install `biomejs.biome`

#### Set as Default Formatter

Add to your workspace settings (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[vue]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

## 📝 Configuration

Configuration is in `biome.json` at the project root.

### Key Settings

```json
{
  "formatter": {
    "indentWidth": 2, // 2 spaces
    "lineWidth": 100, // Max 100 chars per line
    "lineEnding": "lf" // Unix line endings
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single", // Single quotes
      "semicolons": "always", // Always use semicolons
      "trailingCommas": "all" // Trailing commas everywhere
    }
  }
}
```

### Linting Rules

Most recommended rules are enabled. Key customizations:

- `noExplicitAny`: "warn" (allows `any` in tests)
- `useConst`: "error" (enforces const over let)
- `useImportType`: "error" (enforces type imports)
- `noDoubleEquals`: "error" (enforces === over ==)

### Overrides

**Test files** (`*.test.ts`, `*.spec.ts`):

- `noExplicitAny`: "off" - allows `any` type in tests

**Vue files** (`*.vue`):

- Full linting support with Vue-specific rules

## 🔄 Migration Strategy

You can run **Biome alongside ESLint/Prettier** during migration:

### Option 1: Gradual Migration (Recommended)

Keep both tools, use Biome for new code:

1. Use Biome tasks for your workflow
2. Keep ESLint/Prettier for CI (for now)
3. Gradually fix incompatibilities
4. Switch CI to Biome when ready

### Option 2: Full Switch

Replace ESLint/Prettier completely:

1. Update `.vscode/settings.json` to use Biome as default formatter
2. Update CI/CD to use `pnpm ci:biome`
3. Remove ESLint/Prettier tasks from default workflow
4. Keep ESLint/Prettier installed for legacy support

### Option 3: Parallel (Current Setup)

Use both systems independently:

- Biome for speed and consistency
- ESLint for Vue-specific rules
- Prettier for Markdown/SCSS files

## 🎨 Biome vs Prettier vs ESLint

| Feature        | Biome             | Prettier | ESLint    |
| -------------- | ----------------- | -------- | --------- |
| Formatting     | ✅ Yes            | ✅ Yes   | ❌ No     |
| Linting        | ✅ Yes            | ❌ No    | ✅ Yes    |
| Import sorting | ✅ Built-in       | ❌ No    | ⚠️ Plugin |
| Speed          | 🚀 **20x faster** | 🐌 Slow  | 🐌 Slow   |
| Config         | Single file       | Multiple | Multiple  |
| Vue support    | ✅ Yes            | ✅ Yes   | ✅ Best   |
| TypeScript     | ✅ Native         | ✅ Yes   | ⚠️ Plugin |

## 🛠️ Common Workflows

### Before Committing

```bash
# Option A: Biome only (fastest)
pnpm check:biome

# Option B: Full quality check with Biome
pnpm type-check && pnpm check:biome && pnpm test:run

# Option C: Use VS Code task (recommended)
# Cmd+Shift+P → "Quality: Pre-Commit (Biome)"
```

### During Development

```bash
# Format on save (if Biome extension installed)
# Just save your file!

# Or manually format
pnpm format:biome

# Fix linting issues
pnpm lint:biome
```

### CI/CD

```bash
# Check formatting + linting without auto-fix
pnpm ci:biome

# Then run tests
pnpm type-check && pnpm test:run
```

## 🔍 Troubleshooting

### Biome vs Prettier conflicts

If Biome and Prettier format differently:

1. Run `pnpm format:biome` to use Biome style
2. Adjust `biome.json` if needed
3. Consider disabling Prettier for files Biome handles

### Biome vs ESLint conflicts

Some ESLint rules might conflict:

1. Disable conflicting ESLint rules in `eslint.config.js`
2. Or configure equivalent rule in `biome.json`
3. For Vue-specific rules, keep ESLint

### VS Code not using Biome

1. Make sure Biome extension is installed
2. Check `.vscode/settings.json` has correct formatter
3. Reload VS Code window
4. Check Biome extension is enabled

### Slow performance

Biome should be very fast. If slow:

1. Check `files.ignore` in `biome.json`
2. Make sure `node_modules` is ignored
3. Restart Biome language server

## 📚 Resources

- **Official Docs**: https://biomejs.dev
- **VS Code Extension**: https://marketplace.visualstudio.com/items?itemName=biomejs.biome
- **Configuration Reference**: https://biomejs.dev/reference/configuration/
- **Migration Guide**: https://biomejs.dev/guides/migrate-eslint-prettier/

## 🎯 Next Steps

1. **Install VS Code extension** (recommended in extensions.json)
2. **Try Biome tasks**: `Cmd+Shift+P` → "Run Task" → "Biome: Check All"
3. **Compare results**: Run both ESLint and Biome to see differences
4. **Configure formatter**: Set Biome as default in VS Code settings
5. **Update workflow**: Use Biome tasks in your daily development

## 💡 Pro Tips

✨ **Speed**: Biome is 20-100x faster than ESLint/Prettier
✨ **Single config**: Everything in one `biome.json` file
✨ **Import sorting**: Automatic, no extra plugin needed
✨ **Great errors**: Detailed, actionable error messages
✨ **Watch mode**: Built-in file watcher for continuous checking
✨ **Git integration**: Respects `.gitignore` automatically

---

**Ready to try?** Run: `pnpm check:biome` 🚀
