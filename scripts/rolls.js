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
    //let diceDescriptors = constructDiceRollString(rollName);
    // Base roll object
    let diceDescriptors = [
        {
            name: "test-4-groups",
            roll: "+1d4+1d6",
        },
        {
            name: "test-4-groups",
            roll: "+1d4+1d6+100",
        },
    ];

    // Simulate adding copies of the same groups for advantage/disadvantage
    diceDescriptors.concat([
        {
            name: "test-4-groups",
            roll: "+1d4+1d6",
        },
        {
            name: "test-4-groups",
            roll: "+1d4+1d6+100",
        },
    ]);

    try {
        // Create the roll object and descriptors then put the dice in the tray
        let rollCount = getRollCount(selectedType);

        // ORIG: let trayConfiguration = Array(rollCount).fill(rollObject);
        let trayConfiguration = diceDescriptors; // Set the tray configuration to the dice roll objects

        // Put dice in tray and handle the response
        // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#calls/dice/putdiceintray
        TS.dice.putDiceInTray(trayConfiguration, true).then((rollId) => {
            // Track the rolled dice IDs with their type and critical behavior
            trackedRollIds[rollId] = {
                type: selectedType, //rollTypes.advantage, //selectedType,
                critBehavior: critBehavior,
                numberOfGroups: 2, //diceGroupsData.length,
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
    // [
    //     {name: 'TEST-2-Groups', roll: '+1d4'},
    //     {name: 'TEST-2-Groups', roll: '+1d6+100'},
    //     ...
    // ]

    return diceRollObjects;
}

// Doesn't handle any non-normal roll types
async function handleRollResult(rollEvent) {
    // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#subscriptions/dice/onrollresults
    // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollresults

    // Roll Descriptor Array
    /*
    [
        {
            "name": "test-4-groups",
            "roll": "+1d4+1d6"
        },
        {
            "name": "test-4-groups",
            "roll": "+1d4+1d6+50"
        },
        {
            "name": "test-4-groups",
            "roll": "+1d6+1d8+100"
        },
        {
            "name": "test-4-groups",
            "roll": "+1d8+1d10+200"
        }
    ]
    */

    // Roll Event
    /*
    {
        "kind": "rollResults",
        "payload": {
            "rollId": "17179869185",
            "clientId": "e0a85890-68af-4cc2-b55b-e11d12b89889",
            "resultsGroups": [
                {
                    "name": "test-4-groups",
                    "result": {
                        "operator": "+",
                        "operands": [
                            {
                                "kind": "d4",
                                "results": [
                                    3
                                ]
                            },
                            {
                                "kind": "d6",
                                "results": [
                                    4
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "test-4-groups",
                    "result": {
                        "operator": "+",
                        "operands": [
                            {
                                "kind": "d4",
                                "results": [
                                    1
                                ]
                            },
                            {
                                "operator": "+",
                                "operands": [
                                    {
                                        "kind": "d6",
                                        "results": [
                                            4
                                        ]
                                    },
                                    {
                                        "value": 50
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "test-4-groups",
                    "result": {
                        "operator": "+",
                        "operands": [
                            {
                                "kind": "d6",
                                "results": [
                                    1
                                ]
                            },
                            {
                                "operator": "+",
                                "operands": [
                                    {
                                        "kind": "d8",
                                        "results": [
                                            1
                                        ]
                                    },
                                    {
                                        "value": 100
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "test-4-groups",
                    "result": {
                        "operator": "+",
                        "operands": [
                            {
                                "kind": "d8",
                                "results": [
                                    4
                                ]
                            },
                            {
                                "operator": "+",
                                "operands": [
                                    {
                                        "kind": "d10",
                                        "results": [
                                            5
                                        ]
                                    },
                                    {
                                        "value": 200
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            "gmOnly": false,
            "quiet": true
        }
    }
    */
    // https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#calls/dice/evaluatediceresultsgroup

    if (trackedRollIds[rollEvent.payload.rollId] == undefined) {
        return;
    }

    if (!isValidRollEvent(rollEvent.kind)) {
        // TODO: Should we render and/or log an error message here?
        return;
    }

    if (rollEvent.kind == rollEvents.rollRemoved) {
        handleRollRemovedEvent(rollEvent);
    } else if (rollEvent.kind == rollEvents.rollResults) {
        await handleRollResultsEvent(rollEvent);
    }
}

function isValidRollEvent(eventName) {
    if (
        eventName == rollEvents.rollResults ||
        eventName == rollEvents.rollRemoved
    ) {
        return true;
    }

    return false;
}

function handleRollRemovedEvent(rollEvent) {
    delete trackedRollIds[rollEvent.payload.rollId];
}

async function handleRollResultsEvent(rollEvent) {
    let roll = rollEvent.payload;
    let resultGroup = {};

    if (roll.resultsGroups != undefined) {
        let rollInfo = trackedRollIds[roll.rollId];

        if (
            rollInfo.type == rollTypes.advantage ||
            rollInfo.type == rollTypes.bestofThree
        ) {
            resultGroup = handleAdvantageRoll(roll);
        } else if (rollInfo.type == rollTypes.disadvantage) {
            resultGroup = await handleDisadvantageRoll(roll);
        } else {
            resultGroup = await handleNormalRoll(roll);
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
}

async function handleAdvantageRoll(roll) {
    let finalResults = [];
    let resultGroups = [];

    for (let group of roll.resultsGroups) {
        let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
        finalResults.push(groupSum);
        resultGroups.push(group);
    }

    let max = Math.max(...finalResults);
    let maxIndex = finalResults.indexOf(max);

    finalResult = max;

    return resultGroups[maxIndex];
}

async function handleDisadvantageRoll(roll) {
    let finalResults = [];
    let resultGroups = [];

    for (let group of roll.resultsGroups) {
        let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
        finalResults.push(groupSum);
        resultGroups.push(group);
    }

    let min = Math.min(...finalResults);
    let minIndex = finalResults.indexOf(min);

    finalResult = min;

    return resultGroups[minIndex];
}

async function handleNormalRoll(roll) {
    let finalResults = [];
    let resultGroups = [];

    for (let group of roll.resultsGroups) {
        let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
        finalResults.push(groupSum);
        resultGroups.push(group);
    }

    finalResult = finalResults.reduce((sum, value) => sum + value, 0);

    let resultGroup = [].concat(...resultGroups);

    return resultGroup;
}

// Doesn't handle any non-normal roll types
async function displayResult(resultGroup, rollId) {
    TS.dice
        .sendDiceResult(resultGroup, rollId)
        .catch((response) =>
            console.error("error in sending dice result", response)
        );
}
