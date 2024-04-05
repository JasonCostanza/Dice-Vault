let trackedIds = {};
let isGM = false;
let me;
let allSavedRolls = [];
let gmRolls = {};

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

function negativeMod(die) {
    const counter = document.getElementById(die + '-counter-value');
    let currentValue = parseInt(counter.textContent, 10);
    counter.textContent = currentValue - 1;
}

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
    rollEntry.dataset.diceCounts = JSON.stringify(diceCounts);
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
                <div class="padding-div"></div> <!-- Make this Div the edit-roll eventually -->
                <div class="roll-entry-label">${rollName}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">
                    <i class="ts-icon-trash ts-icon-medium"></i>
                </div>
            </div>
            <div class="roll-entry-dice">${diceDisplay}</div>
            
        </div>
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'roll-buttons-container';

    const rowofButtons = document.createElement('div');
    rowofButtons.className = 'row-buttons-container';

    createRollButton('Quick Roll', rollName, 'normal', diceCounts, 'roll-button', buttonsContainer);
    createRollButton('Disadvantage', rollName, 'disadvantage', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('Advantage', rollName, 'advantage', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('Best of 3', rollName, 'best-of-three', diceCounts, 'roll-button row-button', rowofButtons);

    buttonsContainer.appendChild(rowofButtons);

    rollEntry.appendChild(buttonsContainer);

    if (savedRollsContainer.firstChild) {
        savedRollsContainer.insertBefore(rollEntry, savedRollsContainer.firstChild);
    } else {
        savedRollsContainer.appendChild(rollEntry);
    }
}

function createRollButton(text, rollName, rollType, diceCounts, classes, parent){
    const rollButton = document.createElement('div');
    rollButton.textContent = text;
    rollButton.className = classes;
    rollButton.onclick = function() {
        roll(rollName, rollType, diceCounts);
    };
    parent.appendChild(rollButton);
}

function reset() {
    document.getElementById('roll-name').value = '';

    const diceCounters = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'mod'];
    diceCounters.forEach(die => {
        document.getElementById(die + '-counter-value').textContent = '0';
    });

    document.getElementById('normal').checked = true;
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

async function roll(rollNameParam, selectedTypeParam, diceCountsParam) {
    let rollName = rollNameParam || document.getElementById('roll-name').value || 'Unnamed Roll';
    let selectedType = selectedTypeParam || document.querySelector('input[name="roll-type"]:checked').value;
    if (selectedType !== 'normal'){
        rollName += '\n' + formatRollTypeName(selectedType);
    }
    let diceCounts = diceCountsParam || {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d8: document.getElementById('d8-counter-value').textContent,
        d10: document.getElementById('d10-counter-value').textContent,
        d12: document.getElementById('d12-counter-value').textContent,
        d20: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').textContent,
    };
    let diceRollString = constructDiceRollString(diceCounts);

    if (!TS.dice.isValidRollString(diceRollString)) {
        console.error('Invalid dice roll string:', diceRollString);
        return;
    }

    try {

        let rollObject = { name: rollName, roll: diceRollString };
        let rollCount;

        switch (selectedType) {
            case 'advantage':
            case 'disadvantage':
                rollCount = 2;
                break;
            case 'best-of-three':
                rollCount = 3;
                break;
            default:
                rollCount = 1;
        }

        let trayConfiguration = Array(rollCount).fill(rollObject);

        TS.dice.putDiceInTray(trayConfiguration, true).then(diceSetResponse => {
            trackedIds[diceSetResponse] = selectedType;
        });
    } catch (error) {
        console.error('Error creating roll descriptors:', error);
    }
}


function constructDiceRollString(diceCounts) {
    let diceRollParts = [];
    for (const [die, count] of Object.entries(diceCounts)) {
        if (die !== 'mod' && count !== '0') {
            diceRollParts.push(`${count}${die}`);
        }
    }
    
    if (diceCounts.mod !== '0') {
        let modValue = parseInt(diceCounts.mod, 10);
        let modPart = modValue >= 0 ? `${modValue}` : `${modValue}`;
        diceRollParts.push(modPart);
    }

    let diceRollString = diceRollParts.join('+').replace(/\+\-/, '-');
    return diceRollString;
}

async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        return;
    }

    let roll = rollEvent.payload;
    let finalResult = 0;
    let resultGroup = {};

    if (rollEvent.kind == "rollResults") {
        if (roll.resultsGroups != undefined) {
            if (trackedIds[roll.rollId] == "advantage" || trackedIds[roll.rollId] == "best-of-three") {
                //---ADVANTAGE ROLLS---//
                let max = 0;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    if (groupSum > max) {
                        max = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = max;
            } else if (trackedIds[roll.rollId] == "disadvantage") {
                //---DISADVANTAGE ROLLS---//
                let min = Number.MAX_SAFE_INTEGER;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    if (groupSum < min) {
                        min = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = min == Number.MAX_SAFE_INTEGER ? 0 : min;
            } else {//---NORMAL ROLLS---//
                if (roll.resultsGroups.length > 0) {
                    resultGroup = roll.resultsGroups[0];
                    finalResult = await TS.dice.evaluateDiceResultsGroup(resultGroup);
                }
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