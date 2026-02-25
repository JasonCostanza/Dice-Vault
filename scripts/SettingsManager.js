/**
 * Toggles the visibility of the settings modal.
 * 
 * This function shows or hides the settings modal.
 */
function toggleSettingsDisplay() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.classList.toggle('hidden');
}

/**
 * Returns the default value for a given setting.
 * 
 * This function provides default values for all available settings in the application.
 * It's used when loading settings to ensure all settings have valid values.
 *
 * @param {string} settingName - The name of the setting to get the default value for
 * @returns {*} The default value for the specified setting
 */
function defaultSettings(settingName) {
    const settings = {
        autoLoadRolls: false,
        autoSaveRolls: false,
        autoResetEdit: false,
        enableDualityGroups: false,
        enableExplodingDice: false,
        increaseExplodedDieSize: false,
        critBehavior: 'double-total',
        language: 'en'
    }
    return settings[settingName];
}

/**
 * Saves the current global settings to TaleSpire's local storage.
 * 
 * This function collects all current setting values from the UI and saves them
 * to TaleSpire's global local storage for persistence across sessions.
 */
function saveGlobalSettings() {
    const settings = {
        autoLoadRolls: document.getElementById('auto-load').checked,
        autoSaveRolls: document.getElementById('auto-save').checked,
        autoResetEdit: document.getElementById('auto-reset').checked,
        enableDualityGroups: document.getElementById('enable-duality-groups').checked,
        enableExplodingDice: document.getElementById('enable-exploding-dice').checked,
        increaseExplodedDieSize: document.getElementById('increase-exploded-die-size').checked,
        critBehavior: document.getElementById('crit-behavior').value,
        language: document.getElementById('language-select').value
    }
    TS.localStorage.global.setBlob(JSON.stringify(settings)).then(() => {
        console.log('Settings saved successfully.');
    }).catch(error => {
        console.error('Failed to save settings:', error);
    });
    updateAutoButtons();
    updateDualityVisibility();
}

/**
 * Loads global settings from TaleSpire's local storage.
 * 
 * This function retrieves previously saved settings from TaleSpire's global local storage
    * and applies them to the UI.If no settings are found, it uses default values.
 */
function loadGlobalSettings() {
    TS.localStorage.global.getBlob().then(settingsJson => {
        const settings = JSON.parse(settingsJson || '{}');
        document.getElementById('auto-load').checked = settings.autoLoadRolls || defaultSettings('autoLoadRolls');
        document.getElementById('auto-save').checked = settings.autoSaveRolls || defaultSettings('autoSaveRolls');
        document.getElementById('auto-reset').checked = settings.autoResetEdit || defaultSettings('autoResetEdit');
        document.getElementById('enable-duality-groups').checked = settings.enableDualityGroups || defaultSettings('enableDualityGroups');
        document.getElementById('enable-exploding-dice').checked = settings.enableExplodingDice || defaultSettings('enableExplodingDice');
        document.getElementById('increase-exploded-die-size').checked = settings.increaseExplodedDieSize || defaultSettings('increaseExplodedDieSize');
        document.getElementById('crit-behavior').value = settings.critBehavior || defaultSettings('critBehavior');
        const language = settings.language || defaultSettings('language');
        document.getElementById('language-select').value = language;

        // Apply translations after loading language preference
        if (typeof applyTranslations === 'function') {
            applyTranslations(language);
        }

        performAutoLoads();
        updateDualityVisibility();
        updateExplodingDiceVisibility();
    }).catch(error => {
        console.error('Failed to load settings:', error);
        // Apply default language (English) if loading fails
        if (typeof applyTranslations === 'function') {
            applyTranslations('en');
        }
    });
}

/**
 * Fetches the current value of a setting from the UI.
 * 
 * This function retrieves the current value of a setting element from the DOM
 * and returns it in the appropriate format (boolean for checkboxes, string for selects).
 *
 * @param {string} settingName - The ID of the setting element to fetch
 * @returns {boolean|string|undefined} The current value of the setting, or undefined if not found
 */
function fetchSetting(settingName) {
    const setting = document.getElementById(settingName)
    if (setting === null) {
        console.error('Setting not found:', settingName);
        return;
    }

    if (setting.type === 'checkbox') {
        return setting.checked;
    }

    if (setting.type === 'select-one') {
        return setting.value;
    }
}

/**
 * Handles copying backup data directly to clipboard
 * 
 * This function retrieves backup data from local storage and copies it directly
 * to the clipboard without showing a modal.
 */
async function handleCopyToClipboard() {
    const button = document.getElementById('copy-backup-button');
    const originalText = button.textContent;
    const originalStyle = button.style.cssText;

    try {
        const backupData = await getDataBackup();
        if (backupData) {
            // Convert the backup data to a formatted JSON string
            const backupString = JSON.stringify(backupData, null, 2);

            // Use the modern clipboard API to copy the data
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(backupString);
                showCopySuccess(button, originalText, originalStyle);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = backupString;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopySuccess(button, originalText, originalStyle);
            }
        } else {
            showCopyError(button, originalText, originalStyle, 'No backup data found.');
        }
    } catch (error) {
        console.error('Error copying backup to clipboard:', error);
        showCopyError(button, originalText, originalStyle, 'Failed to copy backup data.');
    }
}

