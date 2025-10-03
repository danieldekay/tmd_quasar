# Biome Setup Guide

## 🚀 What is Biome?

Biome is a fast, modern toolchain for web development that combines:

- **Linter** (replaces ESLint) - includes type-aware rules!
- **Formatter** (replaces Prettier)
- **Import Organizer** (built-in)
- **Type Inference** (NEW in v2!) - detects ~75% of type errors without TypeScript compiler

Written in Rust, it's **20-100x faster** than ESLint and Prettier combined.

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

## 🧬 Type Inference (Biome v2)

**NEW:** Biome v2 includes built-in type inference that catches type errors **without requiring the TypeScript compiler!**

### What It Does

- **Multi-file analysis**: Scans your entire project and builds a type index
- **Type-aware linting**: Rules like `noFloatingPromises` work without installing `typescript` package
- **~75% coverage**: Detects most common type errors that `typescript-eslint` would catch
- **Fraction of the cost**: Much faster than running `tsc` or `vue-tsc`

### How It Works

```json
// In biome.json - Already enabled!
{
  "linter": {
    "domains": {
      "project": "recommended", // ✅ Type inference + project rules
      "vue": "recommended" // ✅ Vue-specific rules
    }
  }
}
```

**Domains Explained:**

- `"project"` - Enables multi-file analysis and type-aware rules
- `"vue"` - Enables Vue 3 specific linting rules
- `"recommended"` - Activates recommended rules only (faster)
- `"all"` - Activates ALL rules (slower, more thorough)
- `"none"` - Disables the domain

### Type-Aware Rules

When project domain is enabled, Biome activates these type-aware rules:

- `noFloatingPromises` - Detects unhandled promises
- `noMisusedPromises` - Catches promise usage errors
- `noUnsafeArgument` - Type-safe function arguments
- `noUnsafeCall` - Type-safe function calls
- `noUnsafeMemberAccess` - Safe property access
- And more...

### Performance Impact

- **First run**: ~1-2s (builds type index)
- **Incremental**: ~200-500ms (only re-analyzes changed files)
- **Much faster than**: Running full `vue-tsc` type check (2-5s)

### Limitations

⚠️ **Type inference is NOT a complete replacement for `vue-tsc`:**

- **Coverage**: ~75% of common cases (improving constantly)
- **Vue SFCs**: Limited support for `.vue` files (roadmap item)
- **Edge cases**: May miss complex generic types, advanced mapped types
- **Maturity**: Released June 2025, still early stage

### Recommended Workflow

```bash
# Fast pre-commit checks (lint + format + type inference)
pnpm check:biome  # ~100-500ms ⚡️

# Full type validation (comprehensive coverage)
pnpm type-check   # ~2-5s 🔍

# Use both:
# - Biome catches 75% instantly during development
# - vue-tsc catches 100% before commits/CI
```

### Future: Vue.js Support

Biome roadmap includes:

- **2025 Q4**: Expand HTML support to Vue, Svelte, Astro
- **Future**: Full `.vue` SFC type inference
- **Future**: Improved coverage beyond 75%

For now, keep using `vue-tsc` for production type validation!

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
