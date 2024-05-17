let trackedIds = {};
let isGM = false;
let me;
let allSavedRolls = [];
let gmRolls = {};
const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
const rowIds = [0];

document.addEventListener('DOMContentLoaded', sortSavedRolls);

function increment(dieId) {
    const counterId = dieId + '-counter-value';
    const counter = document.getElementById(counterId);
    
    if (counter) {
        let currentValue = parseInt(counter.textContent, 10);
        if (currentValue < 50) {
            counter.textContent = currentValue + 1;
        }
    } else {
        console.error('Counter element not found:', counterId);
    }
}

function decrement(dieId) {
    const counterId = dieId + '-counter-value';
    const counter = document.getElementById(counterId);

    if (counter) {
        let currentValue = parseInt(counter.textContent, 10);
        if (currentValue > 0) {
            counter.textContent = currentValue - 1;
        }
    } else {
        console.error('Counter element not found:', counterId);
    }
}

function negativeMod(modId) {
    const counterId = modId + '-counter-value';
    const counter = document.getElementById(counterId);

    if (counter) {
        let currentValue = parseInt(counter.value, 10); 
        counter.value = currentValue - 1;
    } else {
        console.error('Modifier counter element not found:', counterId);
    }
}

function addDiceRow() {
    // Need to understand why this is adding row 1 above row 0, then adding row 2 below 1.
    // Sort the rowId's after we create each element
    const diceRow = document.createElement('div');
    diceRow.className = 'dice-selection';
    const rowId = document.querySelectorAll('.dice-selection').length;
    let diceHTML = '';

    diceTypes.forEach(type => {
        diceHTML += `
        <div class="dice-counter unselectable" id="${rowId}-${type}-counter">
        <i class="ts-icon-${type} ts-icon-large" onclick="increment('${rowId}-${type}')" oncontextmenu="decrement('${rowId}-${type}'); return false;"></i>
        <div class="counter-overlay" id="${rowId}-${type}-counter-value">0</div>
        <div class="dice-label">${type.toUpperCase()}</div>
    </div>
        `;
    });

    diceHTML += `
        <div class="plus-sign"><span>+</span></div>
        <div class="dice-counter unselectable" id="${rowId}-mod-counter">
        <i class="ts-icon-circle-dotted ts-icon-large mod-holder"></i>
        <input type="number" class="counter-overlay mod-counter-overlay" id="${rowId}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" 
            onclick="negativeMod('${rowId}-mod')" oncontextmenu="positiveMod('${rowId}-mod'); return false;" />
        <div class="dice-label">MOD</div>
    </div>
    `;

    diceRow.innerHTML = diceHTML;
    rowIds.push(rowId);
    document.querySelector('.content-col-dice').appendChild(diceRow);
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

function save() {
    //TODOL Not yet implemented
    console.error( 'Save not yet implemented with roll groups');

    const rollName = document.getElementById('roll-name').value || 'Unnamed Roll';
    const rows = document.querySelectorAll('.dice-selection');
    let allDiceCounts = [];

    rows.forEach((row, index) => {
        const diceCounts = {
            d4: row.querySelector('#d4-counter-value').textContent,
            d6: row.querySelector('#d6-counter-value').textContent,
            d8: row.querySelector('#d8-counter-value').textContent,
            d10: row.querySelector('#d10-counter-value').textContent,
            d12: row.querySelector('#d12-counter-value').textContent,
            d20: row.querySelector('#d20-counter-value').textContent,
            mod: row.querySelector('#mod-counter-value').value
        };
        allDiceCounts.push(diceCounts);
    });

    addSavedRoll(rollName, allDiceCounts);
    saveCurrentRolls();

    if (fetchSetting('auto-reset')){
        reset();
    }

    if (fetchSetting('auto-save')){
        saveRollsToLocalStorage();
    } else {
        disableButtonById('save-rolls-button', false);
    }
}

function addSavedRoll(rollName, allDiceCounts) {
    const savedRollsContainer = document.querySelector('.saved-rolls-container');
    const rollEntry = document.createElement('div');
    rollEntry.className = 'saved-roll-entry';
    rollEntry.dataset.diceCounts = JSON.stringify(allDiceCounts);
    allSavedRolls.push(rollEntry);

    let diceDisplay = '';
    allDiceCounts.forEach(diceCounts => {
        diceDisplay += '<div class="dice-row">';
        diceTypes.forEach(die => {
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
        });
        if (diceTypes['d20'] !== '0' && diceTypes['mod'] !== '0') {
            diceDisplay += '<div class="plus-sign">+</div>';
        }
        diceDisplay += '</div>'; 
    });

    rollEntry.innerHTML = `
        <div class="roll-entry-content">
            <div class="roll-entry-header">
                <div class="padding-div"></div> <!-- Placeholder for future edit-roll -->
                <div class="roll-entry-label">${rollName}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">
                    <i class="ts-icon-trash ts-icon-medium"></i>
                </div>
            </div>
            <div class="roll-entry-dice">${diceDisplay}</div>
        </div>
    `;

    const rowOfButtons = document.createElement('div');
    rowOfButtons.className = 'row-buttons-container';
    createRollButton('rolling', rollName, 'normal', allDiceCounts, 'roll-button row-button', rowOfButtons);
    createRollButton('disadvantage', rollName, 'disadvantage', allDiceCounts, 'roll-button row-button', rowOfButtons);
    createRollButton('advantage', rollName, 'advantage', allDiceCounts, 'roll-button row-button', rowOfButtons);
    createRollButton('best-of-three', rollName, 'best-of-three', allDiceCounts, 'roll-button row-button', rowOfButtons);
    createRollButton('crit', rollName, 'crit-dice', allDiceCounts, 'roll-button row-button', rowOfButtons);

    rollEntry.appendChild(rowOfButtons);

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

    rowIds.forEach(rowId => {
        diceTypes.forEach(die => {
            document.getElementById(rowId + die + '-' + '-counter-value').textContent = '0';
        });
        document.getElementById(rowId + 'mod-' + '-counter-value').value = '0';
    });

    rowIds.forEach(rowId => {
        if (rowId !== 0){
            document.querySelector('.dice-selection').remove();
            rowIds.length = 0;
        }
    });
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
    // TODO: Capture RowID here because it doesn't work
    console.error( 'Save not yet implemented with roll groups');

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