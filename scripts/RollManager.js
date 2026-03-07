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

        /**
         * If no groupsData provided, extract current UI state to build diceGroupsData
         */
        if (updatedDiceGroupsData.length === 0) {
            // If no groupsData provided, use the current UI state from diceGroupManager
            // This ensures we get all properties including groupType (important for duality)
            // IMPORTANT: Create a deep copy to prevent mutations from affecting the original data
            const originalData = diceGroupManager.getDiceGroupsData();
            updatedDiceGroupsData = JSON.parse(JSON.stringify(originalData));
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
            uiManager.showError(`Cannot roll groups with only modifiers and no dice.\n\nGroups with this issue: ${groupNames}\n\nPlease add at least one die to these groups or set their modifier to 0.`, "Invalid Roll");
            return;
        }

        if (diceGroupsData.every(diceGroupManager.isDiceGroupEmpty.bind(diceGroupManager))) {
            console.warn("Attempted to roll with empty dice groups");
            uiManager.showError("No dice selected for rolling. Please add at least one die to a group before rolling.", "Invalid Roll");
            return;
        }
        let critBehavior = fetchSetting("crit-behavior");

        console.log("=== START OF ROLL FUNCTION ===");
        console.log("Initial diceGroupsData:", JSON.stringify(diceGroupsData, null, 2));
        console.log("Roll type:", selectedType);
        console.log("Crit behavior:", critBehavior);

        // Handle Duality Logic BEFORE applying critical behavior
        // This ensures duality groups are not affected by critical behaviors
        let dualityData = { isDuality: false, modifier: 0 };
        // Note: DiceGroupManager already splits duality groups into two entries (A and B)
        // We need to find all duality groups and replace them with Hope and Fear
        const dualityGroups = diceGroupsData.filter(g => g.groupType === 'duality');

        if (dualityGroups.length > 0) {
            // Get the first duality group to extract metadata
            const firstDualityGroup = dualityGroups[0];
            dualityData.isDuality = true;
            dualityData.modifier = firstDualityGroup.diceCounts.mod || 0;

            // Extract base name (remove " - A" or " - B" suffix if present)
            let baseName = firstDualityGroup.name || "Duality";
            baseName = baseName.replace(/ - [AB]$/, '');
            dualityData.name = baseName;

            // Create Hope and Fear groups
            const hopeGroup = {
                name: "Hope",
                diceCounts: { d12: 1, mod: 0 },
                groupType: "duality-part",
                isHope: true
            };

            const fearGroup = {
                name: "Fear",
                diceCounts: { d12: 1, mod: 0 },
                groupType: "duality-part",
                isHope: false
            };

            // Filter out ALL duality groups and add Hope and Fear
            // This handles the fact that DiceGroupManager creates two duality entries (A and B)
            const nonDualityGroups = diceGroupsData.filter(g => g.groupType !== 'duality');
            diceGroupsData = [
                ...nonDualityGroups,
                hopeGroup,
                fearGroup
            ];
        }

        console.log("After duality processing, diceGroupsData:", JSON.stringify(diceGroupsData, null, 2));
        console.log("Number of groups:", diceGroupsData.length);

        // Apply critical behavior AFTER duality processing
        // This ensures only non-duality groups are affected by critical behaviors
        if (selectedType === rollTypes.critical) {
            if (critBehavior === "double-die-count") {
                console.log("Before applying critical behavior:", JSON.stringify(diceGroupsData, null, 2));
                // doubleDiceCounts already has logic to skip duality groups
                diceGroupsData = doubleDiceCounts(diceGroupsData);
                console.log("After applying critical behavior:", JSON.stringify(diceGroupsData, null, 2));
            }
        } else {
            critBehavior = "none";
        }

        putDiceToRollIntoDiceTray(selectedType, critBehavior, dualityData);
    }

    /**
     * Sends dice to TaleSpire's dice tray for rolling.
     * 
     * This function constructs dice roll descriptors from the current dice groups
     * and sends them to TaleSpire's dice system for processing.
     *
     * @param {string} selectedType - The type of roll being performed
     * @param {string} critBehavior - The critical hit behavior to apply
     * @param {Object} dualityData - Data specific to duality rolls
     */
    function putDiceToRollIntoDiceTray(selectedType, critBehavior, dualityData = { isDuality: false }) {
        try {
            let baseDiceDescriptors = constructDiceRollDescriptors(selectedType);

            if (baseDiceDescriptors.length === 0) {
                console.warn("No dice to roll after filtering empty groups");
                uiManager.showError("No valid dice groups found for rolling. Please ensure at least one group has dice selected.", "Invalid Roll");
                return;
            }

            let trayConfiguration = buildDiceTrayConfiguration(baseDiceDescriptors, selectedType);

            TS.dice.putDiceInTray(trayConfiguration, true).then((rollId) => {
                trackedRollIds[rollId] = {
                    type: selectedType,
                    critBehavior: critBehavior,
                    createdByDiceVault: true,
                    dualityData: dualityData
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

                /**
                 * Only add the group if it has dice to roll
                 */
                if (hasDice && groupRollString) {
                    // Remove leading '+' if present
                    groupRollString = groupRollString.startsWith('+') ? groupRollString.slice(1) : groupRollString;

                    let groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;

                    // Add suffix based on roll type
                    // Skip adding suffix for duality groups as they have their own special handling
                    const isDualityGroup = group.groupType === 'duality' || group.groupType === 'duality-part';

                    console.log(`Processing group in constructDiceRollDescriptors: name="${groupName}", groupType="${group.groupType}", isDualityGroup=${isDualityGroup}, rollType="${rollType}"`);

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
                            if (!isDualityGroup) {
                                console.log(`Adding (Crit) suffix to non-duality group: ${groupName}`);
                                groupName += " (Crit)";
                            } else {
                                console.log(`Skipping (Crit) suffix for duality group: ${groupName}`);
                            }
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
     * rolls collection. If the removed roll is part of an explosion chain,
     * cleans up the entire chain.
     *
     * [rollRemoved event](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollremoved)
     *
     * @param {Object} rollEvent - An object representing a roll removal
     *                             event, containing the payload with the
     *                             roll ID to be removed.
     */
    function handleRollRemovedEvent(rollEvent) {
        const removedId = rollEvent.payload.rollId;

        // Check if this is a child explosion roll
        if (explosionChildToParent[removedId]) {
            const parentId = explosionChildToParent[removedId];
            console.log(`Explosion child roll ${removedId} removed, cleaning up chain for parent ${parentId}`);
            cleanupExplosionChain(parentId);
        }

        // Check if this is a parent with an active explosion chain
        if (activeExplosionChains[removedId]) {
            console.log(`Parent roll ${removedId} removed, cleaning up explosion chain`);
            cleanupExplosionChain(removedId);
        }

        delete trackedRollIds[removedId];
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

        /**
         * Ensure the roll contains result groups and retrieve roll info
         * If roll info found, process results based on roll type and crit behavior.
         * Otherwise, log a warning and exit
         */
        if (roll.resultsGroups != undefined) {
            let rollInfo = trackedRollIds[roll.rollId];
            if (rollInfo) {
                // Early return: if this is an explosion child roll, delegate to explosion handler
                if (rollInfo.isExplosionRoll) {
                    await handleExplosionRollResult(roll, rollInfo);
                    return;
                }

                try {
                    // Handle Duality Results
                    let isDualityRoll = rollInfo.dualityData && rollInfo.dualityData.isDuality;
                    if (isDualityRoll) {
                        console.log("Processing Duality Roll Results");

                        // Find Hope and Fear groups by name, not position
                        // This is important when there are also regular dice groups in the roll
                        let hopeGroup = null;
                        let fearGroup = null;
                        let otherGroups = [];

                        for (let group of roll.resultsGroups) {
                            // Check if name starts with "Hope" or "Fear" to handle cases where
                            // suffixes like "(Crit)" might have been added
                            if (group.name.startsWith("Hope")) {
                                hopeGroup = { ...group };
                            } else if (group.name.startsWith("Fear")) {
                                fearGroup = { ...group };
                            } else {
                                // This is a regular dice group, not part of duality
                                otherGroups.push(group);
                            }
                        }

                        if (hopeGroup && fearGroup) {
                            let hopeValue = await TS.dice.evaluateDiceResultsGroup(hopeGroup);
                            let fearValue = await TS.dice.evaluateDiceResultsGroup(fearGroup);
                            let modifier = rollInfo.dualityData.modifier;
                            let total = hopeValue + fearValue + modifier;

                            let outcome = hopeValue >= fearValue ? getTranslation("withHope") : getTranslation("withFear");

                            let resultDescription = `${total} ${rollInfo.dualityData.name} (${outcome})`;

                            if (hopeValue === fearValue) {
                                resultDescription = `Critical Success: ${resultDescription}`;
                            }

                            let winningGroup;
                            let otherValue;

                            if (hopeValue >= fearValue) {
                                winningGroup = hopeGroup;
                                otherValue = fearValue;
                            } else {
                                winningGroup = fearGroup;
                                otherValue = hopeValue;
                            }

                            // Update the result to include the other group's value and modifier
                            // This ensures the displayed dice bubble shows the full total
                            let operands = [winningGroup.result];

                            // Add the other die's value
                            operands.push({ value: otherValue });

                            // Add modifier if present
                            if (modifier !== 0) {
                                operands.push({ value: modifier });
                            }

                            winningGroup.result = {
                                operator: "+",
                                operands: operands,
                                total: total
                            };

                            winningGroup.name = resultDescription;

                            // Apply critical behavior to other (non-duality) groups
                            // This ensures regular dice groups get critical behavior even in duality rolls
                            if (otherGroups.length > 0 && rollInfo.critBehavior && rollInfo.critBehavior !== "none") {
                                console.log("Applying critical behavior to non-duality groups in duality roll");
                                otherGroups = applyCritBehaviorToRollResultsGroup(otherGroups, rollInfo.critBehavior);
                            }

                            // Check for exploding dice in non-duality groups only
                            // Duality dice (Hope/Fear) should never explode, but other dice in the roll can
                            const explodingEnabled = fetchSetting('enable-exploding-dice');
                            if (explodingEnabled && otherGroups.length > 0) {
                                const increaseSize = fetchSetting('increase-exploded-die-size');
                                const explosionData = checkForExplosions(otherGroups, increaseSize);
                                if (explosionData.hasExplosions) {
                                    console.log("Explosions detected in non-duality groups, starting explosion chain");
                                    startExplosionChain(roll.rollId, rollInfo, otherGroups, explosionData, [winningGroup]);
                                    return;
                                }
                            }

                            // Include both the duality result AND any other dice groups
                            // The duality groups are totalled together, but other groups remain separate
                            resultGroups = [winningGroup, ...otherGroups];
                        } else {
                            console.error("Duality roll missing groups");
                            resultGroups = roll.resultsGroups;
                        }
                    } else {
                        resultGroups = await getReportableRollResultsGroup(
                            roll,
                            rollInfo.type
                        );

                        // Check for exploding dice BEFORE applying crit behavior
                        const explodingEnabled = fetchSetting('enable-exploding-dice');
                        if (explodingEnabled) {
                            const increaseSize = fetchSetting('increase-exploded-die-size');
                            const explosionData = checkForExplosions(resultGroups, increaseSize);
                            if (explosionData.hasExplosions) {
                                console.log("Explosions detected, starting explosion chain");
                                startExplosionChain(roll.rollId, rollInfo, resultGroups, explosionData);
                                return;
                            }
                        }

                        resultGroups = applyCritBehaviorToRollResultsGroup(
                            resultGroups,
                            rollInfo.critBehavior
                        );
                    }

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
     * two equal sets and evaluates each group position independently. For each position,
     * it compares the corresponding group from set 1 vs set 2 and picks the winner
     * individually — meaning the final result may mix groups from both rolls. Under
     * advantage conditions, it picks the group with the higher sum at each position;
     * under disadvantage conditions, it picks the group with the lower sum.
     *
     * If the number of results groups is less than 2 or not even, it returns the
     * original results groups unchanged.
     *
     * @param {Object} roll             - An object representing a roll, which contains an array of
     *                                    results groups.
     * @param {boolean} isAdvantage     - A boolean indicating if the roll is under advantage (true)
     *                                    or disadvantage (false) conditions.
     *
     * @returns {Promise<Array>} A promise that resolves to an array of per-position winning
     *                           groups, each independently chosen for the highest sum (advantage)
     *                           or lowest sum (disadvantage).
     */
    async function handleAdvantageDisadvantageRoll(roll, isAdvantage) {
        if (
            roll.resultsGroups.length < 2 ||
            roll.resultsGroups.length % 2 != 0
        ) {
            return roll.resultsGroups;
        }

        let half = roll.resultsGroups.length / 2;
        let firstSetOfGroups = roll.resultsGroups.slice(0, half);
        let secondSetOfGroups = roll.resultsGroups.slice(half);

        let chosenGroups = [];

        for (let i = 0; i < half; i++) {
            let sumA = await TS.dice.evaluateDiceResultsGroup(firstSetOfGroups[i]);
            let sumB = await TS.dice.evaluateDiceResultsGroup(secondSetOfGroups[i]);

            let pickFirst = isAdvantage ? (sumA >= sumB) : (sumA <= sumB);
            chosenGroups.push(pickFirst ? firstSetOfGroups[i] : secondSetOfGroups[i]);
        }

        return chosenGroups;
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
            // Skip duality groups - they should not be affected by critical behaviors
            if (group.name === 'Hope' || group.name === 'Fear' ||
                (group.groupType && (group.groupType === 'duality' || group.groupType === 'duality-part'))) {
                console.log('Skipping critical behavior for duality group:', group.name);
                return group;
            }

            let modifiedResult;
            console.log('Processing group for crit behavior:', critBehavior, 'Group:', group);

            /**
             * Apply the specified critical hit behavior to the group's result
             * and return the modified result.
             */
            switch (critBehavior) {
                case "double-total":
                    modifiedResult = doubleTotal(group.result);
                    break;
                case "double-die-result":
                    console.log('Applying double-die-result to:', group.result);
                    modifiedResult = doubleResultsRecursive(group.result);
                    console.log('Result after doubling:', modifiedResult);
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

                /**
                 * Add suffix based on roll type
                 * (advantage, disadvantage, best-of-three, critical)
                 */
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
                        // Skip adding (Crit) to duality groups
                        // Duality groups have names like "10 dua (with Hope)" or "Critical Success: 10 dua (with Fear)"
                        const isDualityResult = groupName.includes('(with Hope)') || groupName.includes('(with Fear)');
                        if (!groupName.endsWith(' (Crit)') && !isDualityResult) {
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

    // ========== EXPLODING DICE FUNCTIONS ==========

    /**
     * Returns the maximum value for a given die type string (e.g., "d6" -> 6).
     *
     * @param {string} dieKind - The die type string (e.g., "d4", "d6", "d20")
     * @returns {number} The maximum face value of the die
     */
    function getDieMaxValue(dieKind) {
        return parseInt(dieKind.substring(1), 10);
    }

    /**
     * Returns the stepped-up die type for the "Escalating Explosions" setting.
     *
     * @param {string} dieType - The current die type (e.g., "d6")
     * @returns {string} The next larger die type, or the same type if at max (d20)
     */
    function getSteppedUpDieType(dieType) {
        return dieStepUpMap[dieType] || dieType;
    }

    /**
     * Inspects result groups for dice that rolled their maximum value (explosions).
     * Recursively walks TaleSpire result trees to find dice nodes where any
     * individual result equals the die's max face value.
     *
     * d100 (percentile) dice are excluded from explosion detection.
     *
     * @param {Array<Object>} resultGroups - The TaleSpire result groups to inspect
     * @param {boolean} increaseSize - Whether to step up die size for re-rolls
     * @returns {Object} { hasExplosions: bool, explosionDescriptors: [{groupIndex, groupName, diceToReroll: {d6: 2, ...}}] }
     */
    function checkForExplosions(resultGroups, increaseSize) {
        const explosionDescriptors = [];

        resultGroups.forEach((group, groupIndex) => {
            const diceToReroll = {};

            /**
             * Recursively walk a result node looking for die-kind nodes
             * where individual results equal the die's max value.
             */
            function walkResult(node) {
                if (node.kind && Array.isArray(node.results)) {
                    // Skip d100 -- percentile dice don't explode
                    if (node.kind === "d100") return;

                    const maxVal = getDieMaxValue(node.kind);
                    const explodedCount = node.results.filter(r => r === maxVal).length;

                    if (explodedCount > 0) {
                        const rerollDie = increaseSize ? getSteppedUpDieType(node.kind) : node.kind;
                        diceToReroll[rerollDie] = (diceToReroll[rerollDie] || 0) + explodedCount;
                    }
                } else if (node.operator && Array.isArray(node.operands)) {
                    node.operands.forEach(walkResult);
                }
                // Plain value nodes (modifiers) are ignored
            }

            if (group.result) {
                walkResult(group.result);
            }

            if (Object.keys(diceToReroll).length > 0) {
                explosionDescriptors.push({
                    groupIndex: groupIndex,
                    groupName: group.name || `Group ${groupIndex + 1}`,
                    diceToReroll: diceToReroll
                });
            }
        });

        return {
            hasExplosions: explosionDescriptors.length > 0,
            explosionDescriptors: explosionDescriptors
        };
    }

    /**
     * Converts explosion data into TaleSpire tray config format for re-rolling.
     * No modifiers are included in explosion re-rolls. The group name includes
     * the explosion round number for clarity.
     *
     * @param {Object} explosionData - Output from checkForExplosions()
     * @param {number} explosionRound - The current explosion round number
     * @returns {Array<Object>} TaleSpire dice tray descriptors [{name, roll}]
     */
    function buildExplosionDiceDescriptors(explosionData, explosionRound) {
        const descriptors = [];

        explosionData.explosionDescriptors.forEach(desc => {
            let rollString = "";
            for (const [dieType, count] of Object.entries(desc.diceToReroll)) {
                if (rollString.length > 0) rollString += "+";
                rollString += `${count}${dieType}`;
            }

            descriptors.push({
                name: `${desc.groupName} (Explode #${explosionRound})`,
                roll: rollString
            });
        });

        return descriptors;
    }

    /**
     * Creates a new explosion chain entry and initiates the first re-roll.
     * The chain stores all metadata needed to accumulate results across
     * multiple explosion rounds and finalize the combined result.
     *
     * @param {string} parentRollId - The rollId of the original (parent) roll
     * @param {Object} rollInfo - The tracked roll info for the parent roll
     * @param {Array<Object>} resultGroups - The result groups from the parent roll
     * @param {Object} explosionData - Output from checkForExplosions()
     */
    function startExplosionChain(parentRollId, rollInfo, resultGroups, explosionData, prependedGroups = []) {
        activeExplosionChains[parentRollId] = {
            parentRollId: parentRollId,
            rollType: rollInfo.type,
            critBehavior: rollInfo.critBehavior,
            dualityData: rollInfo.dualityData,
            explosionRound: 1,
            maxExplosionDepth: 100,
            accumulatedResultGroups: [resultGroups],
            pendingExplosionData: explosionData,
            increaseSize: fetchSetting('increase-exploded-die-size'),
            prependedGroups: prependedGroups
        };

        console.log(`Starting explosion chain for parent roll ${parentRollId}, round 1`);
        initiateExplosionReroll(parentRollId);
    }

    /**
     * Sends the explosion re-roll dice to TaleSpire's tray and tracks
     * the child rollId so its results can be routed back to the chain.
     *
     * @param {string} parentRollId - The parent rollId that owns this chain
     */
    async function initiateExplosionReroll(parentRollId) {
        const chain = activeExplosionChains[parentRollId];
        if (!chain) {
            console.error(`No explosion chain found for parent ${parentRollId}`);
            return;
        }

        const descriptors = buildExplosionDiceDescriptors(
            chain.pendingExplosionData,
            chain.explosionRound
        );

        console.log(`Explosion round ${chain.explosionRound}: putting dice in tray`, descriptors);

        const childRollId = await TS.dice.putDiceInTray(descriptors, true);
        trackedRollIds[childRollId] = {
            type: chain.rollType,
            critBehavior: chain.critBehavior,
            createdByDiceVault: true,
            dualityData: chain.dualityData,
            isExplosionRoll: true,
            parentRollId: parentRollId
        };
        explosionChildToParent[childRollId] = parentRollId;
        console.log(`Explosion child roll ${childRollId} mapped to parent ${parentRollId}`);

        await showExplosionWaitingModal(parentRollId);
    }

    /**
     * Shows a modal while the user is resolving explosion dice in TaleSpire.
     * Displays the current accumulated total and an Abort button.
     *
     * @param {string} parentRollId - The parent rollId that owns this chain
     */
    async function showExplosionWaitingModal(parentRollId) {
        hideExplosionWaitingModal();

        const chain = activeExplosionChains[parentRollId];
        if (!chain) return;

        let total = '—';
        try {
            const combined = combineExplosionResults(chain.accumulatedResultGroups);
            const allGroups = [...(chain.prependedGroups || []), ...combined];
            total = await getSumOfRollResultsGroups(allGroups);
        } catch (e) {
            console.warn('Could not calculate explosion running total:', e);
        }

        uiManager.showOverlay(true);

        const modal = document.createElement('div');
        modal.id = 'explosion-waiting-modal';
        modal.style.position = 'fixed';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#1e2d3d';
        modal.style.padding = '20px';
        modal.style.border = '4px solid var(--ts-accessibility-border)';
        modal.style.zIndex = '1000';
        modal.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6)';
        modal.style.borderRadius = '4px';
        modal.style.color = 'var(--ts-color-primary)';
        modal.style.textAlign = 'center';
        modal.style.minWidth = '240px';
        modal.innerHTML = `
            <h3 style="margin-top:0">${getTranslation('explosionTitle')}</h3>
            <p style="margin:8px 0">${getTranslation('explosionInstruction')}</p>
            <p style="margin:8px 0;font-size:1.1em">${getTranslation('explosionRunningTotal')} <strong>${total}</strong></p>
            <div style="margin-top:16px">
                <button id="abort-explosion-btn" class="black-button">${getTranslation('explosionAbort')}</button>
            </div>
        `;
        document.body.appendChild(modal);
        explosionWaitingModal = modal;

        document.getElementById('abort-explosion-btn').addEventListener('click', () => {
            abortExplosionChain(parentRollId);
        });
    }

    /**
     * Removes the explosion waiting modal and its overlay.
     */
    function hideExplosionWaitingModal() {
        if (explosionWaitingModal) {
            explosionWaitingModal.remove();
            explosionWaitingModal = null;
            uiManager.showOverlay(false);
        }
    }

    /**
     * Aborts the explosion chain, discarding any pending explosion round and
     * reporting results based on what has been accumulated so far.
     *
     * @param {string} parentRollId - The parent rollId of the chain to abort
     */
    async function abortExplosionChain(parentRollId) {
        hideExplosionWaitingModal();

        const chain = activeExplosionChains[parentRollId];
        if (!chain) return;

        // Remove child roll tracking so incoming results (if any) are ignored
        for (const [childId, pId] of Object.entries(explosionChildToParent)) {
            if (pId === parentRollId) {
                delete trackedRollIds[childId];
                delete explosionChildToParent[childId];
            }
        }

        console.log(`Explosion chain aborted for parent ${parentRollId}, finalizing with accumulated results`);
        await finalizeExplosionChain(parentRollId);
    }

    /**
     * Handles the result of an explosion child roll. Accumulates results,
     * checks for further explosions, and either continues the chain or
     * finalizes it.
     *
     * @param {Object} roll - The roll payload from TaleSpire
     * @param {Object} rollInfo - The tracked roll info for this child roll
     */
    async function handleExplosionRollResult(roll, rollInfo) {
        // Dismiss the waiting modal now that results have arrived
        hideExplosionWaitingModal();

        const parentRollId = rollInfo.parentRollId;
        const chain = activeExplosionChains[parentRollId];

        if (!chain) {
            console.error(`Explosion chain not found for parent ${parentRollId}`);
            return;
        }

        // Clean up the child mapping
        delete explosionChildToParent[roll.rollId];

        // Accumulate this round's results
        chain.accumulatedResultGroups.push(roll.resultsGroups);
        chain.explosionRound++;

        console.log(`Explosion round ${chain.explosionRound - 1} results received. Checking for more explosions...`);

        // Check for further explosions in this round's results
        const explosionData = checkForExplosions(roll.resultsGroups, chain.increaseSize);

        if (explosionData.hasExplosions && chain.explosionRound <= chain.maxExplosionDepth) {
            // More explosions -- continue the chain
            chain.pendingExplosionData = explosionData;
            console.log(`More explosions detected, continuing chain (round ${chain.explosionRound})`);
            initiateExplosionReroll(parentRollId);
        } else {
            // No more explosions or safety cap hit
            if (chain.explosionRound > chain.maxExplosionDepth) {
                console.warn(`Explosion chain hit safety cap of ${chain.maxExplosionDepth} rounds`);
            }
            console.log(`Explosion chain complete after ${chain.explosionRound - 1} rounds, finalizing...`);
            await finalizeExplosionChain(parentRollId);
        }
    }

    /**
     * Combines all accumulated explosion round results into a single set of
     * result groups, applies critical behavior, and sends the final result
     * to TaleSpire for display.
     *
     * @param {string} parentRollId - The parent rollId that owns this chain
     */
    async function finalizeExplosionChain(parentRollId) {
        const chain = activeExplosionChains[parentRollId];
        if (!chain) {
            console.error(`Cannot finalize: no chain found for ${parentRollId}`);
            return;
        }

        try {
            const combinedResults = combineExplosionResults(chain.accumulatedResultGroups);

            // Apply critical behavior after all explosions resolve
            const finalResults = applyCritBehaviorToRollResultsGroup(
                combinedResults,
                chain.critBehavior
            );

            // Prepend pre-processed groups (e.g., duality result) before displaying
            const displayGroups = [...(chain.prependedGroups || []), ...finalResults];
            await displayResults(displayGroups, parentRollId);
            console.log(`Explosion chain finalized for parent roll ${parentRollId}`);
        } catch (error) {
            console.error(`Error finalizing explosion chain for ${parentRollId}:`, error);
        } finally {
            // Clean up the chain
            delete activeExplosionChains[parentRollId];
        }
    }

    /**
     * Merges result groups from all explosion rounds into a single array.
     * Round 1 (the base roll) provides the groups with modifiers. Subsequent
     * rounds' results are appended as additional operands to the matching
     * group's result tree using the {operator: "+", operands: [...]} structure.
     *
     * If explosion rounds have fewer groups (e.g., only some groups exploded),
     * unmatched explosion groups are appended to the first base group.
     *
     * @param {Array<Array<Object>>} allRounds - Array of result group arrays, one per round
     * @returns {Array<Object>} Merged result groups with all rounds combined
     */
    function combineExplosionResults(allRounds) {
        if (allRounds.length === 0) return [];
        if (allRounds.length === 1) return allRounds[0];

        // Deep clone round 1 as the base
        const baseGroups = JSON.parse(JSON.stringify(allRounds[0]));

        // For each subsequent round, merge results into base groups
        for (let roundIdx = 1; roundIdx < allRounds.length; roundIdx++) {
            const roundGroups = allRounds[roundIdx];

            roundGroups.forEach((explosionGroup, i) => {
                // Try to match to the corresponding base group by index
                const targetGroup = i < baseGroups.length ? baseGroups[i] : baseGroups[0];

                if (targetGroup && targetGroup.result && explosionGroup.result) {
                    // Wrap in an addition node to combine base + explosion results
                    targetGroup.result = {
                        operator: "+",
                        operands: [targetGroup.result, explosionGroup.result]
                    };
                }
            });
        }

        return baseGroups;
    }

    /**
     * Cleans up an entire explosion chain, removing all tracked child rolls
     * and the chain entry itself.
     *
     * @param {string} parentRollId - The parent rollId of the chain to clean up
     */
    function cleanupExplosionChain(parentRollId) {
        // Remove any child->parent mappings that point to this chain
        for (const [childId, pId] of Object.entries(explosionChildToParent)) {
            if (pId === parentRollId) {
                delete trackedRollIds[childId];
                delete explosionChildToParent[childId];
            }
        }
        delete activeExplosionChains[parentRollId];
        hideExplosionWaitingModal();
        console.log(`Explosion chain cleaned up for parent ${parentRollId}`);
    }

    // PUBLIC API //
    return {
        roll: roll,
        handleRollResult: handleRollResult,
    };
})();
