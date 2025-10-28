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
- **Russian** (ru)
- **Chinese (Simplified)** (zh-cn)
- **Japanese** (ja)

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

3. **scripts/main.js**
   - Added call to `loadLanguagePreference()` on page load

4. **scripts/SettingsManager.js**
   - Updated to include language in settings save/load operations
   - Added language to default settings

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
Saves the selected language to TaleSpire's global localStorage.

#### `loadLanguagePreference()`
Loads the saved language preference on application startup and applies it to the UI.

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

- Language preference persists across sessions
- Changing language updates the UI immediately
- Images and icons are preserved when updating button text
- If a language file is incomplete, it falls back to English
- The language setting is stored separately from other settings but saved together

## Future Enhancements

Potential improvements:
- Add more languages
- Translate dynamically generated content (dice groups, counters, etc.)
- Add language-specific number formatting
- Add date/time localization if needed
