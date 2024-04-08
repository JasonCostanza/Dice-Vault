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
        critBehavior: 'double-die-count'
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
        document.getElementById('auto-reset').checked = settings.autoSaveRolls || defaultSettings('autoResetEdit');
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
