const rollManager = (function () {

    /**
     * Initiates a dice roll with the specified roll type and dice groups data.
     * 
     * This function validates the dice groups data, applies critical hit behaviors
     * if necessary, and sends the dice to TaleSpire's dice tray for rolling.
     * It handles various roll types including normal, advantage, disadvantage,
     * best-of-three, and critical rolls.
     *
     * @param {string} rollTypeParam - The type of roll to perform (normal, advantage, disadvantage, best-of-three, crit-dice)
     * @param {Array<Object>} groupsData - Array of dice group objects with dice counts and modifiers
     */
    function roll(rollTypeParam, groupsData) {
        let selectedType = rollTypeParam || rollTypes.normal;
        let updatedDiceGroupsData = groupsData || [];
    
        if (!Array.isArray(updatedDiceGroupsData)) {
            console.error('Invalid dice groups data:', updatedDiceGroupsData);
            return;
        }
    
        if (updatedDiceGroupsData.length === 0) {
            // If no groupsData provided, use the current UI state
            const diceGroupElements = document.querySelectorAll(".dice-selection");
            diceGroupElements.forEach((groupElement) => {
                const groupId = groupElement.id;
                const groupDiceCounts = {};
                
                // Get the wrapper that contains the header with the group name
                const wrapper = groupElement.closest('.dice-group-wrapper');
                const header = wrapper ? wrapper.querySelector('.dice-group-header') : null;
                const groupNameInput = header ? header.querySelector('.dice-group-name-input') : null;
                const groupName = groupNameInput && groupNameInput.value.trim() ? groupNameInput.value.trim() : `Group ${parseInt(groupId) + 1}`;
    
                diceTypes.forEach((diceType) => {
                    const countElement = document.getElementById(`group-${groupId}-${diceType}-counter-value`);
                    groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
                });
    
                const modElement = document.getElementById(`group-${groupId}-mod-counter-value`);
                groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;
    
                updatedDiceGroupsData.push({
                    name: groupName,
                    diceCounts: groupDiceCounts
                });
            });
        }
    
        diceGroupsData = updatedDiceGroupsData;
    
        // Check for groups with only modifiers (error case)
        const modifierOnlyGroups = diceGroupsData.filter(group => {
            if (!group || !group.diceCounts) return false;
            
            const hasDice = diceTypes.some(diceType => {
                const count = group.diceCounts[diceType] || 0;
                return count > 0;
            });
            
            const hasModifier = group.diceCounts.mod && group.diceCounts.mod !== 0;
            
            return !hasDice && hasModifier;
        });
    
        if (modifierOnlyGroups.length > 0) {
            const groupNames = modifierOnlyGroups.map(group => group.name || 'Unnamed Group').join(', ');
            console.error(`Cannot roll groups with only modifiers and no dice: ${groupNames}`);
            alert(`Error: Cannot roll groups with only modifiers and no dice.\n\nGroups with this issue: ${groupNames}\n\nPlease add at least one die to these groups or set their modifier to 0.`);
            return;
        }

        if (diceGroupsData.every(diceGroupManager.isDiceGroupEmpty.bind(diceGroupManager))) {
            console.warn("Attempted to roll with empty dice groups");
            alert("Error: No dice selected for rolling. Please add at least one die to a group before rolling.");
            return;
        }
        let critBehavior = fetchSetting("crit-behavior");
    
        if (selectedType === rollTypes.critical) {
            if (critBehavior === "double-die-count") {
                diceGroupsData = doubleDiceCounts(diceGroupsData);
            }
        } else {
            critBehavior = "none";
        }
    
        putDiceToRollIntoDiceTray(selectedType, critBehavior);
    }

    /**
     * Sends dice to TaleSpire's dice tray for rolling.
     * 
     * This function constructs dice roll descriptors from the current dice groups
     * and sends them to TaleSpire's dice system for processing.
     *
     * @param {string} selectedType - The type of roll being performed
     * @param {string} critBehavior - The critical hit behavior to apply
     */
    function putDiceToRollIntoDiceTray(selectedType, critBehavior) {
        try {
            let baseDiceDescriptors = constructDiceRollDescriptors(selectedType);
            
            if (baseDiceDescriptors.length === 0) {
                console.warn("No dice to roll after filtering empty groups");
                alert("Error: No valid dice groups found for rolling. Please ensure at least one group has dice selected.");
                return;
            }
    
            let trayConfiguration = buildDiceTrayConfiguration(baseDiceDescriptors, selectedType);
    
            TS.dice.putDiceInTray(trayConfiguration, true).then((rollId) => {
                trackedRollIds[rollId] = {
                    type: selectedType,
                    critBehavior: critBehavior,
                    createdByDiceVault: true
                };
            });
        } catch (error) {
            console.error("Error creating roll descriptors:", error);
            alert("Error: Failed to create dice roll. Please check your dice configuration and try again.");
        }
    }

    /**
     * Constructs a dice tray configuration based on the base set of dice descriptors
     * and the roll type.
     *
     * This function generates a configuration for a dice tray, which is used to simulate
     * rolling dice in TaleSpire's digital environment. It takes a base set of dice
     * descriptors (each descriptor detailing the type and number of dice) and replicates
     * this set according to the number of rolls dictated by the roll type. The roll type
     * determines how many times the dice should be rolled (e.g., once for a normal roll,
     * twice for advantage/disadvantage, etc.), and this function adjusts the dice tray
     * configuration accordingly.
     *
     * The resulting array of dice descriptors represents the total set of dice to be rolled
     * in the simulation, accounting for the roll type's requirements.
     *
     * @param {Array<Object>} baseSetOfDiceDescriptors - An array of objects, each describing
     *                                                   a set of dice to be rolled (type and
     *                                                   count).
     * @param {string} rollType - A string indicating the type of roll (e.g., 'normal',
     *                            'advantage', 'disadvantage'), which affects the number
     *                            of dice rolled.
     *
     * @returns {Array<Object>} An array of dice descriptors adjusted for the roll type, representing the configuration of the dice tray.
     */
    function buildDiceTrayConfiguration(baseSetOfDiceDescriptors, rollType) {
        let rollCount = getRollCount(rollType);
        let diceDescriptors = [];

        for (let i = 0; i < rollCount; i++) {
            diceDescriptors.push(...baseSetOfDiceDescriptors);
        }

        return diceDescriptors;
    }

    /**
     * Determines the number of dice rolls to perform based on the roll type.
     *
     * This function takes a roll type as input and returns the number of times a
     * dice should be rolled according to the specified roll type. The roll types
     * include 'advantage', 'disadvantage', and 'bestofThree'.
     *
     * - For 'advantage' and 'disadvantage', the function returns 2, indicating that
     *   two dice should be rolled.
     * - For 'bestofThree', it returns 3, indicating that three dice should be rolled.
     * - For any other roll type, it defaults to returning 1, indicating a single dice
     *   roll.
     *
     * @param {string} rollType - The type of roll being performed, which determines
     *                            the number of dice rolls.
     *
     * @returns {number} The number of times to roll the dice based on the specified roll type.
     */
    function getRollCount(rollType) {
        switch (rollType) {
            case rollTypes.advantage:
            case rollTypes.disadvantage:
                return 2;

            case rollTypes.bestofThree:
                return 3;

            default:
                return 1;
        }
    }

    /**
     * Constructs dice roll descriptors from the current dice groups data.
     * 
     * This function iterates through all dice groups and creates roll descriptors
     * for TaleSpire's dice system. It handles dice counts, modifiers, and group names,
     * and adds appropriate suffixes based on the roll type.
     *
     * @param {string} rollType - The type of roll being performed
     * @returns {Array<Object>} Array of dice roll descriptor objects with name and roll properties
     */
    function constructDiceRollDescriptors(rollType) {
        let diceRollObjects = [];
    
        diceGroupsData.forEach((group, index) => {
            if (!diceGroupManager.isDiceGroupEmpty(group)) {
                let groupRollString = "";
                let hasDice = false;
    
                // Handle all dice types, including those that might be missing
                diceTypes.forEach(diceType => {
                    const count = group.diceCounts[diceType] || 0;
                    if (count > 0) {
                        groupRollString += `+${count}${diceType}`;
                        hasDice = true;
                    }
                });
    
                // Handle modifier which might be missing
                let modValue = group.diceCounts.mod || 0;
                if (modValue !== 0) {
                    let modPart = modValue > 0 ? `+${modValue}` : `${modValue}`;
                    groupRollString += modPart;
                }
    
                // Additional safety check: only create roll objects if there are actual dice
                if (hasDice && groupRollString) {
                    // Remove leading '+' if present
                    groupRollString = groupRollString.startsWith('+') ? groupRollString.slice(1) : groupRollString;
                    
                    let groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;
                    
                    // Add suffix based on roll type
                    switch (rollType) {
                        case rollTypes.advantage:
                            groupName += " (adv.)";
                            break;
                        case rollTypes.disadvantage:
                            groupName += " (dis.)";
                            break;
                        case rollTypes.bestofThree:
                            groupName += " (Bo3)";
                            break;
                        case rollTypes.critical:
                            groupName += " (Crit)";
                            break;
                        default:
                            break;
                    }
                    
                    let rollObject = { 
                        name: groupName, 
                        roll: groupRollString 
                    };
                    diceRollObjects.push(rollObject);
                } else if (!hasDice && modValue !== 0) {
                    // This should not happen anymore due to the validation in roll(), but let's log it just in case
                    console.warn(`Skipping group "${group.name || `Group ${index + 1}`}" - cannot roll modifier without dice`);
                }
            }
        });
    
        return diceRollObjects;
    }
    

    /**
     * Handles the processing of roll events, including roll results and roll removals.
     *
     * This function serves as the main entry point for processing roll events from TaleSpire.
     * It performs the following steps:
     * 1. Validates that the roll is being tracked by our system.
     * 2. Checks if the event type is valid (either 'rollResults' or 'rollRemoved').
     * 3. Delegates to appropriate handlers based on the event type:
     *    - For 'rollRemoved', it removes the roll from tracking.
     *    - For 'rollResults', it processes the results, applying any necessary
     *      modifications (like critical hit behaviors) before displaying.
     *
     * @param {Object} rollEvent - An object representing a roll event, containing a
     *                             payload with the roll ID and other relevant information.
     *
     * @returns {Promise<void>} A promise that resolves once the roll event has been processed.
     */
    async function handleRollResult(rollEvent) {
        const rollId = rollEvent.payload.rollId;

        if (trackedRollIds[rollId] === undefined) {
            // Handle TaleSpire-initiated roll
            console.log(`Received result for a TaleSpire-created roll: ${rollId}`);
            // Optionally process or log TaleSpire roll data
            return;
        }
    
        if (trackedRollIds[rollId].createdByDiceVault === true) {
            // Process createdByDiceVault roll
            console.log(`Processing Dice Vault roll: ${rollId}`);
            // Your existing roll processing logic
        } else {
            // This shouldn't happen if the flag is set correctly, but just in case
            console.warn(`Unexpected roll state for ID: ${rollId}`);
        }

        if (trackedRollIds[rollEvent.payload.rollId] == undefined) {
            console.error(`Tracked Roll for ID \"${rollEvent.payload.rollId}\" not found.`);
            return;
        }

        if (!isValidRollEvent(rollEvent.kind)) {
            console.error(`Invalid roll event: ${rollEvent.kind}`);
            return;
        }

        if (rollEvent.kind == rollEvents.rollRemoved) {
            handleRollRemovedEvent(rollEvent);
        } else if (rollEvent.kind == rollEvents.rollResults) {
            await handleRollResultsEvent(rollEvent);
        }
    }

    /**
     * Checks if the given event name corresponds to a valid TaleSpire roll event.
     *
     * @param {string} eventName - The name of the event to check for validity.
     *
     * @returns {boolean} True if the event name is valid (matches 'rollResults'
     *                    or 'rollRemoved'), otherwise false.
     */
    function isValidRollEvent(eventName) {
        if (
            eventName == rollEvents.rollResults ||
            eventName == rollEvents.rollRemoved
        ) {
            return true;
        }

        return false;
    }

    /**
     * Processes a roll removed event and removes a roll from the tracked
     * rolls collection.
     *
     * [rollRemoved event](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollremoved)
     *
     * @param {Object} rollEvent - An object representing a roll removal
     *                             event, containing the payload with the
     *                             roll ID to be removed.
     */
    function handleRollRemovedEvent(rollEvent) {
        delete trackedRollIds[rollEvent.payload.rollId];
    }

    /**
     * Processes a roll results event and applies specific roll handling based on
     * the roll type and critical hit behavior.
     *
     * This function performs the following steps:
     * 1. Retrieves roll information and critical behavior.
     * 2. Gets the reportable roll results group based on roll type.
     * 3. Applies the appropriate critical hit behavior to the results.
     * 4. Displays the modified results in TaleSpire.
     *
     * It handles various roll types and critical hit behaviors, ensuring that
     * the final displayed results accurately reflect any special conditions.
     *
     * @param {Object} rollEvent - An object representing a roll event, containing the
     *                             payload with roll details.
     *
     * @returns {Promise<void>} A promise that resolves when the roll results have been
     *                          processed and displayed.
     */
    async function handleRollResultsEvent(rollEvent) {
        let roll = rollEvent.payload;
        let resultGroups = [];
    
        if (roll.resultsGroups != undefined) {
            let rollInfo = trackedRollIds[roll.rollId];
            if (rollInfo) {
                try {
                    resultGroups = await getReportableRollResultsGroup(
                        roll,
                        rollInfo.type
                    );
    
                    resultGroups = applyCritBehaviorToRollResultsGroup(
                        resultGroups,
                        rollInfo.critBehavior
                    );
    
                    await displayResults(resultGroups, roll.rollId);
                    console.log('Results displayed successfully');
                } catch (error) {
                    console.error('Error processing or displaying results:', error);
                }
            } else {
                console.warn(`No roll info found for roll ID: ${roll.rollId}`);
            }
        } else {
            console.warn('No result groups found in the roll payload');
        }
    }

    /**
     * Gets the reportable roll results group based on the roll type.
     * 
     * This function processes roll results based on the roll type and applies
     * appropriate logic for advantage, disadvantage, and best-of-three rolls.
     * For normal rolls, it returns the original results unchanged.
     *
     * @param {Object} roll - The roll object containing results groups
     * @param {string} rollType - The type of roll that was performed
     * @returns {Promise<Array<Object>>} A promise that resolves to the processed roll results groups
     */
    async function getReportableRollResultsGroup(roll, rollType) {
        let resultGroups;
    
        switch (rollType) {
            case rollTypes.advantage:
                resultGroups = await handleAdvantageRoll(roll);
                // Remove the prefix addition
                break;
    
            case rollTypes.disadvantage:
                resultGroups = await handleDisadvantageRoll(roll);
                // Remove the prefix addition
                break;
    
            case rollTypes.bestofThree:
                resultGroups = await handleBestOfThreeRoll(roll);
                // Remove the prefix addition
                break;
    
            default:
                resultGroups = roll.resultsGroups;
        }
    
        // Ensure we always return an array, even if it's a single group
        return Array.isArray(resultGroups) ? resultGroups : [resultGroups];
    }

    /**
     * Adds a prefix to all group names in the result groups.
     * 
     * This function is used to modify group names when displaying results
     * to indicate the type of roll that was performed.
     *
     * @param {Array<Object>} resultGroups - Array of result group objects
     * @param {string} prefix - The prefix to add to each group name
     * @returns {Array<Object>} Array of result groups with modified names
     */
    function addPrefixToGroupNames(resultGroups, prefix) {
        return resultGroups.map(group => ({
            ...group,
            name: group.name ? `${prefix}${group.name}` : prefix.trim()
        }));
    }

    /**
     * Handle the calculation of roll results under the advantage condition.
     *
     * @param {Object} roll             - An object representing a roll, which contains an array of
     *                                    results groups.
     *
     * @returns {Promise<Array>} A promise that resolves to an array representing the
     *                           set of roll results with the highest sum.
     */
    async function handleAdvantageRoll(roll) {
        return await handleAdvantageDisadvantageRoll(roll, true);
    }

    /**
     * Handle the calculation of roll results under the disadvantage condition.
     *
     * @param {Object} roll             - An object representing a roll, which contains an array of
     *                                    results groups.
     *
     * @returns {Promise<Array>} A promise that resolves to an array representing the
     *                           set of roll results with the lowest sum.
     */
    async function handleDisadvantageRoll(roll) {
        return await handleAdvantageDisadvantageRoll(roll, false);
    }

    /**
     * Handles the calculation of roll results under advantage or disadvantage conditions.
     *
     * This function takes a roll object and a boolean indicating whether the roll is
     * under advantage or disadvantage conditions. It divides the roll's results into
     * two equal sets. If the number of results groups is less than 2 or not even, it
     * returns the original results groups. It then calculates the sum of each set.
     * Under advantage conditions, it returns the set with the higher sum; under disadvantage
     * conditions, it returns the set with the lower sum.
     *
     * @param {Object} roll             - An object representing a roll, which contains an array of
     *                                    results groups.
     * @param {boolean} isAdvantage     - A boolean indicating if the roll is under advantage (true)
     *                                    or disadvantage (false) conditions.
     *
     * @returns {Promise<Array>} A promise that resolves to an array representing the
     *                           set of roll results with either the highest sum (advantage)
     *                           or the lowest sum (disadvantage).
     */
    async function handleAdvantageDisadvantageRoll(roll, isAdvantage) {
        if (
            roll.resultsGroups.length < 2 ||
            roll.resultsGroups.length % 2 != 0
        ) {
            return roll.resultsGroups;
        }
    
        let startingIndexOfSecondSetOfGroups = roll.resultsGroups.length / 2;
    
        let firstSetOfGroups = roll.resultsGroups.slice(
            0,
            startingIndexOfSecondSetOfGroups
        );
    
        let secondSetOfGroups = roll.resultsGroups.slice(
            startingIndexOfSecondSetOfGroups
        );
    
        let sumOfFirstSet = await getSumOfRollResultsGroups(firstSetOfGroups);
        let sumOfSecondSet = await getSumOfRollResultsGroups(secondSetOfGroups);
    
        let chosenSet = (isAdvantage ? 
            (sumOfFirstSet >= sumOfSecondSet ? firstSetOfGroups : secondSetOfGroups) :
            (sumOfFirstSet <= sumOfSecondSet ? firstSetOfGroups : secondSetOfGroups));
    
        return chosenSet;
    }

    /**
     * Processes a roll containing multiple groups of roll results and selects the
     * best set of results based on their sum.
     *
     * This function divides the roll's results into three equal sets and calculates
     * the sum of each set. It then compares these sums to determine which set has
     * the highest total sum. If the number of results groups is not a multiple of
     * three or is less than three, the function returns the original roll results
     * groups without modification.
     *
     * @param {Object} roll - An object representing a roll, which contains an array
     *                        of results groups.
     *
     * @returns {Promise<Array>} A promise that resolves to an array representing the
     *                           set of roll results with the highest sum. If the input
     *                           does not meet the required conditions (e.g., not
     *                           divisible by three, less than three groups), it returns
     *                           the original array of roll results groups.
     */
    async function handleBestOfThreeRoll(roll) {
        if (
            roll.resultsGroups.length < 3 ||
            roll.resultsGroups.length % 3 != 0
        ) {
            return roll.resultsGroups;
        }

        let startingIndexOfSecondSetOfGroups = roll.resultsGroups.length / 3;
        let startingIndexOfThirdSetOfGroups =
            startingIndexOfSecondSetOfGroups * 2;

        let firstSetOfGroups = roll.resultsGroups.slice(
            0,
            startingIndexOfSecondSetOfGroups
        );

        let secondSetOfGroups = roll.resultsGroups.slice(
            startingIndexOfSecondSetOfGroups,
            startingIndexOfThirdSetOfGroups
        );

        let thirdSetOfGroups = roll.resultsGroups.slice(
            startingIndexOfThirdSetOfGroups
        );

        let sumOfFirstSet = await getSumOfRollResultsGroups(firstSetOfGroups);
        let sumOfSecondSet = await getSumOfRollResultsGroups(secondSetOfGroups);
        let sumOfThirdSet = await getSumOfRollResultsGroups(thirdSetOfGroups);

        if (sumOfFirstSet >= sumOfSecondSet && sumOfFirstSet >= sumOfThirdSet) {
            return firstSetOfGroups;
        } else if (
            sumOfSecondSet >= sumOfFirstSet &&
            sumOfSecondSet >= sumOfThirdSet
        ) {
            return secondSetOfGroups;
        } else {
            return thirdSetOfGroups;
        }
    }

    /**
     * Calculates the total sum of multiple groups of dice roll results.
     *
     * This function takes an array of roll results groups, where each group
     * represents a collection of dice roll results. It asynchronously evaluates
     * the sum of each group using a provided evaluation function
     * (`TS.dice.evaluateDiceResultsGroup`), then calculates and returns the total
     * sum of these group sums.
     *
     * @param {Array} rollResultsGroups - An array of roll results groups, where
     *                                    each group is a collection that can be
     *                                    evaluated into a sum.
     *
     * @returns {Promise<number>} A promise that resolves to the total sum of the
     *                            evaluated sums of each group in `rollResultsGroups`.
     */
    async function getSumOfRollResultsGroups(rollResultsGroups) {
        let sum = 0;

        for (let resultsGroup of rollResultsGroups) {
            sum += await TS.dice.evaluateDiceResultsGroup(resultsGroup);
        }

        return sum;
    }

    /**
     * Applies critical hit behavior to groups of roll results.
     * 
     * This function modifies the given roll results groups based on the specified
     * critical hit behavior. It handles nested dice structures and supports multiple
     * critical hit behaviors:
     * - "double-total": Doubles all values, including dice results and modifiers.
     * - "double-die-result": Doubles only the dice results, leaving modifiers unchanged.
     * - "max-die": Sets each die to its maximum possible value.
     * - "max-plus": Adds the maximum possible value of each die to the original roll.
     * 
     * Note: The "double-die-count" behavior is not handled in this function as it's
     * applied earlier in the roll process, before the dice are actually rolled.
     * 
     * @param {Array<Object>} resultGroups - An array of roll result group objects to be modified.
     * @param {string} critBehavior - The type of critical hit behavior to apply.
     * 
     * @returns {Array<Object>} An array of modified roll result group objects with the
     *                          critical hit behavior applied.
     */
    function applyCritBehaviorToRollResultsGroup(resultGroups, critBehavior) {
        console.log('Applying crit behavior:', critBehavior);
    
        if (!Array.isArray(resultGroups)) {
            console.warn('applyCritBehaviorToRollResultsGroup received non-array input, converting to array');
            resultGroups = [resultGroups];
        }
    
        return resultGroups.map(group => {
            let modifiedResult;
            switch (critBehavior) {
                case "double-total":
                    modifiedResult = doubleTotal(group.result);
                    break;
                case "double-die-result":
                    modifiedResult = doubleDiceResults(group.result);
                    break;
                case "max-die":
                    modifiedResult = maximizeDice(group.result);
                    break;
                case "max-plus":
                    modifiedResult = addMaxDieForEachKind(group.result);
                    break;
                case "triple-total":
                    modifiedResult = tripleTotal(group.result);
                    break;
                case "quadruple-total":
                    modifiedResult = quadrupleTotal(group.result);
                    break;
                case "one-point-five-total":
                    modifiedResult = onePointFiveTotal(group.result);
                    break;
                default:
                    modifiedResult = group.result;
            }
    
            // Update the group name to include "Critical" if it's a crit behavior
            // if (critBehavior !== "none") {
            //     group.name = group.name ? `${group.name}` : "Critical Roll";
            // }
    
            return {
                ...group,
                result: modifiedResult
            };
        });
    }

    /**
     * Displays the processed roll results in TaleSpire.
     * 
     * This function takes the final processed roll results and sends them to TaleSpire
     * for display. It ensures each result group has proper names and descriptions,
     * and adds appropriate suffixes based on the roll type.
     *
     * @param {Array<Object>} resultGroups - Array of processed roll result groups
     * @param {string} rollId - The ID of the roll being displayed
     * @returns {Promise<void>} A promise that resolves when the results have been sent to TaleSpire
     */
    async function displayResults(resultGroups, rollId) {
        try {
            console.log(`Displaying results for roll ID: ${rollId}`);
            
            // Get roll info to know the roll type
            const rollInfo = trackedRollIds[rollId];
            const rollType = rollInfo ? rollInfo.type : null;
            
            // Ensure each result group has a name and description
            const namedResultGroups = resultGroups.map((group, index) => {
                // Preserve the group name if it exists
                let groupName = group.name || `Group ${index + 1}`;
                
                // Add suffix based on roll type if not already present
                switch (rollType) {
                    case rollTypes.advantage:
                        if (!groupName.endsWith(' (adv.)')) {
                            groupName += ' (adv.)';
                        }
                        break;
                    case rollTypes.disadvantage:
                        if (!groupName.endsWith(' (dis.)')) {
                            groupName += ' (dis.)';
                        }
                        break;
                    case rollTypes.bestofThree:
                        if (!groupName.endsWith(' (Bo3)')) {
                            groupName += ' (Bo3)';
                        }
                        break;
                    case rollTypes.critical:
                        if (!groupName.endsWith(' (Crit)')) {
                            groupName += ' (Crit)';
                        }
                        break;
                    default:
                        break;
                }
                
                return {
                    ...group,
                    name: groupName,
                    description: group.description || group.result.description || ''
                };
            });
            
            console.log('Named Result Groups:', JSON.stringify(namedResultGroups, null, 2));
            
            // Send the results to TaleSpire
            await TS.dice.sendDiceResult(namedResultGroups, rollId);
            console.log(`Results sent successfully for roll ${rollId}`);
        } catch (error) {
            console.error(`Error sending results for roll ${rollId}:`, error);
            throw error;
        }
    }

    // PUBLIC API //
    return {
        roll: roll,
        handleRollResult: handleRollResult,
    };
})();
