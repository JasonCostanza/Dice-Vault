# Language Implementation Guide

## Overview
The Dice Vault application now supports multiple languages through a comprehensive internationalization (i18n) system.

## Supported Languages
- **English** (en) - Default
- **Spanish** (es)
- **German** (de)
- **French** (fr)
- **Italian** (it)
- **Portuguese (Brazil)** (pt-br)

## How It Works

### User Experience
1. Open the **Settings** modal (gear icon in mobile menu)
2. Select your preferred language from the "Language" dropdown
3. The UI will immediately update to the selected language
4. Your language preference is automatically saved

### Technical Implementation

#### Files Modified/Created
1. **scripts/LanguageManager.js** (NEW)
   - Contains all translations in the `translations` object
   - Implements `changeLanguage()` function
   - Implements `applyTranslations()` to update all UI elements
   - Handles saving/loading language preferences

2. **vault.html**
   - Added script reference to LanguageManager.js
   - Already had the language selector with `onchange="changeLanguage()"`

3. **scripts/SettingsManager.js**
   - Updated to include language in settings save/load operations
   - Added language to default settings
   - Handles loading and applying language preference via `loadGlobalSettings()`

4. **scripts/taleSpireSubscriptionHandlers.js**
   - Calls `loadGlobalSettings()` when TaleSpire initializes
   - This ensures language preference is loaded and applied on startup

### Key Functions

#### `changeLanguage()`
Called when the user selects a different language from the dropdown. Updates the UI and saves the preference.

#### `applyTranslations(lang)`
Applies all translations for the specified language code to the UI elements. Handles:
- Text inputs (placeholders)
- Buttons
- Labels
- Select options
- Modal content

#### `saveLanguagePreference(lang)`
Saves the selected language to TaleSpire's global localStorage. This function is called by `changeLanguage()` to update the language setting in the global settings blob. It reads the existing settings, updates the language property, and saves the updated settings back.

#### `loadLanguagePreference()`
Legacy function in LanguageManager.js for loading language preference. In the current implementation, language loading is primarily handled by `loadGlobalSettings()` in SettingsManager.js, which is called when TaleSpire initializes. The `loadGlobalSettings()` function retrieves all settings (including language) and then calls `applyTranslations()` to update the UI.

#### `getTranslation(key)`
Utility function that retrieves a translation for a specific key in the current language. Falls back to English if the key is not found. This function is useful for dynamically translating text that may not be present in the initial HTML.

## Adding New Languages

To add a new language:

1. Open `scripts/LanguageManager.js`
2. Add a new language object to the `translations` object:
```javascript
"language-code": {
    creatureName: "Translation",
    addGroup: "Translation",
    // ... all other keys
}
```
3. Add the language option to the HTML in `vault.html`:
```html
<option value="language-code">Language Name</option>
```

## Translation Keys

All UI text elements are organized into categories:
- **Main UI**: Buttons, inputs, labels on the main screen
- **Sort Options**: Dropdown options for sorting
- **Mobile Menu**: Menu items and quotes
- **Settings Modal**: Settings labels and options
- **Crit Behavior Options**: Critical hit behavior options
- **Language Names**: Names of languages in each language

## Behavior Notes

- Language preference persists across sessions via TaleSpire's global localStorage
- Language is loaded when TaleSpire initializes (via `loadGlobalSettings()`)
- Changing language updates the UI immediately
- Images and icons are preserved when updating button text
- If a language file is incomplete, it falls back to English
- The language setting is integrated with other settings and saved/loaded together through SettingsManager

## Future Enhancements

Potential improvements:
- Add more languages
- Translate dynamically generated content (dice groups, counters, etc.)
- Add language-specific number formatting
- Add date/time localization if needed
