function roll(rollNameParam, rollTypeParam) {
    let selectedType = rollTypeParam || 'normal'; // Set to normal if no type is provided

    let updatedDiceGroupsData = [];

    diceGroupsData.forEach((group, index) => {
        let groupId = index;
        let groupDiceCounts = {};
        diceTypes.forEach(type => {
            const counter = document.getElementById(`${groupId}-${type}-counter-value`);
            if (counter) {
                groupDiceCounts[type] = counter.textContent;
            } else {
                console.error(`Could not find counter for ${groupId}-${type}`);
            }
        });

        const modCounter = document.getElementById(`${groupId}-mod-counter-value`);
        if (modCounter) {
            groupDiceCounts['mod'] = modCounter.value;
        } else {
            console.error(`Could not find mod counter for ${groupId}`);
        }

        updatedDiceGroupsData.push(groupDiceCounts);
    });

    diceGroupsData = updatedDiceGroupsData;

    let critBehavior = fetchSetting('crit-behavior');

    let rollName = buildRollName(rollNameParam, selectedType, critBehavior);

    // Adjust for critical hit dice types
    if (selectedType === 'crit-dice') {
        if (critBehavior === 'double-die-count') {
            diceCounts = doubleDieCountsForGroups(group)
        }
        selectedType = 'normal';  // Reset to normal type after handling critical dice
    } else {
        critBehavior = 'none';
    }

    // Construct the dice roll string from the dice groups
    let TSDiceRollString = constructDiceRollString(rollName, diceGroupsData);

    // Validate the constructed dice roll string
    if (!TS.dice.isValidRollString(TSDiceRollString)) {
        console.error('Invalid dice roll string:', TSDiceRollString);
        return;
    }

    try {
        // Create the roll object with name and roll string
        let rollObject = { name: rollName, roll: TSDiceRollString };
        let rollCount;

        // Determine the roll count based on the selected type
        switch (selectedType) {
            case 'advantage':
            case 'disadvantage': // if selectedType is 'advantage' or 'disadvantage, fall through to rollCount = 2
                rollCount = 2;
                break;
            case 'best-of-three':
                rollCount = 3;
                break;
            default:
                rollCount = 1;
        }

        // Create the tray configuration for the specified number of rolls
        let trayConfiguration = Array(rollCount).fill(rollObject);

        // Put dice in tray and handle the response
        TS.dice.putDiceInTray(trayConfiguration, true).then(diceSetResponse => {
            // Track the rolled dice IDs with their type and critical behavior
            trackedIds[diceSetResponse] = {
                type: selectedType,
                critBehavior: critBehavior
            };
        });
    } catch (error) {
        // Log any errors encountered during roll descriptor creation
        console.error('Error creating roll descriptors:', error);
    }
}

function buildRollName(rollNameParam, rollTypeParam, critBehaviorParam) {
    let rollName = rollNameParam || document.getElementById('roll-name').value || 'Unnamed Roll';

    if (rollTypeParam !== 'normal' && rollTypeParam !== 'crit-dice'){
        rollName += '\n' + formatRollTypeName(rollTypeParam);
    }

    if (rollTypeParam === 'crit-dice'){
        if (critBehaviorParam === 'double-die-count') {
            rollName += '\nCrit! Double the Dice';
        }
        if (critBehaviorParam === 'double-die-result'){
            rollName += '\nCrit! Double the Die Results';
        }
        if (critBehaviorParam === 'double-total'){
            rollName += '\nCrit! Double the Total';
        }
        if (critBehaviorParam === 'max-die'){
            rollName += '\nCrit! Maximize the Die';
        }
        if (critBehaviorParam === 'max-plus'){
            rollName += '\nCrit! Maximize Die plus Die Result';
        }
    }

    return rollName;
}

