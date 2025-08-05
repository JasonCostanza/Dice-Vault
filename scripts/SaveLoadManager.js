/**
 * Performs auto loading/saving based on user settings
 */
function performAutoLoads() {
    if (fetchSetting('auto-load')) {
        console.log('Auto-loading rolls from local storage.');
        loadRollsFromLocalStorage();
    }

    updateAutoButtons();
}

/**
 * Updates the auto-load and auto-save button states based on current settings.
 * 
 * This function checks the current auto-load and auto-save settings and updates
 * the button text and disabled state accordingly.
 */
function updateAutoButtons(){
    if (fetchSetting('auto-load')) {
        document.getElementById('load-rolls-button').innerText = 'Auto-Loading';
        disableButtonById('load-rolls-button');
    }else{
        document.getElementById('load-rolls-button').innerText = 'Load Save';
        disableButtonById('load-rolls-button', false);
    }

    if (fetchSetting('auto-save')) {
        document.getElementById('save-rolls-button').innerText = 'Auto-Saving';
        disableButtonById('save-rolls-button');
    } else {
        document.getElementById('save-rolls-button').innerText = 'Save Locally';
        disableButtonById('save-rolls-button', false);
    }
}

/**
 * Saves all current dice configurations to TaleSpire's local storage.
 * 
 * This function iterates through all saved roll groups and their entries,
 * collecting the dice configuration data and saving it as JSON to TaleSpire's
 * campaign-specific local storage.
 */
function saveRollsToLocalStorage() {
    let rollsData = [];

    // Iterate over each creature group and save its rolls
    document.querySelectorAll('.saved-roll-group').forEach(group => {
        let creatureName = group.dataset.creatureName; // Get creature name
        let allCreatureRolls = [];

        group.querySelectorAll('.saved-roll-entry').forEach(entry => {
            let groupCount = parseInt(entry.dataset.groupCount, 10) || 1;
            let savedRoll = [];

            for (let i = 0; i < groupCount; i++) {
                let groupElement = entry.querySelector(`.dice-group[data-group-index="${i}"]`);
                if (groupElement) {
                    let groupName = groupElement.textContent.split(':')[0].trim();
                    let diceCountsData = groupElement.dataset.diceCounts;
                    try {
                        let diceCounts = JSON.parse(diceCountsData);
                        
                        // Filter out zero values
                        let filteredDiceCounts = {};
                        Object.entries(diceCounts).forEach(([diceType, count]) => {
                            if (count !== 0) {
                                filteredDiceCounts[diceType] = count;
                            }
                        });
                        
                        savedRoll.push({
                            name: groupName,
                            diceCounts: filteredDiceCounts
                        });
                    } catch (e) {
                        console.error(`Error parsing dice counts for group ${i}:`, e);
                        continue;
                    }
                }
            }

            // Only add to allCreatureRolls if savedRoll contains data
            if (savedRoll.length > 0) {
                allCreatureRolls.push({
                    savedRoll: savedRoll
                });
            }
        });

        rollsData.push({ creatureName, allCreatureRolls }); // Store grouped data
    });

    // Include counter information in the save data
    const saveData = {
        rollsData: rollsData,
        counters: counterManager.counters || []
    };

    let saveJson = JSON.stringify(saveData);
    TS.localStorage.campaign.setBlob(saveJson).then(() => {
        console.log('Rolls data and counters saved successfully.');
        disableButtonById('save-rolls-button');
        disableButtonById('load-rolls-button');
    }).catch(error => {
        console.error('Failed to save rolls data and counters:', error);
    });
}

/**
 * Loads saved dice configurations from TaleSpire's local storage.
 * 
 * This function retrieves previously saved dice configurations from TaleSpire's
 * campaign-specific local storage and restores them to the UI using the SavedRollManager.
 */
async function loadRollsFromLocalStorage() {
    try {
        // Clear all existing saved rolls before loading to prevent duplicates
        const savedRollsContainer = document.querySelector('.saved-rolls-container');
        if (savedRollsContainer) {
            savedRollsContainer.innerHTML = '';
        }

        // Clear existing counters before loading
        counterManager.counters = [];
        const counterElements = document.querySelectorAll('.counter-entry');
        counterElements.forEach(element => element.remove());

        // Now load the data
        const saveJson = await TS.localStorage.campaign.getBlob();
        let saveData;
        
        try {
            saveData = JSON.parse(saveJson || '{}');
        } catch (e) {
            console.error('Error parsing save data:', e);
            return;
        }

        // Handle both new format (with counters) and legacy format (rolls only)
        let rollsData;
        if (saveData.rollsData) {
            // New format with counters
            rollsData = saveData.rollsData;
            
            // Load counters if they exist
            if (saveData.counters && Array.isArray(saveData.counters)) {
                saveData.counters.forEach(counter => {
                    counterManager.addCounter(counter);
                });
            }
        } else if (Array.isArray(saveData)) {
            // Legacy format - just rolls data
            rollsData = saveData;
        } else {
            console.log('No valid save data found.');
            return;
        }

        // Load rolls data
        rollsData.forEach(({ creatureName, allCreatureRolls }) => { // Iterate over each saved creature
            allCreatureRolls.forEach(({ savedRoll }) => { 
                // Add each saved roll to the creature's group using the SavedRollManager instance
                savedRollManager.addSavedRoll(creatureName, savedRoll);
            });
        });
        
        disableButtonById('load-rolls-button');
        if (!fetchSetting('auto-save')){
            disableButtonById('save-rolls-button', false);
        }
    } catch (error) {
        console.error('Failed to load rolls data and counters:', error);
    }
}

/**
 * Loads saved rolls from local storage (legacy function).
 * 
 * This function is a legacy version of loadRollsFromLocalStorage that handles
 * the old data format. It's kept for backward compatibility.
 */
async function loadSavedRolls() {
    try {
        const savedData = await TS.localStorage.campaign.getBlob();
        const savedRolls = JSON.parse(savedData || '[]');
        savedRolls.forEach(roll => {
            // Use the SavedRollManager instance instead of global function
            savedRollManager.addSavedRoll(roll.name, roll.type, roll.counts);
        });
    } catch (e) {
        console.error('Failed to load saved rolls:', e);
    }
}

/**
 * Saves the current rolls to local storage (legacy function).
 * 
 * This function collects all current saved roll entries and returns them
 * in a format suitable for saving to local storage. It's kept for backward compatibility.
 * 
 * @returns {Array<Object>} Array of saved roll objects with name, type, and counts properties
 */
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

/**
 * Handles auto-save logic or enables save/load buttons for manual saving.
 * This function should be called whenever data changes (rolls, counters, etc.)
 * to maintain consistency with the auto-save feature.
 */
function handleDataChange() {
    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("save-rolls-button", false);
        disableButtonById("load-rolls-button", false);
    }
}

/**
 * Disables or enables a button by its ID.
 * @param {string} id - The ID of the button to disable or enable
 * @param {boolean} disable - Whether to disable the button. Default is true
 */
function disableButtonById(id, disable = true) {
    const button = document.getElementById(id);
    if (button) {
        button.disabled = disable;
    } else {
        console.error(`Button with ID "${id}" not found`);
    }
}
