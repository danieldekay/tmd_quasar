# Feature: Internationalization (i18n) Support

## 1. Context

The application currently displays content primarily in one language (assumed to be English, based on UI text in existing files like `DESIGN.md`). To cater to a global tango community, internationalization (i18n) is essential. This involves translating UI text (labels, buttons, messages) and potentially supporting localized date/number formats if not already handled universally (e.g., `DESIGN.md` states "All dates are displayed in ISO format (`YYYY-MM-DD`)"). Content from the WordPress backend (like event descriptions, DJ bios) might also need translation, which is a larger scope involving WordPress i18n capabilities.

This initial phase will focus on frontend UI text translation and setting up the framework for i18n.

The `README.md` lists "Internationalization (i18n) support" as a future enhancement. Quasar Framework has built-in support for i18n using `vue-i18n`.

## 2. Requirements

### 2.1. Frontend UI Translation

-   **Supported Languages**:
    -   Define an initial set of target languages (e.g., English (en-US) as default, Spanish (es), German (de), French (fr), Italian (it)).
-   **Translatable Elements**: All static text in the UI should be translatable. This includes:
    -   Navigation links (header, footer, drawer).
    -   Button labels.
    -   Form field labels and placeholders.
    -   Table headers.
    -   Static text in page titles, section headings.
    -   Messages (errors, warnings, success notifications, empty states).
    -   ARIA labels and other accessibility text.
-   **Translation Files**:
    -   Store translations in structured files (e.g., JSON or JS objects) per language (e.g., `src/i18n/en-US.json`, `src/i18n/es.json`).
-   **Date/Time & Number Formatting**:
    -   `DESIGN.md` states dates are ISO (`YYYY-MM-DD`). This is generally good for consistency.
    -   However, if specific locales prefer different *display* formats for dates (e.g., `DD.MM.YYYY` for German), this needs to be considered. `vue-i18n` can handle localized date/number formatting.
    -   For now, continue with ISO date display for data, but UI labels around dates (e.g., "Start Date", "End Date") must be translatable.

### 2.2. Language Switching Mechanism

-   **User Interface**: Provide a clear way for users to switch the display language (e.g., a dropdown menu in the header or footer).
-   **Persistence**: The selected language should persist across sessions (e.g., using local storage or cookies).
-   **Default Language**:
    -   Set a default language (e.g., English).
    -   Optionally, detect browser language preference (`Accept-Language` header) on first visit to suggest or automatically set the language, falling back to default if the detected language isn't supported.

### 2.3. Content from API (WordPress)

-   **Initial Scope**: The initial i18n effort will focus on frontend UI text.
-   **Future Consideration**: Translating content fetched from WordPress (event descriptions, DJ bios, etc.) is a more complex task that depends on WordPress's multilingual capabilities (e.g., plugins like WPML or Polylang).
    -   If WordPress provides translated content via the API (e.g., different content for `example.com/en/api/...` vs `example.com/es/api/...`, or language parameters like `?lang=es`), the frontend would need to fetch content in the selected language. This is out of scope for the initial UI translation setup but should be kept in mind for future API integration.
    -   The `useCountries.ts` composable (mentioned in `DESIGN.md`) might need to handle localized country names if the API doesn't provide them directly in the target language.

### 2.4. Right-to-Left (RTL) Language Support (Future Consideration)

-   If languages like Arabic or Hebrew are to be supported in the future, consider RTL layout adjustments. Quasar has support for RTL. This is not in the initial scope but good to be aware of.

## 3. Tasks Checklist

### 3.1. Setup and Configuration

-   [ ] Install `vue-i18n` if not already part of Quasar's default setup for new projects.
-   [ ] Configure `vue-i18n` in the Quasar application (typically in a boot file `src/boot/i18n.ts`).
-   [ ] Create directory structure for translation files (e.g., `src/i18n/`).
-   [ ] Create initial translation files for the default language (e.g., `en-US.json`) and other target languages.

### 3.2. Text Extraction and Translation

-   [ ] Go through all Vue components and identify static UI text.
-   [ ] Replace hardcoded text with `vue-i18n` translation functions (e.g., `$t('key')`).
-   [ ] Populate translation files with keys and initial English strings.
-   [ ] Procure translations for other target languages. (This task might be external to development).

### 3.3. Language Switcher Implementation

-   [ ] Create a language switcher UI component (e.g., dropdown).
-   [ ] Implement logic to change the active locale in `vue-i18n`.
-   [ ] Implement persistence of the selected language (e.g., using `localStorage` and Quasar's `LocalStorage` utility).
-   [ ] Implement logic to detect browser language preference on first visit (optional).

### 3.4. Date/Time/Number Formatting (If enhanced localization is chosen)

-   [ ] Investigate `vue-i18n` capabilities for localized date/time/number formatting.
-   [ ] If needed, apply localized formatting to dates/numbers displayed in the UI, ensuring it respects the selected language.

### 3.5. API Content Considerations

-   [ ] For `useCountries.ts`, ensure country names can be translated. This might involve having a local mapping of country codes to translated names for each supported language if the API doesn't provide this.
-   [ ] Document how API-driven content translation would be approached in the future (WordPress multilingual setup, API changes).

### 3.6. Testing

-   [ ] Test that all UI text is correctly translated when switching languages.
-   [ ] Verify that the language selection persists across sessions.
-   [ ] Test fallback to default language if a translation key is missing for a specific language.
-   [ ] Test browser language detection (if implemented).
-   [ ] Test date/number formatting in different languages (if localized formatting is implemented).
-   [ ] Test on various browsers and devices.

## 4. Acceptance Criteria

-   [ ] All static UI text in the application is translatable.
-   [ ] The application supports a defined set of initial languages (e.g., English, Spanish, German).
-   [ ] Users can switch the application's language using a UI control.
-   [ ] The selected language preference is saved and persists across user sessions.
-   [ ] The application defaults to a predefined language (e.g., English) if no preference is set or detected.
-   [ ] (Optional) The application attempts to match the browser's preferred language on the first visit if that language is supported.
-   [ ] Translation keys are organized in language-specific files.
-   [ ] UI elements like country names are displayed in the selected language.
-   [ ] Dates and numbers are displayed consistently (either ISO or locale-specific, as decided).
-   [ ] The framework for adding new languages is in place.
