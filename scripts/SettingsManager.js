/**
 * Toggles the visibility of the settings menu.
 * 
 * This function shows or hides the settings menu and updates the settings button
 * to reflect the current state.
 */
function toggleSettingsDisplay() {
    const settingsContainer = document.getElementById('settings-menu');
    const settingsButton = document.getElementById('settings-button');
    settingsContainer.classList.toggle('hidden');
    settingsButton.classList.toggle('active-menu');
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
function defaultSettings(settingName){
    const settings = {
        autoLoadRolls: false,
        autoSaveRolls: false,
        autoResetEdit: false,
        critBehavior: 'double-total'
    }
    return settings[settingName];
}

/**
 * Saves the current global settings to TaleSpire's local storage.
 * 
 * This function collects all current setting values from the UI and saves them
 * to TaleSpire's global local storage for persistence across sessions.
 */
function saveGlobalSettings(){
    const settings = {
        autoLoadRolls: document.getElementById('auto-load').checked,
        autoSaveRolls: document.getElementById('auto-save').checked,
        autoResetEdit: document.getElementById('auto-reset').checked,
        critBehavior: document.getElementById('crit-behavior').value
    }
    TS.localStorage.global.setBlob(JSON.stringify(settings)).then(() => {
        console.log('Settings saved successfully.');
    }).catch(error => {
        console.error('Failed to save settings:', error);
    });
    updateAutoButtons();
}

/**
 * Loads global settings from TaleSpire's local storage.
 * 
 * This function retrieves previously saved settings from TaleSpire's global local storage
 * and applies them to the UI. If no settings are found, it uses default values.
 */
function loadGlobalSettings(){
    TS.localStorage.global.getBlob().then(settingsJson => {
        const settings = JSON.parse(settingsJson || '{}');
        document.getElementById('auto-load').checked = settings.autoLoadRolls || defaultSettings('autoLoadRolls');
        document.getElementById('auto-save').checked = settings.autoSaveRolls || defaultSettings('autoSaveRolls');
        document.getElementById('auto-reset').checked = settings.autoResetEdit || defaultSettings('autoResetEdit');
        document.getElementById('crit-behavior').value = settings.critBehavior || defaultSettings('critBehavior');
        performAutoLoads();
    }).catch(error => {
        console.error('Failed to load settings:', error);
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
function fetchSetting(settingName){
    const setting = document.getElementById(settingName)
    if (setting === null){
        console.error('Setting not found:', settingName);
        return;
    }

    if (setting.type === 'checkbox'){
        return setting.checked;
    }

    if (setting.type === 'select-one'){
        return setting.value;
    }
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
            modal.style.backgroundColor = 'white';
            modal.style.padding = '20px';
            modal.style.border = '1px solid black';
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

// Export to global scope
window.fetchSetting = fetchSetting;