document.addEventListener("DOMContentLoaded", updateDiceGroupsData);
document.addEventListener("DOMContentLoaded", sortSavedRolls);
document
    .getElementById("save-rolls-button")
    .addEventListener("click", saveRollsToLocalStorage);
document
    .getElementById("load-rolls-button")
    .addEventListener("click", loadRollsFromLocalStorage);
document.addEventListener("DOMContentLoaded", initializeSortingFunctionality);

function isDiceGroupEmpty(diceGroup) {
    return Object.entries(diceGroup).every(([key, value]) => key === 'mod' || value === 0);
}

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

function addDiceGroup(index = null) {
    const diceGroup = document.createElement("div");
    diceGroup.className = "dice-selection";
    const existingGroups = document.querySelectorAll('.dice-selection');
    const groupIndex = index !== null ? index : existingGroups.length;
    diceGroup.id = `${groupIndex}`;
    let diceHTML = "";

    diceTypes.forEach((type) => {
        diceHTML += `
            <div class="dice-counter unselectable" id="${groupIndex}-${type}-counter">
            <i class="ts-icon-${type} ts-icon-large" onclick="increment('${groupIndex}-${type}')" oncontextmenu="decrement('${groupIndex}-${type}'); return false;"></i>
            <div class="counter-overlay" id="${groupIndex}-${type}-counter-value">0</div>
            <div class="dice-label">${type.toUpperCase()}</div>
            </div>
        `;
    });

    diceHTML += `
        <div class="plus-sign"><span>+</span></div>
        <div class="dice-counter unselectable" id="${groupIndex}-mod-counter">
        <i class="ts-icon-circle-dotted ts-icon-large mod-holder"></i>
        <input type="number" class="counter-overlay mod-counter-overlay" id="${groupIndex}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" />
        <div class="dice-label">MOD</div>
    </div>
    `;

    diceGroup.innerHTML = diceHTML;
    document.querySelector(".content-col-dice").appendChild(diceGroup);

    const groupDiceCounts = {};
    diceTypes.forEach(type => groupDiceCounts[type] = 0);
    groupDiceCounts.mod = 0;

    diceGroupsData.push(groupDiceCounts);
    updateDiceGroupsData();
}

function removeDiceGroup() {
    updateDiceGroupsData();
    const diceGroups = document.querySelectorAll('.dice-selection');
    if (diceGroups.length > 1) {
        const lastGroup = diceGroups[diceGroups.length - 1];
        lastGroup.remove();
        diceGroupsData.pop();

        // Renumber the remaining groups
        diceGroups.forEach((group, index) => {
            group.id = index.toString();
            updateGroupElementIds(group, index);
        });
    } else {
        console.warn("Cannot remove the last remaining group.");
    }
}

function updateGroupElementIds(group, newIndex) {
    diceTypes.forEach(diceType => {
        const counter = group.querySelector(`#${group.id}-${diceType}-counter`);
        if (counter) {
            counter.id = `${newIndex}-${diceType}-counter`;
            const counterValue = counter.querySelector('.counter-overlay');
            if (counterValue) {
                counterValue.id = `${newIndex}-${diceType}-counter-value`;
            }
        }
    });

    const modCounter = group.querySelector(`#${group.id}-mod-counter`);
    if (modCounter) {
        modCounter.id = `${newIndex}-mod-counter`;
        const modCounterValue = modCounter.querySelector('.mod-counter-overlay');
        if (modCounterValue) {
            modCounterValue.id = `${newIndex}-mod-counter-value`;
        }
    }

    // Update onclick attributes
    group.querySelectorAll('.dice-counter').forEach(counter => {
        const diceType = counter.id.split('-')[1];
        counter.querySelector('.ts-icon-large').setAttribute('onclick', `increment('${newIndex}-${diceType}')`);
        counter.querySelector('.ts-icon-large').setAttribute('oncontextmenu', `decrement('${newIndex}-${diceType}'); return false;`);
    });
}

