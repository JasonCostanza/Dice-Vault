/**
 * Handles roll result events from TaleSpire.
 * 
 * This function serves as a bridge between TaleSpire's roll events and our custom roll handling system.
 * It delegates the processing of roll events to the rollsModule, which applies any necessary
 * modifications (such as critical hit behaviors) and manages the display of results.
 * 
 * This function should be subscribed to TaleSpire's roll result events.
 *
 * @param {Object} rollEvent - An object representing a roll event from TaleSpire,
 *                             containing details about the dice roll and its results.
 * @returns {Promise<void>} A promise that resolves when the roll event has been fully processed.
 */
async function handleRollResult(rollEvent) {
    await rollsModule.handleRollResult(rollEvent);
}

/**
 * Handles state change events from TaleSpire.
 * 
 * This function responds to various state change events in TaleSpire, primarily
 * the "hasInitialized" event, which occurs when TaleSpire has finished
 * its initialization process.
 * 
 * When the "hasInitialized" event is received, this function:
 * 1. Triggers the loading of global settings for our plugin.
 * 2. Does not directly call checkAndUpgradeRollsData, as this is now handled
 *    within loadRollsFromLocalStorage to ensure proper sequencing.
 * 
 * This approach ensures that all necessary initialization and data upgrade
 * processes occur in the correct order, preventing any attempts to use
 * data before it has been properly loaded and, if necessary, upgraded.
 * 
 * This function should be subscribed to TaleSpire's state change events.
 *
 * @param {Object} msg - An object representing a state change message from TaleSpire.
 *                       It includes a 'kind' property indicating the type of state change.
 * @returns {Promise<void>} A promise that resolves when the state change has been handled.
 */
async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        await loadGlobalSettings();
    }
}

/**
 * Checks if the saved rolls data needs to be upgraded and performs the upgrade if necessary.
 * Includes a backup mechanism to preserve original data in case of upgrade failure.
 * 
 * This function performs the following steps:
 * 1. Loads existing data from local storage.
 * 2. Creates a backup of the original data before any modifications.
 * 3. Checks if the data is in the old format (1.3) and needs upgrading.
 * 4. If an upgrade is needed, it converts the data to the new format (2.0).
 * 5. Saves the upgraded data and logs the process.
 * 6. In case of failure, attempts to restore the original data.
 * 
 * Local storage location: C:\Users\%username%\AppData\LocalLow\BouncyRock Entertainment\TaleSpire\primary\Mods\Symbiotes\...
 * Example of 1.3 data format: [{"name":"Oaksteward: Dagger Dmg","type":"normal","counts":{"d4":"1","d6":"0","d8":"0","d10":"0","d12":"0","d20":"0","mod":"4"}},{"name":"Oaksteward: Magic Fang Attack (unarmed)","type":"normal","counts":{"d4":"0","d6":"0","d8":"0","d10":"0","d12":"0","d20":"1","mod":"5"}},{"name":"Oaksteward: Magic Fang Attack Dmg (unarmed)","type":"normal","counts":{"d4":"2","d6":"0","d8":"0","d10":"0","d12":"0","d20":"0","mod":"1"}},{"name":"Oaksteward: Ray of Frost","type":"normal","counts":{"d4":"2","d6":"0","d8":"0","d10":"0","d12":"0","d20":"0","mod":"0"}},{"name":"Oaksteward: Staff","type":"normal","counts":{"d4":"0","d6":"0","d8":"0","d10":"0","d12":"0","d20":"1","mod":"8"}},{"name":"Oaksteward: Staff Dmg (2h)","type":"normal","counts":{"d4":"0","d6":"0","d8":"1","d10":"0","d12":"0","d20":"0","mod":"4"}},{"name":"Oaksteward: Staff Shillelagh","type":"normal","counts":{"d4":"0","d6":"0","d8":"0","d10":"0","d12":"0","d20":"1","mod":"9"}},{"name":"Oaksteward: Staff Shillelagh Dmg","type":"normal","counts":{"d4":"2","d6":"0","d8":"0","d10":"0","d12":"0","d20":"0","mod":"5"}},{"name":"Oaksteward: Staff Shillelagh dmg (2h)","type":"normal","counts":{"d4":"0","d6":"0","d8":"2","d10":"0","d12":"0","d20":"0","mod":"5"}},{"name":"Oaksteward: Staff Shillelagh dmg (Extraplanar 2h)","type":"normal","counts":{"d4":"0","d6":"0","d8":"3","d10":"0","d12":"0","d20":"0","mod":"5"}},{"name":"Oaksteward: Staff Shillelagh Dmg (Extraplanar)","type":"normal","counts":{"d4":"3","d6":"0","d8":"0","d10":"0","d12":"0","d20":"0","mod":"5"}},{"name":"Oaksteward: Wild Shape - Claw","type":"normal","counts":{"d4":"0","d6":"0","d8":"0","d10":"0","d12":"0","d20":"1","mod":"7"}},{"name":"Oaksteward: Wild Shape - Claw Dmg","type":"normal","counts":{"d4":"0,"d6":"1","d8":"0","d10":"0","d12":"0","d20":"0","mod":"2"}}]
 * Example of 2.0 data format: [{"name":"T","type":"normal","counts":[{"d4":1,"d6":1,"d8":0,"d10":0,"d12":0,"d20":0,"mod":1},{"d4":0,"d6":0,"d8":1,"d10":0,"d12":1,"d20":0,"mod":2}]},{"name":"Unnamed Roll","type":"normal","counts":[{"d4":0,"d6":0,"d8":0,"d10":0,"d12":0,"d20":1,"mod":3}]}]
 * 
 * @returns {Promise<Array|null>} A promise that resolves to the (potentially upgraded) rolls data,
 *                                or null if no data was found or an error occurred.
 */
