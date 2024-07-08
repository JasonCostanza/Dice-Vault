function performAutoLoads(){
    if (fetchSetting('auto-load')) {
        console.log('Auto-loading rolls from local storage.');
        loadRollsFromLocalStorage();
    }

    if (fetchSetting('auto-save')) {

    }

    updateAutoButtons();
}

function updateAutoButtons(){
    if (fetchSetting('auto-load')) {
        document.getElementById('load-rolls-button').innerText = 'Auto-Loading';
        disableButtonById('load-rolls-button');
    }else{
        document.getElementById('load-rolls-button').innerText = 'Load Rolls';
        disableButtonById('load-rolls-button', false);
    }

    if (fetchSetting('auto-save')) {
        document.getElementById('save-rolls-button').innerText = 'Auto-Saving';
        disableButtonById('save-rolls-button');
    } else {
        document.getElementById('save-rolls-button').innerText = 'Save Rolls';
        disableButtonById('save-rolls-button', false);
    }
}

function saveRollsToLocalStorage() {
    let rollsData = [];
    document.querySelectorAll('.saved-roll-entry').forEach(entry => {
        let rollData = {
            name: entry.querySelector('.roll-entry-label').textContent.trim(),
            type: entry.dataset.rollType,
            counts: JSON.parse(entry.dataset.diceCounts)
        };
        rollsData.push(rollData);
    });

    let rollsJson = JSON.stringify(rollsData);
    console.log('Saving rolls data:', rollsJson);
    TS.localStorage.campaign.setBlob(rollsJson).then(() => {
        console.log('Rolls data saved successfully.');
        disableButtonById('save-rolls-button');
        disableButtonById('load-rolls-button')
    }).catch(error => {
        console.error('Failed to save rolls data:', error);
    });
}

function loadRollsFromLocalStorage() {
    TS.localStorage.campaign.getBlob().then(rollsJson => {
        console.log('Loading rolls data:', rollsJson);
        let rollsData = JSON.parse(rollsJson || '[]');
        rollsData.forEach(rollData => {
            addSavedRoll(rollData.name, rollData.counts);
        });
        disableButtonById('load-rolls-button');
        if (!fetchSetting('auto-save')){
            disableButtonById('save-rolls-button', false);
        }
    }).catch(error => {
        console.error('Failed to load rolls data:', error);
    });
}

async function loadSavedRolls() {
    try {
        const savedData = await TS.localStorage.campaign.getBlob();
        const savedRolls = JSON.parse(savedData || '[]');
        savedRolls.forEach(roll => {
            addSavedRoll(roll.name, roll.type, roll.counts);
        });
    } catch (e) {
        console.error('Failed to load saved rolls:', e);
    }
}

function saveCurrentRolls() {
    const savedRollsElements = document.querySelectorAll('.saved-roll-entry');
    const savedRolls = Array.from(savedRollsElements).map(roll => {
        return {
            name: roll.querySelector('.roll-entry-label').textContent,
            type: roll.dataset.rollType,
            counts: JSON.parse(roll.dataset.diceCounts)
        };
    });
}