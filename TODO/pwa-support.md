# Feature: PWA (Progressive Web App) Support

## 1. Context

Progressive Web App (PWA) support enables the web application to be "installable" on users' devices (desktop and mobile), providing an app-like experience with offline capabilities and potentially push notifications (though notifications are out of scope for this initial PWA setup). This enhances user engagement and accessibility.

The `README.md` lists "PWA support with service workers" as a future enhancement. Quasar Framework has built-in support for PWA mode, which simplifies the configuration and setup of a Service Worker and Web App Manifest. This feature leverages the work done for "Advanced Caching Strategy and Offline Support."

## 2. Requirements

### 2.1. Web App Manifest (`manifest.json` or similar)

-   **Configuration**: Create and configure a Web App Manifest file. Quasar PWA mode typically handles this via `quasar.config.js > pwa` settings.
-   **Required Manifest Fields**:
    -   `name`: Full application name (e.g., "Tango Marathons & Festivals").
    -   `short_name`: Shorter name for display on home screens (e.g., "TMD").
    -   `description`: A brief description of the application.
    -   `start_url`: The URL to load when the PWA is launched (e.g., `/`).
    -   `display`: Preferred display mode (e.g., `standalone` or `minimal-ui`).
    -   `background_color`: Background color for splash screen/app launch.
    -   `theme_color`: Theme color for the application, affecting OS UI.
    -   `icons`: A set of app icons in various sizes for different devices/platforms (e.g., 192x192, 512x512). These should be placed in `public/icons/` typically. The existing favicons can be a starting point, but PWA often requires specific sizes.
-   **Orientation**: Define default orientation if necessary (e.g., `any`, `portrait`).

### 2.2. Service Worker

-   **Leverage Existing Work**: The Service Worker implemented for "Advanced Caching Strategy and Offline Support" is fundamental to PWA.
-   **Functionality**:
    -   Offline caching of app shell and content.
    -   Reliable performance regardless of network conditions.
    -   (Future) Push notifications (not in initial scope).
-   **Quasar PWA Mode**: Utilize Quasar's PWA mode to manage the Service Worker lifecycle, pre-caching, and workbox integration if used. `quasar.config.js > pwa > workboxPluginMode` (e.g., `GenerateSW` or `InjectManifest`).

### 2.3. Installability Criteria

-   **HTTPS**: The application must be served over HTTPS (already a standard best practice).
-   **Manifest**: A valid Web App Manifest must be linked from the main HTML page.
-   **Service Worker**: A registered Service Worker with a `fetch` handler (providing offline capabilities).
-   **Basic Offline Experience**: The app must provide at least a custom offline page if not full offline content browsing.
-   **Add to Home Screen Prompt**: Browsers should trigger an "Add to Home Screen" prompt under certain engagement heuristics, or the app can provide its own install button.

### 2.4. User Experience for PWA

-   **Custom Install Prompt (Optional)**: Implement a custom button/banner within the app to encourage users to install the PWA, rather than relying solely on browser heuristics.
-   **Splash Screen**: Ensure icons and background color from the manifest are used to generate a decent splash screen during PWA launch.
-   **Update Notifications (Optional but Recommended)**: Inform users when a new version of the PWA has been downloaded in the background and is ready to be activated (e.g., a toast message with a "Reload" button). Quasar's SW update mechanism often provides this.

## 3. Tasks Checklist

### 3.1. Configuration (Quasar PWA Mode)

-   [ ] Ensure Quasar PWA mode is installed (`quasar mode add pwa`).
-   [ ] Configure PWA options in `quasar.config.js > pwa`:
    -   [ ] `workboxPluginMode` (e.g., `GenerateSW`).
    -   [ ] `manifest`:
        -   [ ] `name`, `short_name`, `description`.
        -   [ ] `display`, `orientation`.
        -   [ ] `background_color`, `theme_color`.
        -   [ ] `start_url`.
        -   [ ] Define `icons` array pointing to actual icon files in `public/icons/`. Ensure required icon sizes are created and present.
    -   [ ] Review and configure other Workbox options as needed (e.g., runtime caching rules if not fully covered by a custom SW, navigation fallback).
-   [ ] Add necessary app icons to `public/icons/` in various required sizes (e.g., 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512). Some might exist from `public/icons/favicon-*`.

### 3.2. Service Worker Integration

-   [ ] Verify that the Service Worker from the "Advanced Caching" feature is correctly registered and functioning within the PWA context.
-   [ ] If using Quasar's `GenerateSW`, ensure it correctly pre-caches the app shell and static assets.
-   [ ] If using `InjectManifest` (custom Service Worker), ensure it's properly configured and includes all necessary PWA functionalities (offline support, fetch handling).

### 3.3. UI/UX for PWA

-   [ ] (Optional) Design and implement a custom "Install PWA" button/banner.
    -   [ ] Logic to detect if the app can be installed and if it's already installed.
    -   [ ] Trigger the browser's install prompt.
-   [ ] Test the PWA launch experience, including splash screen.
-   [ ] Implement or verify existing PWA update notification mechanism (e.g., Quasar's default SW update prompt).

### 3.4. Testing & Validation

-   [ ] Test PWA installability on various platforms (Android, iOS, Desktop Chrome/Edge).
-   [ ] Use browser developer tools (Lighthouse, Application tab) to audit PWA compliance.
    -   [ ] Check manifest validity.
    -   [ ] Verify Service Worker registration and functionality.
    -   [ ] Confirm offline capabilities.
-   [ ] Test PWA behavior when launched from the home screen.
-   [ ] Test app updates and Service Worker update flow.

## 4. Acceptance Criteria

-   [ ] The application is served over HTTPS.
-   [ ] A valid Web App Manifest is correctly configured and linked.
-   [ ] A Service Worker is registered and provides offline access to previously visited content and the app shell.
-   [ ] The application meets browser criteria for PWA installability (e.g., "Add to Home Screen" prompt appears or can be triggered).
-   [ ] App icons of various sizes are provided and correctly referenced in the manifest.
-   [ ] `theme_color` and `background_color` are set and reflected appropriately (e.g., splash screen, browser UI).
-   [ ] The PWA launches in the specified `display` mode (e.g., `standalone`).
-   [ ] (If implemented) A custom install prompt works correctly.
-   [ ] (If applicable) Users are notified of app updates and can reload to get the new version.
-   [ ] Lighthouse PWA audit passes with a good score.