async function checkAndUpgradeRollsData() {
    let originalData = null;
    try {
        const savedData = await TS.localStorage.campaign.getBlob();
        
        if (!savedData) {
            console.log('No existing rolls data found.');
            return null;
        }

        originalData = savedData;
        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData) && parsedData.length > 0 && !parsedData[0].groups) {
            console.warn('Outdated rolls data format detected. Initiating upgrade process...');
            
            await TS.localStorage.campaign.setBlob(JSON.stringify({
                backupData: parsedData,
                backupTimestamp: new Date().toISOString()
            }), 'dice_vault_data_backup');

            const upgradedData = upgradeRollsData2_0To2_x(parsedData);

            await TS.localStorage.campaign.setBlob(JSON.stringify(upgradedData));

            console.warn('Rolls data upgrade completed successfully. ' +
                         `Upgraded ${upgradedData.length} roll(s) to the new format.`);
            console.log('A backup of your original data has been created. ' +
                        'If you encounter any issues, please contact the developer.');
            
            return upgradedData;
        } else {
            console.log('Rolls data is already in the current format. No upgrade needed.');
            return parsedData;
        }
    } catch (error) {
        console.error('Error occurred while checking or upgrading rolls data:', error);
        if (originalData) {
            console.warn('Attempting to restore original data...');
            try {
                await TS.localStorage.campaign.setBlob(originalData);
                console.warn('Original data restored. Please report this issue to the developer.');
            } catch (restoreError) {
                console.error('Failed to restore original data:', restoreError);
                console.error('Please contact the developer with this error message.');
            }
        }
        return null;
    }
}

/**
 * Upgrades rolls data from version 2.0 to the current format.
 * 
 * This function converts the old data format to the new format that supports
 * multiple dice groups per roll. It transforms the single counts object into
 * an array of group objects.
 *
 * @param {Array<Object>} oldData - Array of roll objects in the old format
 * @returns {Array<Object>} Array of roll objects in the new format
 */
function upgradeRollsData2_0To2_x(oldData) {
    return oldData.map(roll => {
        // Convert the old single counts object to an array with one group
        const upgradedRoll = {
            name: roll.name,
            groups: [{
                name: roll.name,
                diceCounts: roll.counts
            }]
        };
        return upgradedRoll;
    });
}

/**
 * Retrieves the backup of the original data before upgrade.
 * 
 * @returns {Promise<Object|null>} A promise that resolves to the backup data object,
 *                                 or null if no backup was found.
 */
async function getDataBackup() {
    try {
        const backupJson = await TS.localStorage.campaign.getBlob('dice_vault_data_backup');
        if (backupJson) {
            return JSON.parse(backupJson);
        }
        return null;
    } catch (error) {
        console.error('Error retrieving data backup:', error);
        return null;
    }
}