const rollsModule = (function () {
    /**
     * Executes a dice roll operation based on specified roll name and type.
     * Places the dice to roll into TaleSpire's dice tray for displaying and
     * rolling in the game.
     *
     * @param {string} rollNameParam - The name of the roll, which may be used for
     *                                 display or logging purposes.
     * @param {string} rollTypeParam - The type of the roll (e.g., 'normal', 'critical'),
     *                                 which influences how the dice are rolled.
     */
    function roll(rollNameParam, rollTypeParam) {
        let selectedType = rollTypeParam || rollTypes.normal; // Set to normal if no type is provided
        let updatedDiceGroupsData = []; // Empty the array to purge old data. We call this "updated" temporarily, but it will become the new diceGroupsData

        // TODO: CONSIDER MOVING THIS TO A SEPARATE FUNCTION
        // buildDiceGroupsData(diceGroupsData);
        // return updatedDiceGroupsData;
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
                    console.error(
                        `Could not find counter for ${groupId}-${type}`
                    );
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

        // TODO: CONSIDER MOVING THIS TO A SEPARATE FUNCTION
        // buildCritBehavior();
        // return critBehavior;
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
     * Constructs a descriptive name for a roll based on provided parameters and
     * optional document elements.
     *
     * @param {string} rollNameParam - The base name for the roll. If not provided,
     *                                 attempts to use the value from the document's
     *                                 "roll-name" element.
     * @param {string} rollTypeParam - The type of the roll (e.g., "normal", "advantage",
     *                                 "disadvantage", "crit-dice").
     * @param {string} critBehaviorParam - The behavior of critical hits (e.g.,
     *                                     "double-die-count", "double-die-result",
     *                                     "double-total", "max-die", "max-plus").
     *
     * @returns {string} The constructed roll name, combining the base name, roll type,
     *                   and critical hit behavior.
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
     * [onRollResults handler](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#subscriptions/dice/onrollresults)
     *
     * @param {Object} rollEvent - An object representing a roll event, containing a
     *                             payload with the roll ID and other relevant information.
     *
     * @returns {Promise<void>} A promise that resolves once the roll event has been processed.
     */
    async function handleRollResult(rollEvent) {
        if (trackedRollIds[rollEvent.payload.rollId] == undefined) {
            console.error(
                `Tracked Roll for ID \"${rollEvent.payload.rollId}\" not found.`
            );
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
     * [rollResults event](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollresults)
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
                console.log('Critical Behavior:', rollInfo.critBehavior);
    
                try {
                    resultGroups = await getReportableRollResultsGroup(
                        roll,
                        rollInfo.type
                    );
    
                    console.log('Before applying crit behavior:', JSON.stringify(resultGroups, null, 2));
    
                    resultGroups = applyCritBehaviorToRollResultsGroup(
                        resultGroups,
                        rollInfo.critBehavior
                    );
    
                    console.log('After applying crit behavior:', JSON.stringify(resultGroups, null, 2));
    
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
     * Retrieves the reportable roll results group based on the roll and roll type.
     *
     * This function is designed to handle the complexity of different roll types in games,
     * ensuring that the correct results are reported based on the Symbiotes's rules for
     * advantage, disadvantage, and other roll types.
     *
     * @param {Object} roll - The roll object containing the dice roll information.
     * @param {string} rollType - A string representing the type of roll (e.g., 'advantage',
     *                            'disadvantage', 'bestofThree').
     *
     * @returns {Promise<Object>} A promise that resolves with the reportable roll
     *                            results group.
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
     * Applies critical hit behavior to a group of roll results.
     *
     * This function modifies the given roll results group based on the specified
     * critical hit behavior. The critical hit behaviors include:
     * - "double-total": Doubles both the dice results and any modifiers in the results group.
     * - "double-die-result": Doubles the dice results in the results group.
     * - "max-die": Maximizes the dice results in the results group, setting each die to its maximum possible value.
     * - "max-plus": Adds the maximum possible value of each die type to the results group.
     *
     * The function returns a new results group object with the applied modifications
     *
     * @param {Object} resultGroup - The original group of roll results to be modified.
     * @param {string} critBehavior - A string indicating the type of critical hit behavior
     *                                to apply to the roll results.
     *
     * @returns {Object} The modified group of roll results with the critical hit behavior
     *                   applied.
     */
    function applyCritBehaviorToRollResultsGroup(resultGroups, critBehavior) {
        console.log('Applying crit behavior:', critBehavior);
        console.log('Initial result groups:', JSON.stringify(resultGroups, null, 2));
    
        return resultGroups.map(group => {
            if (critBehavior === "double-total") {
                let total = 0;
                let doubledOperands = [];
    
                if (group.result.operands) {
                    doubledOperands = group.result.operands.map(operand => {
                        if (operand.results) {
                            let doubledResults = operand.results.map(val => val * 2);
                            total += doubledResults.reduce((sum, val) => sum + val, 0);
                            return {...operand, results: doubledResults};
                        } else if (operand.value !== undefined) {
                            let doubledValue = operand.value * 2;
                            total += doubledValue;
                            return {...operand, value: doubledValue};
                        }
                        return operand;
                    });
                }
    
                console.log('Doubled total:', total);
    
                return {
                    ...group,
                    result: {
                        ...group.result,
                        operands: doubledOperands,
                        total: total,
                        description: `Critical Hit! All values doubled`
                    }
                };
            } else if (critBehavior === "double-die-result") {
                let total = 0;
                let doubledOperands = [];
    
                if (group.result.operands) {
                    doubledOperands = group.result.operands.map(operand => {
                        if (operand.results) {
                            let doubledResults = operand.results.map(val => val * 2);
                            total += doubledResults.reduce((sum, val) => sum + val, 0);
                            return {...operand, results: doubledResults};
                        } else if (operand.value !== undefined) {
                            // Don't double the modifier
                            total += operand.value;
                            return operand;
                        }
                        return operand;
                    });
                }
                console.log('Double die result total:', total);

                return {
                    ...group,
                    result: {
                        ...group.result,
                        operands: doubledOperands,
                        total: total,
                        description: `Critical Hit! Dice results doubled`
                    }
                };

            } else if (critBehavior === "max-die") {
                function maximizeDice(operand) {
                    if (operand.operator && operand.operands) {
                        return {
                            ...operand,
                            operands: operand.operands.map(maximizeDice)
                        };
                    } else if (operand.kind && operand.results) {
                        let maxValue = parseInt(operand.kind.substring(1), 10);
                        return {
                            ...operand,
                            results: operand.results.map(() => maxValue)
                        };
                    }
                    return operand;
                }
            
                let maximizedResult = maximizeDice(group.result);
                let total = calculateTotal(maximizedResult);
            
                console.log('Maximized die total:', total);
            
                return {
                    ...group,
                    result: {
                        ...maximizedResult,
                        total: total,
                        description: `Critical Hit! Dice results maximized`
                    }
                };
            } else if (critBehavior === "max-plus") {
                function maxPlusDice(operand) {
                    if (operand.operator && operand.operands) {
                        return {
                            ...operand,
                            operands: operand.operands.map(maxPlusDice)
                        };
                    } else if (operand.kind && operand.results) {
                        let maxValue = parseInt(operand.kind.substring(1), 10);
                        let newResults = [...operand.results, ...new Array(operand.results.length).fill(maxValue)];
                        return {
                            ...operand,
                            results: newResults
                        };
                    }
                    return operand;
                }

                let maxPlusResult = maxPlusDice(group.result);
                let total = calculateTotal(maxPlusResult);

                console.log('Max plus total:', total);

                return {
                    ...group,
                    result: {
                        ...maxPlusResult,
                        total: total,
                        description: `Critical Hit! Max die value added for each die`
                    }
                };
            }

            return group;
        });
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
     * Asynchronously sends a dice roll result to the TaleSpire game interface.
     *
     * This function is responsible for communicating the result of a dice roll,
     * encapsulated within `resultGroup`, to the Talespire game via the `TS.dice.sendDiceResult`
     * method. It uses the `rollId` to associate the result with a specific roll.
     * If the operation fails, an error message is logged to the console detailing
     * the failure.
     *
     * @param {Object} resultGroup - An object containing the dice roll results to be sent.
     * @param {string} rollId - A unique identifier for the roll, used to track the result
     *                          within the Talespire game.
     *
     * @returns {Promise<void>} A promise that resolves when the dice result has been
     *                          successfully sent or logs an error upon failure.
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