function sortSavedRolls() {
    console.log("Sorting saved rolls..."); // Debug log
    const sortOption = document.getElementById("sort-options").value;
    const savedRollsContainer = document.querySelector(".saved-rolls-container");
    
    if (!savedRollsContainer) {
        console.error("Saved rolls container not found");
        return;
    }

    let savedRollsToDisplay = Array.from(savedRollsContainer.children);
    console.log("Number of saved rolls:", savedRollsToDisplay.length); // Debug log

    switch (sortOption) {
        case "newest":
            savedRollsToDisplay.sort((a, b) => {
                return parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp);
            });
            break;
        case "oldest":
            savedRollsToDisplay.sort((a, b) => {
                return parseInt(a.dataset.timestamp) - parseInt(b.dataset.timestamp);
            });
            break;
        case "nameAsc":
            savedRollsToDisplay.sort((a, b) => {
                const aName = a.querySelector(".roll-entry-label")?.textContent || "";
                const bName = b.querySelector(".roll-entry-label")?.textContent || "";
                return aName.localeCompare(bName);
            });
            break;
        case "nameDesc":
            savedRollsToDisplay.sort((a, b) => {
                const aName = a.querySelector(".roll-entry-label")?.textContent || "";
                const bName = b.querySelector(".roll-entry-label")?.textContent || "";
                return bName.localeCompare(aName);
            });
            break;
        case "all":
            // Do nothing, keep original order
            break;
    }

    savedRollsContainer.innerHTML = "";
    savedRollsToDisplay.forEach((roll) => savedRollsContainer.appendChild(roll));
    console.log("Sorting complete"); // Debug log
}

function initializeSortingFunctionality() {
    const sortOptions = document.getElementById("sort-options");
    if (sortOptions) {
        sortOptions.addEventListener("change", sortSavedRolls);
    } else {
        console.error("Sort options element not found");
    }
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
    const editingRollId = document.body.dataset.editingRollId;

    if (!editingRollId && !overwriteConfirmed && rollNameExists(rollName)) {
        showOverwriteModal(rollName);
        return;
    }

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    savedDiceGroups = [];

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

        savedDiceGroups.push(groupDiceCounts);
    });

    const rollData = {
        name: rollName,
        groups: savedDiceGroups,
        type: 'normal'
    };

    if (editingRollId) {
        // Update existing roll
        updateSavedRoll(editingRollId, rollData);
    } else {
        // Check if we're overwriting an existing roll
        const existingRoll = document.querySelector(`.saved-roll-entry[data-roll-name="${rollName}"]`);
        if (existingRoll && overwriteConfirmed) {
            // Overwrite existing roll
            updateSavedRoll(existingRoll.dataset.rollId, rollData);
        } else {
            // Add new roll
            addSavedRoll(rollData.name, rollData.groups, rollData.type);
        }
    }

    // Call abortEditing() here, after saving or updating the roll
    abortEditing();
    
    // Reset the roll name input and label
    // const rollNameInput = document.getElementById('roll-name');
    // rollNameInput.value = '';
    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = 'Roll Label';
        rollLabelElement.classList.remove('editing');
    }

    if (fetchSetting("auto-reset")) {
        reset();
    }

    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("save-rolls-button", false);
    }

    overwriteConfirmed = false;
}

function showOverwriteModal(rollName) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'var(--ts-background-primary)';
    modal.style.padding = '20px';
    modal.style.border = '4px solid #ff0000';
    modal.style.zIndex = '1000';
    modal.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    modal.style.borderRadius = '4px';

    modal.innerHTML = `
        <p>Overwrite "${rollName}"?</p>
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
            <button id="overwrite-yes" class="black-button">Yes</button>
            <button id="overwrite-no" class="black-button">No</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('overwrite-yes').addEventListener('click', () => {
        document.body.removeChild(modal);
        overwriteConfirmed = true;  // Set the flag to true
        save(); // Call save() again to proceed with saving
    });

    document.getElementById('overwrite-no').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function rollNameExists(rollName) {
    const savedRolls = document.querySelectorAll('.saved-roll-entry');
    const exists = Array.from(savedRolls).some(roll => roll.dataset.rollName === rollName);
    return exists;
}

function addSavedRoll(rollName, savedDiceGroups, rollType) {
    const savedRollsContainer = document.querySelector(".saved-rolls-container");
    if (!savedRollsContainer) {
        console.error("Saved rolls container not found");
        return;
    }

    const rollEntry = document.createElement("div");
    rollEntry.className = "saved-roll-entry";
    const rollId = `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    rollEntry.dataset.rollId = rollId;
    rollEntry.dataset.rollName = rollName;
    rollEntry.dataset.groupCount = savedDiceGroups.length;
    rollEntry.dataset.rollType = rollType || 'normal';
    rollEntry.dataset.timestamp = Date.now();

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
                <div class="padding-div"></div>
                <div class="roll-entry-label">${rollNameText}</div>
                <div class="saved-rolls-button-container">
                    <div class="edit-roll" onclick="editSavedRoll(this)">
                        <i class="ts-icon-pencil ts-icon-medium"></i>
                    </div>
                    <div class="delete-roll" onclick="deleteSavedRoll(this)">
                        <i class="ts-icon-trash ts-icon-medium"></i>
                    </div>
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
        "advantage",
        rollNameText,
        "advantage",
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

    sortSavedRolls();
}

