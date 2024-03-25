let trackedIds = {};
let isGM = false;
let me;
let allSavedRolls = [];

function rollInTalespire(type) {
    let name = document.getElementById("roll-name").value || "Check";
    let dice = document.getElementById("roll-content").value || "1d20";
    let typeStr = type == "advantage" ? " (Adv)" : " (Disadv)";
    TS.dice.putDiceInTray([{ name: name + typeStr, roll: dice }, { name: name + typeStr, roll: dice }], true).then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });
}

function increment(die) {
    const counter = document.getElementById(die + '-counter-value');
    let currentValue = parseInt(counter.textContent, 10);
    if (currentValue < 50) {
        counter.textContent = currentValue + 1;
    }
}

function decrement(die) {
    const counter = document.getElementById(die + '-counter-value');
    let currentValue = parseInt(counter.textContent, 10);
    if (currentValue > 0) {
        counter.textContent = currentValue - 1;
    }
}

// I took this and the bottom of the page JS from Generic_sheets mod and still cant figure out how theirs is supposed to work but this one doesnt :trynottocry:
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
    const savedRolls = Array.from(savedRollsElements).map(roll => {
        return {
            name: roll.querySelector('.roll-entry-label').textContent,
            type: roll.dataset.rollType,
            counts: JSON.parse(roll.dataset.diceCounts)
        };
    });
}

function sortSavedRolls() {
    const sortOption = document.getElementById('sort-options').value;
    const savedRollsContainer = document.querySelector('.saved-rolls-container');
    let savedRollsToDisplay = allSavedRolls.slice();

    switch (sortOption) {
        case 'advantage':
        case 'disadvantage':
        case 'normal':
            savedRollsToDisplay = savedRollsToDisplay.filter(roll => roll.dataset.rollType === sortOption);
            break;
        case 'newest':
            savedRollsToDisplay.reverse();
            break;
        case 'all':
            break;
    }

    savedRollsContainer.innerHTML = '';
    savedRollsToDisplay.forEach(roll => savedRollsContainer.appendChild(roll));
}

function deleteSavedRoll(element) {
    const rollEntry = element.closest('.saved-roll-entry');
    rollEntry.remove();
    allSavedRolls = allSavedRolls.filter(roll => roll !== rollEntry);
}

document.addEventListener('DOMContentLoaded', sortSavedRolls);

function save() {
    const rollName = document.getElementById('roll-name').value || 'Unnamed Roll';
    const selectedType = document.querySelector('input[name="roll-type"]:checked').value;
    const diceCounts = {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d8: document.getElementById('d8-counter-value').textContent,
        d10: document.getElementById('d10-counter-value').textContent,
        d12: document.getElementById('d12-counter-value').textContent,
        d20: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').textContent,
    };

    addSavedRoll(rollName, selectedType, diceCounts);
    saveCurrentRolls();
}

function addSavedRoll(rollName, rollType, diceCounts) {
    const savedRollsContainer = document.querySelector('.saved-rolls-container');
    const rollEntry = document.createElement('div');
    rollEntry.className = 'saved-roll-entry';
    rollEntry.dataset.rollType = rollType;
    rollEntry.dataset.diceCounts = JSON.stringify(diceCounts); // Set the diceCounts attribute to a stringified version of the object 
    allSavedRolls.push(rollEntry);

    let diceDisplay = '';
    const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'mod'];
    diceOrder.forEach(die => {
        const count = diceCounts[die];
        if (count !== '0') {
            let iconClass = die === 'mod' ? 'ts-icon-circle-dotted' : `ts-icon-${die}`;
            diceDisplay += `
                <div class="dice-icon-container">
                    <i class="${iconClass} ts-icon-large"></i>
                    <span class="dice-count">${count}</span>
                </div>
            `;
        }
        if (die === 'd20' && diceCounts['mod'] !== '0') {
            diceDisplay += '<div class="plus-sign">+</div>';
        }
    });

    rollEntry.innerHTML = `
        <div class="roll-entry-content">
            <div class="roll-entry-header">
                <div class="roll-entry-label">${rollName}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">
                    <i class="ts-icon-trash ts-icon-medium"></i>
                </div>
            </div>
            <div class="roll-type-indicator">${rollType.toUpperCase()}</div>
            <div class="roll-entry-dice">${diceDisplay}</div>
            
        </div>
    `;

    // <div class="quick-roll-button" onclick="roll('${rollName}', '${rollType}', ${JSON.stringify(diceCounts)})">Quick Roll</div> ((SAVING CUZ IDK WHY THIS BROKE LOL))

    const quickRollButton = document.createElement('div');
    quickRollButton.textContent = 'Quick Roll'; 
    quickRollButton.className = 'quick-roll-button';
    quickRollButton.onclick = function() {
        roll(rollName, rollType, diceCounts);
    };
    rollEntry.appendChild(quickRollButton);

    if (savedRollsContainer.firstChild) {
        savedRollsContainer.insertBefore(rollEntry, savedRollsContainer.firstChild);
    } else {
        savedRollsContainer.appendChild(rollEntry);
    }
}

