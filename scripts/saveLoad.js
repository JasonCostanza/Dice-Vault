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
        let groupCount = parseInt(entry.dataset.groupCount, 10) || 1;
        let counts = [];
        for (let i = 0; i < groupCount; i++) {
            let groupData = entry.querySelector(`.dice-group[data-group-index="${i}"]`)?.dataset.diceCounts;
            if (groupData) {
                try {
                    counts.push(JSON.parse(groupData));
                } catch (e) {
                    console.error(`Error parsing dice counts for group ${i}:`, e);
                    // Skip this group if it can't be parsed
                    continue;
                }
            }
        }
        let rollData = {
            name: entry.querySelector('.roll-entry-label').textContent.trim(),
            type: entry.dataset.rollType,
            counts: counts
        };
        rollsData.push(rollData);
    });

    let rollsJson = JSON.stringify(rollsData);
    TS.localStorage.campaign.setBlob(rollsJson).then(() => {
        console.log('Rolls data saved successfully.');
        disableButtonById('save-rolls-button');
        disableButtonById('load-rolls-button');
    }).catch(error => {
        console.error('Failed to save rolls data:', error);
    });
}

function loadRollsFromLocalStorage() {
    TS.localStorage.campaign.getBlob().then(rollsJson => {
        let rollsData = JSON.parse(rollsJson || '[]');
        rollsData.forEach(rollData => {
            addSavedRoll(rollData.name, rollData.counts, rollData.type);
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

    const savedRolls = Array.from(savedRollsElements).map((roll, index) => {

        const groupCount = parseInt(roll.dataset.groupCount, 10) || 1;

        const counts = [];
        for (let i = 0; i < groupCount; i++) {
            const groupElement = roll.querySelector(`.dice-group[data-group-index="${i}"]`);

            if (groupElement) {
                const groupData = groupElement.dataset.diceCounts;

                if (groupData) {
                    try {
                        const parsedData = JSON.parse(groupData);
                        counts.push(parsedData);
                    } catch (e) {
                        console.error(`Error parsing dice counts for roll ${index}, group ${i}:`, e);
                        // Push an empty object instead of skipping to maintain group structure
                        counts.push({});
                    }
                } else {
                    console.warn(`No dice counts data for roll ${index}, group ${i}`);
                    counts.push({});
                }
            } else {
                console.warn(`No group element found for roll ${index}, group ${i}`);
                counts.push({});
            }
        }

        const name = roll.querySelector('.roll-entry-label')?.textContent || `Unnamed Roll ${index}`;
        const type = roll.dataset.rollType || 'normal';

        return { name, type, counts };
    });

    return savedRolls;
}