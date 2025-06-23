# TMD Quasar Frontend Wiki

Welcome to the TMD Quasar Frontend project wiki! This is a modern, mobile-first frontend application for the Tango Marathons website, built with Quasar Vue.js and WordPress as a headless CMS.

## 🚀 Quick Navigation

### For New Users
- **[Getting Started](Getting-Started)** - Installation, setup, and quick start guide
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

### For Developers
- **[Development Guide](Development-Guide)** - Development workflow, scripts, and best practices
- **[Architecture & Design](Architecture-&-Design)** - Technical architecture and design decisions
- **[API Documentation](API-Documentation)** - WordPress REST API v3 integration details
- **[Contributing](Contributing)** - Contribution guidelines and development process

### Project Information
- **[Project Roadmap](Project-Roadmap)** - Current status and future plans

## 🎯 Project Overview

The TMD Quasar Frontend is a headless WordPress architecture where:

- **WordPress** serves as the Content Management System (CMS) and backend, handling all content editing and management
- **Quasar application** provides the modern, performant frontend interface, consuming data via the WordPress REST API v3
- **TMD WordPress plugin** provides custom API endpoints for tango marathon data

## ✨ Key Features

- **Modern DJ Management**: Complete DJ profiles with activity tracking, experience timelines, and linked events
- **Event & Performance Tracking**: Comprehensive event listings with DJ-event relationships and performance statistics
- **Mobile-First Design**: Touch-optimized interactions with responsive layouts for all screen sizes
- **Advanced Filtering**: Server-side search and filtering with optimized performance
- **Dark Mode Support**: System preference detection with persistent settings
- **Performance Optimized**: Efficient API calls, request cancellation, and optimized data loading
- **TypeScript Integration**: Full type safety with strict null checks and ESLint compliance

## 🛠 Tech Stack

- **Frontend Framework**: Quasar Framework (Vue.js 3)
- **UI Components**: Quasar Material Design components
- **Language**: TypeScript with strict mode
- **API Integration**: WordPress REST API v3 (TMD custom endpoints)
- **Code Quality**: ESLint + Prettier with strict rules
- **Performance**: Request debouncing, caching, lazy loading

## 📁 Repository Structure

```
./
├── src/
│   ├── components/     # Reusable Vue components
│   ├── composables/    # Vue Composition API functions
│   ├── layouts/        # Quasar layouts
│   ├── pages/          # Application pages/routes
│   ├── services/       # API services and types
│   ├── interfaces/     # TypeScript interfaces
│   └── boot/          # Quasar boot files (axios, etc.)
├── docs/              # API and project documentation
├── public/            # Static assets
├── wiki/              # GitHub Wiki content (this documentation)
└── quasar.config.ts   # Quasar configuration
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](Contributing) for details on our development process and how to submit pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/danieldekay/tmd_quasar/blob/main/LICENSE) file for details.

---

**Need help?** Check out our [Troubleshooting](Troubleshooting) page or open an issue on GitHub.