let trackedIds = {};
let isGM = false;
let me;

function roll(type) {
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



function save() {
    const rollName = document.getElementById('roll-name').value || 'Unnamed Roll';
    const selectedType = document.querySelector('input[name="roll-type"]:checked').value;
    const diceCounts = {
        d4: document.getElementById('d4-counter-value').textContent,
        d6: document.getElementById('d6-counter-value').textContent,
        d6: document.getElementById('d8-counter-value').textContent,
        d6: document.getElementById('d10-counter-value').textContent,
        d6: document.getElementById('d12-counter-value').textContent,
        d6: document.getElementById('d20-counter-value').textContent,
        mod: document.getElementById('mod-counter-value').textContent,
    };

    addSavedRoll(rollName, selectedType, diceCounts);
}


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