/**
 * Shows success feedback when data is successfully copied to clipboard
 */
function showCopySuccess(button, originalText, originalStyle) {
    button.textContent = 'Copied!';
    button.style.backgroundColor = 'var(--ts-color-success, #4caf50)';
    button.style.color = 'white';
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.style.cssText = originalStyle;
        button.disabled = false;
    }, 2000);
}

/**
 * Shows error feedback when copying fails
 */
function showCopyError(button, originalText, originalStyle, message) {
    button.textContent = '✗ Error';
    button.style.backgroundColor = 'var(--ts-color-danger, #f44336)';
    button.style.color = 'white';
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.style.cssText = originalStyle;
        button.disabled = false;
    }, 2000);

    alert(message);
}

/**
 * Handles the retrieval and display of backup data.
 * 
 * This function retrieves backup data from local storage and displays it in a modal
 * for the user to copy. It's used for data recovery purposes.
 */
async function handleRetrieveBackup() {
    try {
        const backupData = await getDataBackup();
        if (backupData) {
            // Convert the backup data to a string for easy copying
            const backupString = JSON.stringify(backupData, null, 2);

            // Create a textarea element to hold the backup data
            const textArea = document.createElement('textarea');
            textArea.value = backupString;
            textArea.style.width = '100%';
            textArea.style.height = '80%';
            textArea.readOnly = true;

            // Create a modal or dialog to display the backup data
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.width = '80%';
            modal.style.height = '50%';
            modal.style.backgroundColor = 'var(--ts-background-primary)';
            modal.style.padding = '20px';
            modal.style.border = '1px solid var(--ts-accessibility-border)';
            modal.style.zIndex = '1000';

            const heading = document.createElement('h2');
            heading.textContent = 'Backup Data';

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.classList.add('wide-button');
            closeButton.onclick = () => document.body.removeChild(modal);

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('wide-button');
            copyButton.onclick = () => {
                textArea.select();
                document.execCommand('copy');
                alert('Backup data copied to clipboard!');
            };

            modal.appendChild(heading);
            modal.appendChild(textArea);
            modal.appendChild(copyButton);
            modal.appendChild(closeButton);

            document.body.appendChild(modal);
        } else {
            alert('No backup data found.');
        }
    } catch (error) {
        console.error('Error retrieving backup:', error);
        alert('An error occurred while retrieving the backup. Please check the console for details.');
    }
}

/**
 * Handles keyboard events for the settings modal.
 * Closes the modal when the Escape key is pressed.
 */
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
        }

        const mobileMenuModal = document.getElementById('mobile-menu-modal');
        if (mobileMenuModal && !mobileMenuModal.classList.contains('hidden')) {
            toggleMobileMenu();
        }
    }
});

/**
 * Toggles the visibility of the mobile menu modal.
 * 
 * This function shows or hides the mobile menu modal for mobile-friendly navigation.
 */
function toggleMobileMenu() {
    const mobileMenuModal = document.getElementById('mobile-menu-modal');
    if (mobileMenuModal.classList.contains('hidden')) {
        // Open
        mobileMenuModal.classList.remove('hidden');
        mobileMenuModal.classList.remove('closing');
    } else {
        // Close with animation
        mobileMenuModal.classList.add('closing');
        setTimeout(() => {
            mobileMenuModal.classList.remove('closing');
            mobileMenuModal.classList.add('hidden');
        }, 300);
    }
}

// Export to global scope
window.fetchSetting = fetchSetting;
window.updateDualityVisibility = updateDualityVisibility;
window.updateExplodingDiceVisibility = updateExplodingDiceVisibility;

/**
 * Updates the visibility of the "Escalating Explosions" child option
 * based on the "Enable Exploding Dice" parent toggle. When the parent is
 * disabled, the child checkbox is also forced unchecked and settings are saved.
 */
function updateExplodingDiceVisibility() {
    const enableExploding = document.getElementById('enable-exploding-dice').checked;
    const explodingOptions = document.getElementById('exploding-dice-options');
    if (explodingOptions) {
        if (enableExploding) {
            explodingOptions.classList.remove('hidden');
        } else {
            explodingOptions.classList.add('hidden');
            // Force child setting off when parent is disabled
            const childCheckbox = document.getElementById('increase-exploded-die-size');
            if (childCheckbox && childCheckbox.checked) {
                childCheckbox.checked = false;
                saveGlobalSettings();
            }
        }
    }
}

/**
 * Updates the visibility of the Duality buttons based on the setting.
 */
function updateDualityVisibility() {
    const enableDuality = document.getElementById('enable-duality-groups').checked;
    const dualityActionBar = document.getElementById('duality-action-bar');
    if (dualityActionBar) {
        if (enableDuality) {
            dualityActionBar.classList.remove('hidden');
        } else {
            dualityActionBar.classList.add('hidden');
        }
    }
}