let trackedRollIds = {};

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

    // TODO: CONSIDER MOVING THIS TO A SEPARATE FUNCTION
    // buildCritBehavior();
    // return critBehavior;
    let critBehavior = fetchSetting("crit-behavior"); // Fetch the critical behavior setting

    // Adjust for critical hit dice types
    if (selectedType === rollTypes.critical) {
        if (critBehavior === "double-die-count") {
            diceCounts = doubleDieCountsForGroups(group); // TODO: This doesn't work. Hasn't been implemented yet.
        }
        selectedType = rollTypes.normal; // Reset to normal type after handling critical dice
    } else {
        critBehavior = "none";
    }

    let rollName = buildRollName(rollNameParam, selectedType, critBehavior);

    // TODO: CONSIDER MOVING THIS TO A SEPARATE FUNCTION
    // buildDiceRollObject();
    // return diceRollObjects;
    // Construct the dice roll string from the dice groups
    let diceRollString = constructDiceRollString(rollName);

    try {
        // Create the roll object and descriptors then put the dice in the tray
        let rollCount = getRollCount(selectedType);

        // ORIG: let trayConfiguration = Array(rollCount).fill(rollObject);
        let trayConfiguration = diceRollString; // Set the tray configuration to the dice roll objects

        // Put dice in tray and handle the response
        // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#calls/dice/putdiceintray
        TS.dice.putDiceInTray(trayConfiguration, true).then((rollId) => {
            // Track the rolled dice IDs with their type and critical behavior
            trackedRollIds[rollId] = {
                type: selectedType,
                critBehavior: critBehavior,
                numberOfGroups: diceGroupsData.length,
            };
        });
    } catch (error) {
        // Log any errors encountered during roll descriptor creation
        console.error("Error creating roll descriptors:", error);
    }
}

/** Determine the number of times the dice need to be rolled based on the selected type. */
function getRollCount(rollType) {
    switch (rollType) {
        case rollTypes.advantage:
        case rollTypes.disadvantage: // Fall-through case. Roll 2 times, keep the highest or lowest result
            return 2;

        case rollTypes.bestofThree:
            return 3; // Roll 3 times, keep the highest result

        default:
            return 1; // Roll one time, keep the result
    }
}

// SORTED IN THEIR ORDER OF EXECUTION ABOVE
// ----------------------------
// function buildDiceGroupsData() {
// }

// function buildCritBehavior() {
// }

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

function formatRollTypeName(rollType) {
    const rollTypeMappings = {
        normal: "Normal",
        advantage: "Advantage",
        disadvantage: "Disadvantage",
        "best-of-three": "Best of Three",
    };
    return rollTypeMappings[rollType] || rollType;
}

// function buildDiceRollObject() {
// }

function constructDiceRollString(rollName) {
    // https://feedback.talespire.com/kb/article/talespire-url-scheme
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

    // Return the array of dice roll objects
    return diceRollObjects;
}

// Doesn't handle any non-normal roll types
async function handleRollResult(rollEvent) {
    // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#subscriptions/dice/onrollresults
    // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollresults

    if (trackedRollIds[rollEvent.payload.rollId] == undefined) {
        return;
    }

    let roll = rollEvent.payload;
    let finalResults = [];
    let resultGroups = [];

    if (rollEvent.kind == "rollResults") {
        if (roll.resultsGroups != undefined) {
            let rollInfo = trackedRollIds[roll.rollId];
            if (
                rollInfo.type == rollTypes.advantage ||
                rollInfo.type == rollTypes.bestofThree
            ) {
                //---ADVANTAGE ROLLS---//
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(
                        group
                    );
                    finalResults.push(groupSum);
                    resultGroups.push(group);
                }
                let max = Math.max(...finalResults);
                let maxIndex = finalResults.indexOf(max);
                finalResult = max;
                resultGroup = resultGroups[maxIndex];
            } else if (rollInfo.type == rollTypes.disadvantage) {
                //---DISADVANTAGE ROLLS---//
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(
                        group
                    );
                    finalResults.push(groupSum);
                    resultGroups.push(group);
                }
                let min = Math.min(...finalResults);
                let minIndex = finalResults.indexOf(min);
                finalResult = min;
                resultGroup = resultGroups[minIndex];
            } else {
                //---NORMAL ROLLS---//
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(
                        group
                    );
                    finalResults.push(groupSum);
                    resultGroups.push(group);
                }
                finalResult = finalResults.reduce(
                    (sum, value) => sum + value,
                    0
                );
                resultGroup = [].concat(...resultGroups);
            }

            if (rollInfo.critBehavior === "double-total") {
                resultGroup = doubleDiceResults(resultGroup);
                resultGroup = doubleModifier(resultGroup);
            } else if (rollInfo.critBehavior === "double-die-result") {
                resultGroup = doubleDiceResults(resultGroup);
            } else if (rollInfo.critBehavior === "max-die") {
                resultGroup = maximizeDiceResults(resultGroup);
            } else if (rollInfo.critBehavior === "max-plus") {
                resultGroup = addMaxDieForEachKind(resultGroup);
            }
        }

        displayResult(resultGroup, roll.rollId);
    } else if (rollEvent.kind == "rollRemoved") {
        delete trackedRollIds[rollEvent.payload.rollId];
    }
}

// Doesn't handle any non-normal roll types
async function displayResult(resultGroup, rollId) {
    TS.dice
        .sendDiceResult(resultGroup, rollId)
        .catch((response) =>
            console.error("error in sending dice result", response)
        );
}