// function deleteSavedRoll(element) {
//     const rollEntry = element.closest('.saved-roll-entry');
//     rollEntry.remove();
// }

function reset() {
    document.getElementById('roll-name').value = '';

    const diceCounters = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'mod'];
    diceCounters.forEach(die => {
        document.getElementById(die + '-counter-value').textContent = '0';
    });

    document.getElementById('normal').checked = true;
}

async function roll(rollNameParam, selectedTypeParam, diceCountsParam) {
    let rollName = rollNameParam || document.getElementById('roll-name').value || 'Unnamed Roll';
    let selectedType = selectedTypeParam || document.querySelector('input[name="roll-type"]:checked').value;
    let diceCounts = diceCountsParam || {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d8: document.getElementById('d8-counter-value').textContent,
        d10: document.getElementById('d10-counter-value').textContent,
        d12: document.getElementById('d12-counter-value').textContent,
        d20: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').textContent,
    };

    let diceRollString = '';
    Object.entries(diceCounts).forEach(([die, count]) => {
        if (count !== '0') {
            if (die !== 'mod') {
                diceRollString += `${count}${die}+`;
            } else {
            }
        }
    });

    diceRollString = diceRollString.replace(/\+$/, '');

    if (diceCounts.mod && diceCounts.mod !== '0') {
        diceRollString += diceRollString ? `+${diceCounts.mod}` : diceCounts.mod;
    }

    if (!TS.dice.isValidRollString(diceRollString)) {
        console.error('Invalid dice roll string:', diceRollString);
        return; 
    }

    if (selectedType === 'advantage' || selectedType === 'disadvantage') {
        TS.dice.putDiceInTray([{ name: rollName, roll: diceRollString }, { name: rollName, roll: diceRollString }], true).then(diceSetResponse => {
            trackedIds[diceSetResponse] = selectedType;
        });
    } else {
        TS.dice.putDiceInTray([{ name: rollName, roll: diceRollString }], false).then(diceSetResponse => {
            trackedIds[diceSetResponse] = 'normal';
        });
    }

    // quickRollButton.onclick = function() {
    // roll(rollName, rollType, diceCounts);
    // }
};

async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        //if we haven't tracked that roll, ignore it because it's not from us
        return;
    }

    if (rollEvent.kind == "rollResults") {
        //user rolled the dice we tracked and there's a new result for us to look at
        let roll = rollEvent.payload
        let finalResult = 0;
        let resultGroup = {};
        if (roll.resultsGroups != undefined && roll.resultsGroups.length >= 2) {
            //just making sure the roll actually has 2 or more groups. should never be false as we created the roll with 2 groups
            if (trackedIds[roll.rollId] == "advantage") {
                //the incoming roll was stored as an advantage roll
                let max = 0;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    //if you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum > max) {
                        max = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = max;
            } else if (trackedIds[roll.rollId] == "disadvantage") {
                //the incoming roll was stored as an disadvantage roll
                let min = Number.MAX_SAFE_INTEGER;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    //if you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum < min) {
                        min = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = min == Number.MAX_SAFE_INTEGER ? 0 : min;
            } else {
                return;
            }
        }

        //finalResult remains unused in this example, but could be useful for other applications
        displayResult(resultGroup, roll.rollId);
    } else if (rollEvent.kind == "rollRemoved") {
        //if you want special handling when the user doesn't roll the dice
        delete trackedIds[rollEvent.payload.rollId];
    }
}

async function displayResult(resultGroup, rollId) {
    TS.dice.sendDiceResult([resultGroup], rollId).catch((response) => console.error("error in sending dice result", response));
}

function saveRollsToLocalStorage() {
    let rollsData = [];
    document.querySelectorAll('.saved-roll-entry').forEach(entry => {
        let rollData = {
            name: entry.querySelector('.roll-entry-label').textContent.trim(),
            type: entry.dataset.rollType,
            counts: JSON.parse(entry.dataset.diceCounts)
        };
        rollsData.push(rollData);
    });

    let rollsJson = JSON.stringify(rollsData);
    console.log('Saving rolls data:', rollsJson); 
    TS.localStorage.campaign.setBlob(rollsJson).then(() => {
        console.log('Rolls data saved successfully.');
    }).catch(error => {
        console.error('Failed to save rolls data:', error);
    });
}

function loadRollsFromLocalStorage() {
    TS.localStorage.campaign.getBlob().then(rollsJson => {
        console.log('Loading rolls data:', rollsJson);
        let rollsData = JSON.parse(rollsJson || '[]');
        rollsData.forEach(rollData => {
            addSavedRoll(rollData.name, rollData.type, rollData.counts);
        });
    }).catch(error => {
        console.error('Failed to load rolls data:', error);
    });
}
document.getElementById('save-rolls-button').addEventListener('click', saveRollsToLocalStorage);
document.getElementById('load-rolls-button').addEventListener('click', loadRollsFromLocalStorage);