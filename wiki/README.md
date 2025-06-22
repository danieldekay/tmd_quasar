# GitHub Wiki Setup Guide

This directory contains the source markdown files for the TMD Quasar Frontend GitHub Wiki. These files can be used to populate the GitHub Wiki for the project.

## Wiki Structure

The wiki is organized into the following pages:

1. **[Home](Home.md)** - Project overview, key features, and navigation hub
2. **[Getting Started](Getting-Started.md)** - Installation, setup, and quick start guide
3. **[API Documentation](API-Documentation.md)** - WordPress REST API v3 integration details
4. **[Architecture & Design](Architecture-&-Design.md)** - Technical architecture and design decisions
5. **[Development Guide](Development-Guide.md)** - Development workflow, scripts, and best practices
6. **[Contributing](Contributing.md)** - Contribution guidelines and development process
7. **[Troubleshooting](Troubleshooting.md)** - Common issues and solutions
8. **[Project Roadmap](Project-Roadmap.md)** - Current status and future plans

## Setting Up the GitHub Wiki

### Option 1: Manual Setup (Recommended)

1. **Enable Wiki** for the repository:
   - Go to repository Settings
   - Scroll down to "Features" section
   - Check "Wikis" option

2. **Create Wiki Pages**:
   - Go to the Wiki tab in your repository
   - Click "Create the first page"
   - Copy content from each markdown file in this directory
   - Use the filename (without .md) as the page title

3. **Set Up Navigation**:
   - The Home page serves as the main navigation hub
   - Each page includes cross-references to related pages
   - Use the GitHub Wiki sidebar for quick navigation

### Option 2: Git Clone Method

GitHub Wikis are actually Git repositories. You can clone and push to them:

```bash
# Clone the wiki repository
git clone https://github.com/danieldekay/tmd_quasar.wiki.git

# Copy files from this directory
cp wiki/*.md tmd_quasar.wiki/

# Commit and push
cd tmd_quasar.wiki
git add .
git commit -m "Initial wiki setup with comprehensive documentation"
git push origin master
```

### Option 3: Wiki Import Tools

You can use tools like [github-wiki-action](https://github.com/marketplace/actions/github-wiki-action) to automatically sync wiki content from this repository.

## Page Naming Conventions

GitHub Wiki pages use specific naming conventions:

- **File names**: Use the exact filename without `.md` extension
- **Internal links**: Use the format `[Link Text](Page-Name)` 
- **Spaces in names**: Replace with hyphens (e.g., "Getting Started" becomes "Getting-Started")

## Cross-References

The wiki pages include cross-references to help users navigate:

- **Getting Started** → Development Guide, Troubleshooting
- **Development Guide** → API Documentation, Architecture & Design
- **Contributing** → Development Guide, Getting Started
- **All pages** → Home page for navigation

## Maintenance

### Keeping Wiki Updated

1. **Update source files** in this directory when making changes
2. **Sync changes** to the actual GitHub Wiki
3. **Test all links** after making updates
4. **Review navigation** to ensure it remains logical

### Content Guidelines

- **Keep pages focused** - Each page should have a clear purpose
- **Use consistent formatting** - Follow the established patterns
- **Include examples** - Provide code examples and practical guidance
- **Link between pages** - Help users discover related information
- **Update regularly** - Keep information current with project changes

## Benefits of This Structure

### For New Users
- **Getting Started** provides immediate setup guidance
- **Troubleshooting** helps resolve common issues quickly
- **Home** page offers clear navigation to relevant sections

### For Developers
- **Development Guide** covers coding standards and workflow
- **Architecture & Design** explains technical decisions
- **API Documentation** provides detailed integration guidance

### For Contributors
- **Contributing** outlines the contribution process
- **Project Roadmap** shows where help is needed
- **All guides** provide context for effective contributions

## GitHub Wiki Features

### Advantages
- **Easy editing** through GitHub interface
- **Version control** with change history
- **Collaborative editing** by repository collaborators
- **Search functionality** within wiki content
- **No build process** required

### Limitations
- **Limited styling** compared to static site generators
- **No automated testing** of links or content
- **Manual synchronization** if using external files
- **Basic markdown** support only

## Migration from Repository Documentation

This wiki structure complements existing repository documentation:

- **README.md** → Remains as main project introduction
- **DESIGN.md** → Content integrated into Architecture & Design wiki page
- **CONTRIBUTING.md** → Content enhanced in Contributing wiki page
- **TODO.md** → Content organized into Project Roadmap wiki page
- **docs/api.md** → Content expanded in API Documentation wiki page

The repository documentation remains as authoritative sources, while the wiki provides organized, navigable access to the information.

---

**Questions about wiki setup?** Open an issue or check the [Contributing](Contributing.md) page for guidance.