document.addEventListener("DOMContentLoaded", updateDiceGroupsData);
document.addEventListener("DOMContentLoaded", sortSavedRolls);
document
    .getElementById("save-rolls-button")
    .addEventListener("click", saveRollsToLocalStorage);
document
    .getElementById("load-rolls-button")
    .addEventListener("click", loadRollsFromLocalStorage);

function updateDiceGroupsData() {
    diceGroupsData = [];

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    diceGroupElements.forEach((groupElement) => {
        const groupId = groupElement.id;
        const groupDiceCounts = {};

        diceTypes.forEach((diceType) => {
            const countElement = groupElement.querySelector(
                `.counter-overlay[id$="${groupId}-${diceType}-counter-value"]`
            );
            groupDiceCounts[diceType] = countElement
                ? parseInt(countElement.textContent, 10)
                : 0;
        });

        const modElement = groupElement.querySelector(
            `.mod-counter-overlay[id$="${groupId}-mod-counter-value"]`
        );
        groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

        diceGroupsData.push(groupDiceCounts);
    });
}

function increment(type) {
    const [groupId, diceType] = type.split("-");
    const counterId = `${groupId}-${diceType}-counter-value`;
    const counter = document.getElementById(counterId);

    if (counter) {
        let currentValue = parseInt(counter.textContent, 10);
        if (currentValue < 50) {
            counter.textContent = currentValue + 1;
            updateDiceGroupsData();
        }
    } else {
        console.error("Counter element not found:", counterId);
    }
}

function decrement(type) {
    const [groupId, diceType] = type.split("-");
    const counterId = `${groupId}-${diceType}-counter-value`;
    const counter = document.getElementById(counterId);

    if (counter) {
        let currentValue = parseInt(counter.textContent, 10);
        if (currentValue > 0) {
            counter.textContent = currentValue - 1;
            updateDiceGroupsData();
        }
    } else {
        console.error("Counter element not found:", counterId);
    }
}

function negativeMod(modId) {
    const counterId = modId + "-counter-value";
    const counter = document.getElementById(counterId);

    if (counter) {
        let currentValue = parseInt(counter.value, 10);
        counter.value = currentValue - 1;
    } else {
        console.error("Modifier counter element not found:", counterId);
    }
}

function addDiceGroup() {
    const diceGroup = document.createElement("div");
    diceGroup.className = "dice-selection";
    const RollGroup = diceGroupsData.length;
    diceGroup.id = `${RollGroup}`;
    let diceHTML = "";

    diceTypes.forEach((type) => {
        diceHTML += `
            <div class="dice-counter unselectable" id="${RollGroup}-${type}-counter">
            <i class="ts-icon-${type} ts-icon-large" onclick="increment('${RollGroup}-${type}')" oncontextmenu="decrement('${RollGroup}-${type}'); return false;"></i>
            <div class="counter-overlay" id="${RollGroup}-${type}-counter-value">0</div>
            <div class="dice-label">${type.toUpperCase()}</div>
            </div>
        `;
    });

    diceHTML += `
        <div class="plus-sign"><span>+</span></div>
        <div class="dice-counter unselectable" id="${RollGroup}-mod-counter">
        <i class="ts-icon-circle-dotted ts-icon-large mod-holder"></i>
        <input type="number" class="counter-overlay mod-counter-overlay" id="${RollGroup}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" />
        <div class="dice-label">MOD</div>
    </div>
    `;

    diceGroup.innerHTML = diceHTML;
    diceGroupsData.push(RollGroup);
    updateDiceGroupsData();
    document.querySelector(".content-col-dice").appendChild(diceGroup);
}

function removeDiceGroup() {
    updateDiceGroupsData();
    if (diceGroupsData.length > 1) {
        const lastGroupId = diceGroupsData.length - 1;
        const diceGroup = document.getElementById(`${lastGroupId}`);
        if (diceGroup) {
            diceGroup.remove();
            diceGroupsData.splice(lastGroupId, 1);
        } else {
            console.error("Row element not found:", lastGroupId);
        }
    } else {
        console.warn("No rows left to remove.");
    }
}

