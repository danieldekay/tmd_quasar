# Contributing

We welcome contributions to the TMD Quasar Frontend project! This guide will help you get started with contributing to our codebase.

## How to Contribute

We want to make contributing to the Tango Marathons project as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💬 Discussing the current state of the code
- 🔧 Submitting a fix
- 💡 Proposing new features
- 👥 Becoming a maintainer

## Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### Getting Started

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/tmd_quasar.git
   cd tmd_quasar
   ```

2. **Set Up Development Environment**
   
   Follow the [Getting Started](Getting-Started) guide to set up your local development environment.

3. **Create a Branch**
   ```bash
   # Create a new branch from main
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

### Making Changes

1. **Code Quality Standards**
   
   Before making changes, familiarize yourself with our:
   - [Development Guide](Development-Guide) - Code style and patterns
   - [Architecture & Design](Architecture-&-Design) - Technical architecture

2. **Development Workflow**
   ```bash
   # Start development server
   pnpm dev
   
   # Run type checking (in separate terminal)
   pnpm typecheck --watch
   
   # Make your changes...
   
   # Run linting before committing
   pnpm lint
   
   # Format code if needed
   pnpm format
   ```

3. **Testing Your Changes**
   ```bash
   # Run existing tests
   pnpm test
   
   # Build to ensure no build errors
   pnpm build
   
   # Test the built version
   pnpm preview
   ```

## Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update the README.md with details of changes to the interface, if applicable
   - Update the DESIGN.md with any architectural changes
   - Update relevant wiki pages if your changes affect the documented processes

2. **Code Requirements**
   - Ensure the test suite passes
   - Make sure your code lints without errors
   - Follow our TypeScript and Vue.js coding standards
   - Add tests for new functionality
   - Ensure backward compatibility where possible

3. **Commit Message Guidelines**
   
   We follow conventional commit format:
   ```
   type(scope): description
   
   [optional body]
   
   [optional footer]
   ```
   
   **Types:**
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `test`: Adding missing tests or correcting existing tests
   - `chore`: Changes to the build process or auxiliary tools
   
   **Examples:**
   ```bash
   feat(events): add advanced filtering for event listings
   fix(dj): resolve performance issue in DJ profile loading
   docs(api): update API documentation for v3 endpoints
   ```

### Submitting a Pull Request

1. **Push Your Changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template with:
     - Clear description of changes
     - Related issue numbers (if applicable)
     - Testing steps
     - Screenshots (for UI changes)

3. **PR Review Process**
   - The PR will be merged once you have the sign-off of at least one other developer
   - Address any feedback from reviewers
   - Keep your PR updated with the latest main branch if needed

## Code Style Guidelines

### TypeScript Standards

- Use strict TypeScript configuration
- Define explicit types for all function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type - use `unknown` if necessary

```typescript
// Good
interface UserData {
  id: number;
  name: string;
  email?: string;
}

const processUser = (user: UserData): UserData => {
  return { ...user, name: user.name.trim() };
};

// Avoid
const processUser = (user: any): any => {
  return user;
};
```

### Vue.js Standards

- Use Composition API with `<script setup>` syntax
- Define props and emits with TypeScript interfaces
- Use composables for shared logic
- Follow component naming conventions (PascalCase for components, kebab-case in templates)

```vue
<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  description: ''
});

const emit = defineEmits<{
  submit: [data: FormData];
}>();
</script>
```

### CSS/SCSS Standards

- Use Quasar's utility classes when possible
- Follow BEM methodology for custom classes
- Use scoped styles in components
- Prefer CSS custom properties for theming

```vue
<style scoped lang="scss">
.event-card {
  &__header {
    display: flex;
    align-items: center;
  }
  
  &__title {
    font-size: var(--q-font-size-lg);
    font-weight: bold;
  }
  
  &--featured {
    border: 2px solid var(--q-primary);
  }
}
</style>
```

## Bug Reports

We use GitHub's issue tracker to track public bugs. Report a bug by [opening a new issue](https://github.com/danieldekay/tmd_quasar/issues/new).

### Writing Good Bug Reports

**Great Bug Reports** tend to have:

- **Quick summary** - One-line description of the bug
- **Environment details** - Browser, OS, Node.js version
- **Steps to reproduce** - Be specific!
  ```
  1. Go to event listing page
  2. Apply country filter "Germany"
  3. Notice that events from other countries still appear
  ```
- **Expected behavior** - What you expected would happen
- **Actual behavior** - What actually happens
- **Additional context** - Screenshots, error messages, browser console logs

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug.

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Node.js: v20.10.0
- Project version: v0.0.1

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Additional Context
Add any other context about the problem here.
Screenshots, error messages, etc.
```

## Feature Requests

We welcome feature requests! Before submitting:

1. **Check existing issues** - Someone might have already suggested it
2. **Describe the problem** - What problem does this feature solve?
3. **Describe the solution** - What would you like to see implemented?
4. **Consider alternatives** - Are there other ways to solve this problem?

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Screenshots, mockups, examples from other applications.
```

## Code Review Guidelines

### For Authors

- **Keep PRs focused** - One feature or fix per PR
- **Write descriptive commit messages** - Follow conventional commit format
- **Test thoroughly** - Include both manual and automated testing
- **Update documentation** - Keep docs in sync with code changes
- **Respond to feedback** - Address reviewer comments promptly

### For Reviewers

- **Be constructive** - Provide helpful feedback and suggestions
- **Test the changes** - Pull the branch and test locally when possible
- **Check documentation** - Ensure docs are updated for significant changes
- **Consider performance** - Look for potential performance issues
- **Verify accessibility** - Ensure UI changes are accessible

## Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome newcomers and help them learn
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that everyone is learning
- **Be collaborative** - Work together towards common goals

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Recognition

Contributors who make significant contributions will be:

- Added to the contributors list in README.md
- Recognized in release notes
- Invited to become maintainers (for ongoing contributors)

## Getting Help

### Communication Channels

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Pull Request Comments** - For code-specific discussions

### Documentation

- **[Getting Started](Getting-Started)** - Setup and installation
- **[Development Guide](Development-Guide)** - Development workflow and patterns
- **[API Documentation](API-Documentation)** - API integration details
- **[Architecture & Design](Architecture-&-Design)** - Technical architecture

### Mentorship

New contributors are welcome! If you're new to:

- **Vue.js** - Check out the [Vue.js documentation](https://vuejs.org/)
- **TypeScript** - Review the [TypeScript handbook](https://www.typescriptlang.org/docs/)
- **Quasar** - Explore the [Quasar documentation](https://quasar.dev/)
- **Open Source** - GitHub has great [guides for new contributors](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project. When you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

---

**Thank you for contributing to TMD Quasar Frontend!** 🎉

Your contributions help make tango marathon discovery better for dancers worldwide.