function editSavedRoll(element) {
    const rollEntry = element.closest('.saved-roll-entry');
    const rollId = rollEntry.dataset.rollId;

    // Check if we're already editing this roll
    if (document.body.dataset.editingRollId === rollId) {
        // If so, abort editing
        abortEditing();
        return;
    }

    // If we were editing a different roll, abort that edit first
    if (document.body.dataset.editingRollId) {
        abortEditing();
    }

    const rollName = rollEntry.querySelector('.roll-entry-label').textContent;
    const groupCount = parseInt(rollEntry.dataset.groupCount, 10);

    // Set the roll name and change the label
    const rollNameInput = document.getElementById('roll-name');
    rollNameInput.value = rollName;
    rollNameInput.classList.add('editing');

    // Change the label text
    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = `Editing . . .`;
        rollLabelElement.classList.add('editing');
    }

    const addGroupButton = document.getElementById('add-group-button');
    const removeGroupButton = document.getElementById('remove-group-button');
    if (addGroupButton) addGroupButton.classList.add('editing');
    if (removeGroupButton) removeGroupButton.classList.add('editing');

    // Set the roll name
    document.getElementById('roll-name').value = rollName;
    
    // Clear existing dice groups
    const diceSelectionContainer = document.querySelector('.content-col-dice');
    diceSelectionContainer.innerHTML = '';
    
    // Recreate dice groups based on saved data
    for (let i = 0; i < groupCount; i++) {
        addDiceGroup(i);
        const groupData = JSON.parse(rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`).dataset.diceCounts);
        
        diceTypes.forEach(diceType => {
            const countElement = document.getElementById(`${i}-${diceType}-counter-value`);
            if (countElement) {
                countElement.textContent = groupData[diceType] || '0';
            }
        });
        
        const modElement = document.getElementById(`${i}-mod-counter-value`);
        if (modElement) {
            modElement.value = groupData.mod || '0';
        }
    }
    
    // Scroll to the top of the page
    window.scrollTo(0, 0);
    
    // Store the ID of the roll being edited
    document.body.dataset.editingRollId = rollId;

    // Change background color of the edited roll
    rollEntry.classList.add('editing');

    // Change edit button appearance
    element.classList.add('editing');
}

function updateSavedRoll(rollId, rollData) {
    let rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
    if (!rollEntry) {
        rollEntry = document.querySelector(`.saved-roll-entry[data-roll-name="${rollData.name}"]`);
    }
    if (rollEntry) {
        rollEntry.querySelector('.roll-entry-label').textContent = rollData.name;
        rollEntry.dataset.rollName = rollData.name;
        rollEntry.dataset.groupCount = rollData.groups.length;

        const diceDisplay = rollEntry.querySelector('.roll-entry-dice');
        diceDisplay.innerHTML = '';

        rollData.groups.forEach((diceCounts, index) => {
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

        // Update roll buttons if necessary
        updateRollButtons(rollEntry, rollData);
    } else {
        console.error(`Roll with ID ${rollId} and name ${rollData.name} not found`);
    }
}

function abortEditing() {
    const editingRollId = document.body.dataset.editingRollId;
    if (editingRollId) {
        const editingRollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${editingRollId}"]`);
        if (editingRollEntry) {
            editingRollEntry.classList.remove('editing');
            editingRollEntry.querySelector('.edit-roll').classList.remove('editing');
        }
        delete document.body.dataset.editingRollId;
    }

    // Reset the roll name input and label
    const rollNameInput = document.getElementById('roll-name');
    rollNameInput.classList.remove('editing');

    // Remove editing class from Add Group and Remove Group buttons
    const addGroupButton = document.getElementById('add-group-button');
    const removeGroupButton = document.getElementById('remove-group-button');
    if (addGroupButton) addGroupButton.classList.remove('editing');
    if (removeGroupButton) removeGroupButton.classList.remove('editing');

    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = 'Roll Label';
        rollLabelElement.classList.remove('editing');
    }
}

function updateRollButtons(rollEntry, rollData) {
    const rowOfButtons = rollEntry.querySelector('.row-buttons-container');
    rowOfButtons.innerHTML = ''; // Clear existing buttons
    
    createRollButton("rolling", rollData.name, "normal", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("advantage", rollData.name, "advantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("disadvantage", rollData.name, "disadvantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("best-of-three", rollData.name, "best-of-three", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("crit", rollData.name, "crit-dice", rollData.groups, "roll-button row-button", rowOfButtons);
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
        if (groups.length === 0 || groups.every(isDiceGroupEmpty)) {
            console.error('Attempted to roll an empty saved roll');
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