function sortSavedRolls() {
    const sortOption = document.getElementById("sort-options").value;
    const savedRollsContainer = document.querySelector(
        ".saved-rolls-container"
    );
    let savedRollsToDisplay = savedInVault.slice();

    switch (sortOption) {
        case "newest":
            savedRollsToDisplay.reverse();
            break;
        case "nameAsc":
            savedRollsToDisplay.sort((a, b) =>
                a
                    .querySelector(".roll-entry-label")
                    .textContent.localeCompare(
                        b.querySelector(".roll-entry-label").textContent
                    )
            );
            break;
        case "nameDesc":
            savedRollsToDisplay.sort((a, b) =>
                b
                    .querySelector(".roll-entry-label")
                    .textContent.localeCompare(
                        a.querySelector(".roll-entry-label").textContent
                    )
            );
            break;
        case "all":
            break;
    }

    savedRollsContainer.innerHTML = "";
    savedRollsToDisplay.forEach((roll) =>
        savedRollsContainer.appendChild(roll)
    );
}

function deleteSavedRoll(element) {
    const rollEntry = element.closest(".saved-roll-entry");
    rollEntry.remove();
    savedInVault = savedInVault.filter((roll) => roll !== rollEntry);

    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("load-rolls-button", false);
        disableButtonById("save-rolls-button", false);
    }
}

function save() {
    const rollName = document.getElementById("roll-name").value;
    const diceGroupElements = document.querySelectorAll(".dice-selection");

    savedDiceGroups = []; // Clear the array before saving new data to remove stale data

    diceGroupElements.forEach((groupElement) => {
        const diceGroup = {};

        diceTypes.forEach((diceType) => {
            const countElement = groupElement.querySelector(
                `.counter-overlay[id$="${groupElement.id}-${diceType}-counter-value"]`
            );
            diceGroup[diceType] = countElement
                ? parseInt(countElement.textContent, 10)
                : 0;
        });

        const modElement = groupElement.querySelector(
            `.mod-counter-overlay[id$="${groupElement.id}-mod-counter-value"]`
        );
        diceGroup.mod = modElement ? parseInt(modElement.value, 10) : 0;

        savedDiceGroups.push(diceGroup);
    });

    const stagedRoll = {
        name: rollName,
        groups: savedDiceGroups,
        type: 'normal'
    };

    addSavedRoll(stagedRoll.name, stagedRoll.groups, stagedRoll.type);

    if (fetchSetting("auto-reset")) {
        reset();
    }

    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("save-rolls-button", false);
    }
}

