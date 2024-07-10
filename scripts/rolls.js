const rollsModule = (function () {
    /**
     * Executes a dice roll operation based on specified roll name and type.
     * 
     * This function performs the following steps:
     * 1. Collects dice data from the UI.
     * 2. Determines the roll type and critical hit behavior.
     * 3. Applies the "double-die-count" critical behavior if applicable.
     * 4. Prepares the dice roll for TaleSpire's dice tray.
     * 5. Initiates the roll in TaleSpire.
     * 
     * It handles normal rolls as well as various types of critical hits,
     * applying the appropriate behavior based on user settings.
     *
     * @param {string} rollNameParam - The name of the roll, used for display and logging purposes.
     * @param {string} rollTypeParam - The type of the roll (e.g., 'normal', 'critical'),
     *                                 which influences how the dice are rolled and processed.
     */
    function roll(rollNameParam, rollTypeParam) {
        let selectedType = rollTypeParam || rollTypes.normal; // Set to normal if no type is provided
        let updatedDiceGroupsData = []; // Empty the array to purge old data. We call this "updated" temporarily, but it will become the new diceGroupsData

        diceGroupsData.forEach((group, index) => {
            let groupId = index;
            let groupDiceCounts = {};
            diceTypes.forEach((type) => {
                const counter = document.getElementById(
                    `${groupId}-${type}-counter-value`
                );
                if (counter) {
                    groupDiceCounts[type] = counter.textContent;
                } else {
                    console.error(`Could not find counter for ${groupId}-${type}`);
                }
            });

            const modCounter = document.getElementById(
                `${groupId}-mod-counter-value`
            );
            if (modCounter) {
                groupDiceCounts["mod"] = modCounter.value;
            } else {
                console.error(`Could not find mod counter for ${groupId}`);
            }

            updatedDiceGroupsData.push(groupDiceCounts);
        });

        diceGroupsData = updatedDiceGroupsData; // Update the diceGroupsData with the new data

        let critBehavior = fetchSetting("crit-behavior"); // Fetch the critical behavior setting

        // Adjust for critical hit dice types
        if (selectedType === rollTypes.critical) {
            if (critBehavior === "double-die-count") {
                diceGroupsData = doubleDiceCounts(diceGroupsData);
            }
        } else {
            critBehavior = "none";
        }

        putDiceToRollIntoDiceTray(rollNameParam, selectedType, critBehavior);
    }

    /**
     * Prepares and sends a dice roll configuration to TaleSpire's dice tray.
     * 
     * This function performs the following steps:
     * 1. Builds a roll name based on the provided parameters.
     * 2. Constructs dice roll descriptors.
     * 3. Builds a dice tray configuration.
     * 4. Sends the configuration to TaleSpire's dice tray.
     * 5. Tracks the roll ID for future reference.
     * 
     * @param {string} rollNameParam - The base name for the roll.
     * @param {string} selectedType - The type of roll (e.g., 'normal', 'critical').
     * @param {string} critBehavior - The critical hit behavior to apply, if applicable.
     * 
     * @throws {Error} If there's an error creating roll descriptors.
     */
    function putDiceToRollIntoDiceTray(
        rollNameParam,
        selectedType,
        critBehavior
    ) {
        try {
            let rollName = buildRollName(
                rollNameParam,
                selectedType,
                critBehavior
            );
            let baseDiceDescriptors = constructDiceRollDescriptors(rollName);
            let trayConfiguration = buildDiceTrayConfiguration(
                baseDiceDescriptors,
                selectedType
            );

            TS.dice.putDiceInTray(trayConfiguration, true).then((rollId) => {
                trackedRollIds[rollId] = {
                    type: selectedType,
                    critBehavior: critBehavior,
                    createdByDiceVault: true
                };
            });
        } catch (error) {
            console.error("Error creating roll descriptors:", error);
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
     * Constructs a descriptive name for a roll based on provided parameters.
     * 
     * This function builds a roll name that includes:
     * 1. The base roll name (provided or from the UI)
     * 2. The roll type (e.g., "Advantage", "Disadvantage")
     * 3. Critical hit behavior, if applicable
     * 
     * It handles various critical hit behaviors, adding appropriate descriptions
     * to the roll name for each type of critical hit.
     *
     * @param {string} rollNameParam - The base name for the roll. If not provided,
     *                                 it attempts to use the value from the document's
     *                                 "roll-name" element.
     * @param {string} rollTypeParam - The type of the roll (e.g., "normal", "advantage",
     *                                 "disadvantage", "crit-dice").
     * @param {string} critBehaviorParam - The behavior of critical hits (e.g.,
     *                                     "double-die-count", "double-die-result",
     *                                     "double-total", "max-die", "max-plus").
     *
     * @returns {string} The constructed roll name, combining the base name, roll type,
     *                   and critical hit behavior (if applicable).
     */
    function buildRollName(rollNameParam, rollTypeParam, critBehaviorParam) {
        let rollName =
            rollNameParam ||
            document.getElementById("roll-name").value ||
            "Unnamed Roll";

        if (rollTypeParam !== "normal" && rollTypeParam !== "crit-dice") {
            rollName += "\n" + formatRollTypeName(rollTypeParam);
        }

        if (rollTypeParam === "crit-dice") {
            if (critBehaviorParam === "double-die-count") {
                rollName += "\nCrit! Double the Dice";
            }
            if (critBehaviorParam === "double-die-result") {
                rollName += "\nCrit! Double the Die Results";
            }
            if (critBehaviorParam === "double-total") {
                rollName += "\nCrit! Double the Total";
            }
            if (critBehaviorParam === "max-die") {
                rollName += "\nCrit! Maximize the Die";
            }
            if (critBehaviorParam === "max-plus") {
                rollName += "\nCrit! Maximize Die plus Die Result";
            }
        }

        return rollName;
    }

    /**
     * Formats the internal roll type name into a human-readable string.
     *
     * @param {string} rollType - The internal identifier for the roll type.
     *
     * @returns {string} The human-readable string representation of the roll type.
     */
    function formatRollTypeName(rollType) {
        const rollTypeMappings = {
            normal: "Normal",
            advantage: "Advantage",
            disadvantage: "Disadvantage",
            "best-of-three": "Best of Three",
        };

        return rollTypeMappings[rollType] || rollType;
    }

    /**
     * Constructs an array of dice roll descriptors based on the provided roll name
     * and dice groups data.
     *
     * This function iterates over each group of dice counts provided in the global
     * `diceGroupsData` array. For each group, it constructs a string representation
     * of the dice rolls, including the count and type of each die, and any modifiers.
     * These strings are then used to create objects that pair the provided roll name
     * with the constructed roll string.
     *
     * The function is designed to support the
     * [Talespire URL scheme](https://feedback.talespire.com/kb/article/talespire-url-scheme)
     * for dice rolls, allowing these descriptors to be used for generating URLs that
     * trigger specific dice rolls within the Talespire game.
     *
     * Example of a dice roll object in the returned array:
     * ```
     * {
     *     name: 'TEST',
     *     roll: '+1d4+1d6+5'
     * }
     * ```
     *
     * @param {string} rollName - The name to be associated with each dice roll descriptor.
     *
     * @returns {Array<Object>} An array of objects, each containing a `name` and a `roll`
     *                          string that describes the dice roll.
     */
    function constructDiceRollDescriptors(rollName) {
        // Create an empty array to store the dice roll objects
        let diceRollObjects = [];

        // Iterate over each dice group in the diceGroupsData array
        for (const groupDiceCounts of diceGroupsData) {
            let groupRollString = "";
            let formattedDiceGroup = [];

            for (const [die, count] of Object.entries(groupDiceCounts)) {
                if (die !== "mod" && count > 0) {
                    formattedDiceGroup.push(`${count}${die}`);
                    groupRollString = groupRollString + `+${count}${die}`;
                }
            }

            let modValue = parseInt(groupDiceCounts.mod, 10);

            if (modValue !== 0) {
                let modPart = modValue > 0 ? `+${modValue}` : `${modValue}`;
                groupRollString = groupRollString + modPart;
            }

            let rollObject = { name: rollName, roll: groupRollString };
            diceRollObjects.push(rollObject);
        }

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

    async function displayResults(resultGroups, rollId) {
        for (let resultGroup of resultGroups) {
            try {
                await TS.dice.sendDiceResult(resultGroup, rollId);  // Changed from resultGroups to resultGroup
                console.log(`Result group sent successfully for roll ${rollId}`);
            } catch (error) {
                console.error(`Error sending result group for roll ${rollId}:`, error);
                throw error;
            }
        }
    }

    /**
     * Retrieves and processes the reportable roll results group based on the roll type.
     *
     * This function handles the complexity of different roll types, ensuring that
     * the correct results are reported based on the game's rules for advantage,
     * disadvantage, and other special roll types. It performs the following:
     * 1. Determines the appropriate handling based on the roll type.
     * 2. For advantage, disadvantage, or best-of-three rolls, it calls specific
     *    handler functions to process the results accordingly.
     * 3. For normal rolls, it returns the original results.
     * 4. Ensures the return value is always an array of result groups.
     *
     * @param {Object} roll - The roll object containing the dice roll information.
     * @param {string} rollType - A string representing the type of roll (e.g., 'advantage',
     *                            'disadvantage', 'bestofThree', 'normal').
     *
     * @returns {Promise<Array<Object>>} A promise that resolves with an array of reportable
     *                                   roll results groups, processed according to the roll type.
     */
    async function getReportableRollResultsGroup(roll, rollType) {
        let resultGroups;

        switch (rollType) {
            case rollTypes.advantage:
                resultGroups = await handleAdvantageRoll(roll);
                break;

            case rollTypes.disadvantage:
                resultGroups = await handleDisadvantageRoll(roll);
                break;

            case rollTypes.bestofThree:
                resultGroups = await handleBestOfThreeRoll(roll);
                break;

            default:
                resultGroups = roll.resultsGroups;
        }

        // Ensure we always return an array, even if it's a single group
        return Array.isArray(resultGroups) ? resultGroups : [resultGroups];
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

        let setWithHighestSum = [];
        let setWithLowestSum = [];

        if (sumOfFirstSet >= sumOfSecondSet) {
            setWithHighestSum = firstSetOfGroups;
            setWithLowestSum = secondSetOfGroups;
        } else {
            setWithHighestSum = secondSetOfGroups;
            setWithLowestSum = firstSetOfGroups;
        }

        if (isAdvantage == true) {
            return setWithHighestSum;
        }

        return setWithLowestSum;
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
        return resultGroups.map(group => {
            if (critBehavior === "double-total") {
                return {
                    ...group,
                    result: doubleTotal(group.result)
                };
            } else if (critBehavior === "double-die-result") {
                return {
                    ...group,
                    result: doubleDiceResults(group.result)
                };
            } else if (critBehavior === "max-die") {
                return {
                    ...group,
                    result: maximizeDice(group.result)
                };
            } else if (critBehavior === "max-plus") {
                return {
                    ...group,
                    result: maxPlusDice(group.result)
                };
            }
            return group;
        });
    }
    
    function doubleTotal(result) {
        if (result.operator && result.operands) {
            return {
                ...result,
                operands: result.operands.map(doubleTotal),
                total: (result.total || 0) * 2,
                description: `Critical Hit! All values doubled`
            };
        } else if (result.results) {
            return {
                ...result,
                results: result.results.map(val => val * 2),
                total: (result.total || 0) * 2
            };
        } else if (result.value !== undefined) {
            return {
                ...result,
                value: result.value * 2
            };
        }
        return result;
    }
    
    function doubleDiceResults(result) {
        if (result.operator && result.operands) {
            return {
                ...result,
                operands: result.operands.map(doubleDiceResults),
                total: calculateTotal(result),
                description: `Critical Hit! Dice results doubled`
            };
        } else if (result.results) {
            return {
                ...result,
                results: result.results.map(val => val * 2),
                total: result.results.reduce((sum, val) => sum + val * 2, 0)
            };
        }
        return result;
    }
    
    function maximizeDice(result) {
        if (result.operator && result.operands) {
            return {
                ...result,
                operands: result.operands.map(maximizeDice),
                total: calculateTotal(result),
                description: `Critical Hit! Dice results maximized`
            };
        } else if (result.kind && result.results) {
            const maxValue = parseInt(result.kind.substring(1), 10);
            return {
                ...result,
                results: result.results.map(() => maxValue),
                total: maxValue * result.results.length
            };
        }
        return result;
    }
    
    function maxPlusDice(result) {
        if (result.operator && result.operands) {
            return {
                ...result,
                operands: result.operands.map(maxPlusDice),
                total: calculateTotal(result),
                description: `Critical Hit! Max die value added for each die`
            };
        } else if (result.kind && result.results) {
            const maxValue = parseInt(result.kind.substring(1), 10);
            const newResults = [...result.results, ...result.results.map(() => maxValue)];
            return {
                ...result,
                results: newResults,
                total: newResults.reduce((sum, val) => sum + val, 0)
            };
        }
        return result;
    }
    
    function calculateTotal(result) {
        if (result.operator && result.operands) {
            return result.operands.reduce((sum, operand) => sum + calculateTotal(operand), 0);
        } else if (result.results) {
            return result.results.reduce((sum, val) => sum + val, 0);
        } else if (result.value !== undefined) {
            return result.value;
        }
        return 0;
    }

    /**
     * Recursively calculates the total value of a dice roll result, including nested structures.
     * 
     * This function handles complex dice roll structures with multiple operators and operands.
     * It recursively processes nested operands, summing up all dice results and static values.
     * 
     * @param {Object} result - The dice roll result object to calculate.
     *                          This can be a nested structure with operators and operands,
     *                          or a simple object with dice results or a static value.
     * 
     * @returns {number} The total calculated value of the dice roll result.
     */
    function calculateTotal(result) {
        if (result.operator && result.operands) {
            return result.operands.reduce((sum, operand) => sum + calculateTotal(operand), 0);
        } else if (result.results) {
            return result.results.reduce((sum, val) => sum + val, 0);
        } else if (result.value !== undefined) {
            return result.value;
        }
        return 0;
    }

    /**
     * Asynchronously sends dice roll results to the TaleSpire game interface.
     * 
     * This function is responsible for communicating the results of dice rolls to Talespire.
     * It can handle multiple result groups, sending each group individually to TaleSpire.
     * If any send operation fails, an error is logged and thrown.
     * 
     * @param {Array<Object>} resultGroups - An array of objects, each containing dice roll results to be sent.
     * @param {string} rollId - A unique identifier for the roll, used to track the results within TaleSpire.
     * 
     * @returns {Promise<void>} A promise that resolves when all dice results have been successfully sent,
     *                          or rejects if an error occurs during the process.
     * @throws {Error} If there's an error sending any of the result groups.
     */
    async function displayResults(resultGroups, rollId) {
        try {
            await TS.dice.sendDiceResult(resultGroups, rollId);
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
