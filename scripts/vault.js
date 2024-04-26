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

function sortSavedRolls() {
    const sortOption = document.getElementById('sort-options').value;
    const savedRollsContainer = document.querySelector('.saved-rolls-container');
    let savedRollsToDisplay = allSavedRolls.slice();

    switch (sortOption) {
        case 'newest':
            savedRollsToDisplay.reverse();
            break;
        case 'nameAsc':
            savedRollsToDisplay.sort((a, b) => a.querySelector('.roll-entry-label').textContent.localeCompare(b.querySelector('.roll-entry-label').textContent));
            break;
        case 'nameDesc':
            savedRollsToDisplay.sort((a, b) => b.querySelector('.roll-entry-label').textContent.localeCompare(a.querySelector('.roll-entry-label').textContent));
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

    if (fetchSetting('auto-save')) {
        saveRollsToLocalStorage();
    }else{
        disableButtonById('load-rolls-button', false);
        disableButtonById('save-rolls-button', false);
    }
}

document.addEventListener('DOMContentLoaded', sortSavedRolls);

function save() {
    const rollName = document.getElementById('roll-name').value || 'Unnamed Roll';
    const diceCounts = {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d8: document.getElementById('d8-counter-value').textContent,
        d10: document.getElementById('d10-counter-value').textContent,
        d12: document.getElementById('d12-counter-value').textContent,
        d20: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').value,
    };

    addSavedRoll(rollName, diceCounts);
    saveCurrentRolls();

    if (fetchSetting('auto-reset')){
        reset();
    }

    if (fetchSetting('auto-save')){
        saveRollsToLocalStorage();
    }else{
        disableButtonById('save-rolls-button', false);
    }
}

function addSavedRoll(rollName, diceCounts) {
    const savedRollsContainer = document.querySelector('.saved-rolls-container');
    const rollEntry = document.createElement('div');
    rollEntry.className = 'saved-roll-entry';
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

    const rowofButtons = document.createElement('div');
    rowofButtons.className = 'row-buttons-container';

    createRollButton('rolling', rollName, 'normal', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('disadvantage', rollName, 'disadvantage', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('advantage', rollName, 'advantage', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('best-of-three', rollName, 'best-of-three', diceCounts, 'roll-button row-button', rowofButtons);
    createRollButton('crit', rollName, 'crit-dice', diceCounts, 'roll-button row-button', rowofButtons);


    rollEntry.appendChild(rowofButtons);

    if (savedRollsContainer.firstChild) {
        savedRollsContainer.insertBefore(rollEntry, savedRollsContainer.firstChild);
    } else {
        savedRollsContainer.appendChild(rollEntry);
    }
}

function createRollButton(imageName, rollName, rollType, diceCounts, classes, parent){
    const rollButton = document.createElement('div');
    rollButton.className = classes;
    rollButton.onclick = function() {
        roll(rollName, rollType, diceCounts);
    };
    const imageIcon = document.createElement('img');
    imageIcon.src = `./images/icons/${imageName}.png`;
    imageIcon.className = 'roll-type-image';
    rollButton.appendChild(imageIcon);
    parent.appendChild(rollButton);
}

function reset() {
    document.getElementById('roll-name').value = '';

    const diceCounters = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'mod'];
    diceCounters.forEach(die => {
        document.getElementById(die + '-counter-value').textContent = '0';
    });
    document.getElementById('mod-counter-value').value = '0';
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

function buildRollName(rollNameParam, selectedTypeParam, critBehaviorParam) {
    let rollName = rollNameParam || document.getElementById('roll-name').value || 'Unnamed Roll';

    if (selectedTypeParam !== 'normal' && selectedTypeParam !== 'crit-dice'){
        rollName += '\n' + formatRollTypeName(selectedTypeParam);
    }

    if (selectedTypeParam === 'crit-dice'){
        if (critBehaviorParam=== 'double-die-count') {
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

async function roll(rollNameParam, selectedTypeParam, diceCountsParam) {
    let selectedType = selectedTypeParam || document.querySelector('input[name="roll-type"]:checked').value;

    let diceCounts = diceCountsParam || {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d8: document.getElementById('d8-counter-value').textContent,
        d10: document.getElementById('d10-counter-value').textContent,
        d12: document.getElementById('d12-counter-value').textContent,
        d20: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').value,
    };

    let critBehavior = fetchSetting('crit-behavior');

    let rollName = buildRollName(rollNameParam, selectedType, critBehavior);

    if (selectedType === 'crit-dice'){
        if (critBehavior=== 'double-die-count') {
            diceCounts = doubleDieCounts(diceCounts);
        }
        selectedType = 'normal';
    }else{
        critBehavior = 'none';
    }

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
            trackedIds[diceSetResponse] = {
                type: selectedType,
                critBehavior: critBehavior
            };
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
            let rollInfo = trackedIds[roll.rollId];
            if (rollInfo.type == "advantage" || rollInfo.type == "best-of-three") {
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
            } else if (rollInfo.type == "disadvantage") {
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

async function onStateChangeEvent(msg){
    if (msg.kind === 'hasInitialized'){
        loadGlobalSettings();
    }
}

function disableButtonById(id, disable = true){
    document.getElementById(id).disabled = disable;
}

document.getElementById('save-rolls-button').addEventListener('click', saveRollsToLocalStorage);
document.getElementById('load-rolls-button').addEventListener('click', loadRollsFromLocalStorage);