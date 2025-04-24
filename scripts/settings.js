function toggleSettingsDisplay() {
    const settingsContainer = document.getElementById('settings-menu');
    const settingsButton = document.getElementById('settings-button');
    settingsContainer.classList.toggle('hidden');
    settingsButton.classList.toggle('active-menu');
}

function defaultSettings(settingName){
    const settings = {
        autoLoadRolls: false,
        autoSaveRolls: false,
        autoResetEdit: false,
        critBehavior: 'double-total'
    }
    return settings[settingName];
}

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