function addSavedRoll(rollName, savedDiceGroups, rollType) {
    const savedRollsContainer = document.querySelector(".saved-rolls-container");
    if (!savedRollsContainer) {
        console.error("Saved rolls container not found");
        return;
    }

    const rollEntry = document.createElement("div");
    rollEntry.className = "saved-roll-entry";
    rollEntry.dataset.rollName = rollName;
    rollEntry.dataset.groupCount = savedDiceGroups.length;
    rollEntry.dataset.rollType = rollType || 'normal';

    const diceDisplay = document.createElement("div");
    diceDisplay.className = "roll-entry-dice";

    savedDiceGroups.forEach((diceCounts, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "dice-group";
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(diceCounts);

        const diceGroupText = Object.entries(diceCounts)
            .filter(([diceType, count]) => count > 0 && diceType !== "mod")
            .map(([diceType, count]) => `${count}${diceType}`)
            .join(" + ");

        const modifier = diceCounts.mod;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+" : ""}${modifier}` : "";

        groupDiv.textContent = `Group ${index + 1}: ${diceGroupText}${modifierText ? ` ${modifierText}` : ""}`;
        diceDisplay.appendChild(groupDiv);
    });

    let rollNameText = rollName;
    if (
        rollNameText === "" ||
        rollNameText === null ||
        rollNameText === undefined
    ) {
        rollNameText = "Unnamed Roll";
    }

    rollEntry.innerHTML = `
        <div class="roll-entry-content">
            <div class="roll-entry-header">
                <div class="padding-div"></div> <!-- Placeholder for future edit-roll -->
                <div class="roll-entry-label">${rollNameText}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">
                    <i class="ts-icon-trash ts-icon-medium"></i>
                </div>
            </div>
        </div>
    `;
    rollEntry.appendChild(diceDisplay);

    const rowOfButtons = document.createElement("div");
    rowOfButtons.className = "row-buttons-container";
    createRollButton(
        "rolling",
        rollNameText,
        "normal",
        savedDiceGroups,
        "roll-button row-button",
        rowOfButtons
    );
    createRollButton(
        "disadvantage",
        rollNameText,
        "disadvantage",
        savedDiceGroups,
        "roll-button row-button",
        rowOfButtons
    );
    createRollButton(
        "advantage",
        rollNameText,
        "advantage",
        savedDiceGroups,
        "roll-button row-button",
        rowOfButtons
    );
    createRollButton(
        "best-of-three",
        rollNameText,
        "best-of-three",
        savedDiceGroups,
        "roll-button row-button",
        rowOfButtons
    );
    createRollButton(
        "crit",
        rollNameText,
        "crit-dice",
        savedDiceGroups,
        "roll-button row-button",
        rowOfButtons
    );

    rollEntry.appendChild(rowOfButtons);

    if (savedRollsContainer.firstChild) {
        savedRollsContainer.insertBefore(
            rollEntry,
            savedRollsContainer.firstChild
        );
    } else {
        savedRollsContainer.appendChild(rollEntry);
    }
}

function createRollButton(imageName, rollName, rollType, rollGroups, classes, parent) {
    const rollButton = document.createElement("div");
    rollButton.className = classes;
    rollButton.onclick = function () {
        const savedRollEntry = this.closest('.saved-roll-entry');
        const groupCount = parseInt(savedRollEntry.dataset.groupCount, 10);
        const groups = [];
        for (let i = 0; i < groupCount; i++) {
            const groupDiv = savedRollEntry.querySelector(`.dice-group[data-group-index="${i}"]`);
            if (groupDiv && groupDiv.dataset.diceCounts) {
                const diceCountsData = JSON.parse(groupDiv.dataset.diceCounts);
                // Ensure all dice types have a value, even if it's 0
                const fullDiceCountsData = {...diceCountsData};
                diceTypes.forEach(type => {
                    if (!(type in fullDiceCountsData)) {
                        fullDiceCountsData[type] = 0;
                    }
                });
                if (!('mod' in fullDiceCountsData)) {
                    fullDiceCountsData.mod = 0;
                }
                groups.push(fullDiceCountsData);
            }
        }
        if (groups.length === 0) {
            console.error('No valid dice groups found for this saved roll');
            return;
        }
        // Use the groups data from the saved roll, not the global diceGroupsData
        rollsModule.roll(rollName, rollType, groups);
    };
    const imageIcon = document.createElement("img");
    imageIcon.src = `./images/icons/${imageName}.png`;
    imageIcon.className = "roll-type-image";
    rollButton.appendChild(imageIcon);
    parent.appendChild(rollButton);
}

function reset() {
    updateDiceGroupsData();
    document.getElementById("roll-name").value = "";

    diceGroupsData.forEach((group, index) => {
        diceTypes.forEach((type) => {
            const counter = document.getElementById(
                `${index}-${type}-counter-value`
            );
            const modCounter = document.getElementById(
                `${index}-mod-counter-value`
            );
            if (counter) counter.textContent = "0";
            if (modCounter) modCounter.value = "0";
        });

        if (index > 0) {
            const diceRow = document.getElementById(`${index}`);
            if (diceRow) {
                diceRow.remove();
            }
        }
    });

    diceGroupsData.splice(1);
}

function disableButtonById(id, disable = true) {
    document.getElementById(id).disabled = disable;
}