function formatRollTypeName(rollType) {
    const rollTypeMappings = {
        'normal': 'Normal',
        'advantage': 'Advantage',
        'disadvantage': 'Disadvantage',
        'best-of-three': 'Best of Three',
    };
    return rollTypeMappings[rollType] || rollType;
}

function constructDiceRollString(rollName) {
    // Create an empty array to store the formatted dice group strings
    let formattedDiceGroups = [];

    // Iterate over each dice group in the diceGroupsData array
    for (const groupDiceCounts of diceGroupsData) {
        // Create an empty array to store the formatted dice and modifier for the current group
        let formattedDiceGroup = [];

        // Iterate over each die type and its count in the current group
        for (const [die, count] of Object.entries(groupDiceCounts)) {
            // If the die type is not 'mod' and the count is greater than 0
            if (die !== 'mod' && count > 0) {
                // Push the formatted die string (e.g., "1d4") to the formattedDiceGroup array
                formattedDiceGroup.push(`${count}${die}`);
            }
        }

        // If the modifier for the current group is not 0
        if (groupDiceCounts.mod !== 0) {
            // Determine the modifier string based on whether it's positive or negative
            let modPart = groupDiceCounts.mod >= 0 ? `+${groupDiceCounts.mod}` : `${groupDiceCounts.mod}`;
            // Push the modifier string to the formattedDiceGroup array
            formattedDiceGroup.push(modPart);
        }

        // Join the formatted dice and modifier strings for the current group into a single string
        let groupRollString = formattedDiceGroup.join('');
        // Push the group roll string to the formattedDiceGroups array
        formattedDiceGroups.push(groupRollString);
    }

    // Construct the final Talespire dice roll string by encoding the roll name and joining the formatted dice groups with '/'
    let TSDiceRollString = formattedDiceGroups.join('/');
    // Return the constructed Talespire dice roll string
    return TSDiceRollString;
}

async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        return;
    }

    let roll = rollEvent.payload;
    let finalResults = [];
    let resultGroups = [];

    if (rollEvent.kind == "rollResults") {
        if (roll.resultsGroups != undefined) {
            let rollInfo = trackedIds[roll.rollId];
            if (rollInfo.type == "advantage" || rollInfo.type == "best-of-three") {
                //---ADVANTAGE ROLLS---//
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    finalResults.push(groupSum);
                    resultGroups.push(group);
                }
                let max = Math.max(...finalResults);
                let maxIndex = finalResults.indexOf(max);
                finalResult = max;
                resultGroup = resultGroups[maxIndex];
            } else if (rollInfo.type == "disadvantage") {
                //---DISADVANTAGE ROLLS---//
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    finalResults.push(groupSum);
                    resultGroups.push(group);
                }
                let min = Math.min(...finalResults);
                let minIndex = finalResults.indexOf(min);
                finalResult = min;
                resultGroup = resultGroups[minIndex];
            } else {//---NORMAL ROLLS---//
                resultGroup = roll.resultsGroups[0];
                finalResult = await TS.dice.evaluateDiceResultsGroup(resultGroup);
            }

            if (rollInfo.critBehavior === 'double-total') {
                resultGroup = doubleDiceResults(resultGroup);
                resultGroup = doubleModifier(resultGroup);
            } else if (rollInfo.critBehavior === 'double-die-result') {
                resultGroup = doubleDiceResults(resultGroup);
            } else if (rollInfo.critBehavior === 'max-die') {
                resultGroup = maximizeDiceResults(resultGroup);
            } else if (rollInfo.critBehavior === 'max-plus') {
                resultGroup = addMaxDieForEachKind(resultGroup);
            }
        }

        displayResult(resultGroup, roll.rollId);
    } else if (rollEvent.kind == "rollRemoved") {
        delete trackedIds[rollEvent.payload.rollId];
    }
}

async function displayResult(resultGroup, rollId) {
    TS.dice.sendDiceResult([resultGroup], rollId).catch((response) => console.error("error in sending dice result", response));
}