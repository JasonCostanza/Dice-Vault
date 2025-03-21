document.addEventListener("DOMContentLoaded", updateDiceGroupsData);
document.addEventListener("DOMContentLoaded", sortSavedRolls);
document
    .getElementById("save-rolls-button")
    .addEventListener("click", saveRollsToLocalStorage);
document
    .getElementById("load-rolls-button")
    .addEventListener("click", loadRollsFromLocalStorage);
document.addEventListener("DOMContentLoaded", initializeSortingFunctionality);
document.addEventListener("DOMContentLoaded", function() {
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    if (diceGroupsContainer && diceGroupsContainer.children.length === 0) {
        // If the container exists and has no children, add the initial group
        addDiceGroup();
    }
});

function isDiceGroupEmpty(diceGroup) {
    if (!diceGroup || !diceGroup.diceCounts) {
        return true; // Consider it empty if there's no data
    }
    return Object.entries(diceGroup.diceCounts).every(([key, value]) => key === 'mod' || value === 0);
}

function increment(type) {
    const lastDashIndex = type.lastIndexOf("-");
    const groupId = type.substring(0, lastDashIndex);
    const diceType = type.substring(lastDashIndex + 1);
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
    const lastDashIndex = type.lastIndexOf("-");
    const groupId = type.substring(0, lastDashIndex);
    const diceType = type.substring(lastDashIndex + 1);
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
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    const groupIndex = diceGroupsContainer.children.length;
    
    const diceGroup = document.createElement("div");
    diceGroup.className = "dice-selection";
    diceGroup.id = `${groupIndex}`;
    let diceHTML = "";

    // Add group name input field
    diceHTML += `
        <div class="dice-group-container">
        <div class="dice-group-name">
            <input type="text" class="dice-group-name-input" id="group-${groupIndex}-name" placeholder="Group Name">
        </div>
        <div class="dice-row">
    `;

    // TODO: Put this code back in for the img src
    //<i class="ts-icon-${type} ts-icon-large" onclick="increment('group-${groupIndex}-${type}')" oncontextmenu="decrement('group-${groupIndex}-${type}'); return false;"></i>
    // Add dice counters
    diceTypes.forEach((type) => {
        diceHTML += `
            <div class="dice-counter unselectable" id="group-${groupIndex}-${type}-counter">
            <img src="images/dev icons/dev_${type}.svg" class="debug-icons48" onclick="increment('group-${groupIndex}-${type}')" oncontextmenu="decrement('group-${groupIndex}-${type}'); return false;" />
            <div class="counter-overlay" id="group-${groupIndex}-${type}-counter-value">0</div>
            <div class="dice-label">${type.toUpperCase()}</div>
            </div>
        `;
    });

    // TODO: Put this code back in for the img src
    // <i class="ts-icon-circle-dotted ts-icon-large mod-holder"></i>
    // Add modifier counter
    diceHTML += `
        <div class="plus-sign"><span>+</span></div>
        <div class="dice-counter unselectable" id="group-${groupIndex}-mod-counter">
            <img src="images/dev icons/dev_mod.svg" class="debug-icons48"></img>
            <input type="number" class="counter-overlay mod-counter-overlay" id="group-${groupIndex}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" />
            <div class="dice-label">MOD</div>
        </div>
    `;

    diceGroup.innerHTML = diceHTML;
    diceGroupsContainer.appendChild(diceGroup);

    updateDiceGroupsData();
}

function updateDiceGroupsData() {
    diceGroupsData = [];

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    diceGroupElements.forEach((groupElement) => {
        const groupId = groupElement.id;
        const groupDiceCounts = {};
        const groupNameInput = groupElement.querySelector('.dice-group-name-input');
        const groupName = groupNameInput && groupNameInput.value.trim() ? groupNameInput.value.trim() : `Group ${parseInt(groupId) + 1}`;

        console.log("Group Name in updateDiceGroupsData:", groupName);

        diceTypes.forEach((diceType) => {
            const countElement = groupElement.querySelector(`[id="group-${groupId}-${diceType}-counter-value"]`);
            groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
        });

        const modElement = groupElement.querySelector(`[id="${groupId}-mod-counter-value"]`);
        groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

        console.log("Group Dice Counts in updateDiceGroupsData:", groupDiceCounts);

        diceGroupsData.push({
            name: groupName,
            diceCounts: groupDiceCounts
        });
    });

    // Log full updated diceGroupsData to see if the group name is properly set
    console.log('Updated diceGroupsData:', JSON.stringify(diceGroupsData, null, 2));
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
        const counter = group.querySelector(`#group-${group.id}-${diceType}-counter`);
if (counter) {
    counter.id = `group-${newIndex}-${diceType}-counter`;
    const counterValue = counter.querySelector('.counter-overlay');
    if (counterValue) {
        counterValue.id = `group-${newIndex}-${diceType}-counter-value`;
    }
}

    });

    const modCounter = group.querySelector(`#group-${group.id}-mod-counter`);
if (modCounter) {
    modCounter.id = `group-${newIndex}-mod-counter`;
    const modCounterValue = modCounter.querySelector('.mod-counter-overlay');
    if (modCounterValue) {
        modCounterValue.id = `group-${newIndex}-mod-counter-value`;
    }
}


    // Update onclick attributes
    group.querySelectorAll('.dice-counter').forEach(counter => {
        const diceType = counter.id.split('-')[1];
        counter.querySelector('.ts-icon-large').setAttribute('onclick', `increment('group-${newIndex}-${diceType}')`);
        counter.querySelector('.ts-icon-large').setAttribute('oncontextmenu', `decrement('group-${newIndex}-${diceType}'); return false;`);
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
    const editingRollId = document.body.dataset.editingRollId;
    const rollName = document.getElementById('roll-name').value.trim() || 'Unnamed Roll';

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    savedDiceGroups = [];

    diceGroupElements.forEach((groupElement, index) => {
        const groupId = groupElement.id;
        const groupDiceCounts = {};
        const groupNameInput = groupElement.querySelector(`#group-${groupId}-name`);
        const groupName = groupNameInput && groupNameInput.value.trim() ? groupNameInput.value.trim() : `Group ${index + 1}`;

        diceTypes.forEach((diceType) => {
            const countElement = groupElement.querySelector(
                `.counter-overlay[id$="group-${groupId}-${diceType}-counter-value"]`
            );
            
            groupDiceCounts[diceType] = countElement
                ? parseInt(countElement.textContent, 10)
                : 0;
        });

        const modElement = groupElement.querySelector(
            `.mod-counter-overlay[id$="group-${groupId}-mod-counter-value"]`
        );
        
        groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

        savedDiceGroups.push({
            name: groupName,
            diceCounts: groupDiceCounts
        });
    });

    const rollData = {
        name: rollName,
        groups: savedDiceGroups,
        type: 'normal'
    };

    if (editingRollId) {
        updateSavedRoll(editingRollId, rollData);
    } else {
        addSavedRoll(rollData.name, rollData.groups, rollData.type);
    }

    abortEditing();
    
    if (fetchSetting("auto-reset")) {
        reset();
    }

    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("save-rolls-button", false);
        disableButtonById("load-rolls-button", false);
    }
    
    updateAutoButtons();
}

function showOverwriteModal(rollName) {
    toggleOverlay(true);

    const modal = document.createElement('div');
    modal.className = 'overwrite-modal';
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
        toggleOverlay(false);
        overwriteConfirmed = true;  // Set the flag to true
        save(); // Call save() again to proceed with saving
    });

    document.getElementById('overwrite-no').addEventListener('click', () => {
        document.body.removeChild(modal);
        toggleOverlay(false);
    });
}

function toggleOverlay(show) {
    if (show) {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.style.pointerEvents = 'auto';  // This allows the overlay to receive mouse events
        document.body.appendChild(overlay);
    } else {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
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
    rollEntry.dataset.groupCount = savedDiceGroups.length;
    rollEntry.dataset.rollType = rollType || 'normal';
    rollEntry.dataset.timestamp = Date.now();
    rollEntry.dataset.rollName = rollName;

    console.log("Group Data Passed to addSavedRoll:", savedDiceGroups);

    const diceDisplay = document.createElement("div");
    diceDisplay.className = "roll-entry-dice";

    savedDiceGroups.forEach((group, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "dice-group";
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(group.diceCounts);

        console.log("Group name in addSavedRoll before processing:", group.name);

        const groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;

        console.log("Determined group name in addSavedRoll:", groupName);

        const diceGroupText = Object.entries(group.diceCounts)
            .filter(([diceType, count]) => count > 0 && diceType !== "mod")
            .map(([diceType, count]) => `${count}${diceType}`)
            .join(" + ");

        const modifier = group.diceCounts.mod;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+" : ""}${modifier}` : "";

        console.log("Rendering group:", groupName, "with dice:", diceGroupText);

        groupDiv.textContent = `${groupName}: ${diceGroupText}${modifierText ? ` ${modifierText}` : ""}`;
        diceDisplay.appendChild(groupDiv);
    });

    rollEntry.innerHTML = `
        <div class="roll-entry-header">
            <div class="roll-entry-label">${rollName}</div>
            <div class="saved-rolls-button-container">
                <div class="edit-roll" onclick="startEditingSavedRoll(this)">
                    <i class="ts-icon-pencil ts-icon-medium"></i>
                </div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">
                    <i class="ts-icon-trash ts-icon-medium"></i>
                </div>
            </div>
        </div>
    `;

    rollEntry.appendChild(diceDisplay);

    const rowOfButtons = document.createElement("div");
    rowOfButtons.className = "row-buttons-container";
    rollEntry.appendChild(rowOfButtons);

    const rollData = {
        name: rollName,
        groups: savedDiceGroups,
        type: rollType
    };

    updateRollButtons(rollEntry, rollData);

    if (savedRollsContainer.firstChild) {
        savedRollsContainer.insertBefore(rollEntry, savedRollsContainer.firstChild);
    } else {
        savedRollsContainer.appendChild(rollEntry);
    }

    sortSavedRolls();
}

function startEditingSavedRoll(elementOrId) {
    let rollEntry;
    let rollId;

    if (typeof elementOrId === 'string') {
        rollId = elementOrId;
        rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
    } else if (elementOrId instanceof Element) {
        rollEntry = elementOrId.closest('.saved-roll-entry');
        rollId = rollEntry ? rollEntry.dataset.rollId : null;
    } else {
        console.error('Invalid argument passed to startEditingSavedRoll');
        return;
    }

    if (!rollEntry || !rollId) {
        console.error(`Roll entry not found for ${elementOrId}`);
        return;
    }

    if (document.body.dataset.editingRollId === rollId) {
        abortEditing();
        return;
    }

    if (document.body.dataset.editingRollId) {
        abortEditing();
    }

    const groupCount = parseInt(rollEntry.dataset.groupCount, 10);
    const rollName = rollEntry.dataset.rollName || '';

    const rollNameInput = document.getElementById('roll-name');
    rollNameInput.value = rollName;
    rollNameInput.classList.add('editing');

    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = `Editing . . .`;
        rollLabelElement.classList.add('editing');
    }

    const addGroupButton = document.getElementById('add-group-button');
    const removeGroupButton = document.getElementById('remove-group-button');
    if (addGroupButton) addGroupButton.classList.add('editing');
    if (removeGroupButton) removeGroupButton.classList.add('editing');

    const diceSelectionContainer = document.querySelector('.content-col-dice');
    diceSelectionContainer.innerHTML = '';
    
    for (let i = 0; i < groupCount; i++) {
        addDiceGroup();
        const groupDiv = rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`);
        const groupData = JSON.parse(groupDiv.dataset.diceCounts);
        const groupName = groupDiv.textContent.split(':')[0].trim();
        
        const groupNameInput = document.getElementById(`group-${i}-name`);
        if (groupNameInput) {
            groupNameInput.value = groupName;
            groupNameInput.classList.add('editing');  // Add 'editing' class to group name input
        }
        
        diceTypes.forEach(diceType => {
            const countElement = document.getElementById(`group-${i}-${diceType}-counter-value`);
            if (countElement) {
                countElement.textContent = groupData[diceType] || '0';
            }
        });
        
        const modElement = document.getElementById(`group-${i}-mod-counter-value`);
        if (modElement) {
            modElement.value = groupData.mod || '0';
        }
    }
    
    window.scrollTo(0, 0);
    document.body.dataset.editingRollId = rollId;
    rollEntry.classList.add('editing');
    const editButton = rollEntry.querySelector('.edit-roll');
    if (editButton) editButton.classList.add('editing');
}

function editSavedRoll(elementOrId) {
    let rollEntry;
    let rollId;

    if (document.body.dataset.editingRollId === rollId) {
        abortEditing();
        return;
    }

    if (document.body.dataset.editingRollId) {
        abortEditing();
    }

    const groupCount = parseInt(rollEntry.dataset.groupCount, 10);

    const rollNameInput = document.getElementById('roll-name');
    rollNameInput.classList.add('editing');

    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = `Editing . . .`;
        rollLabelElement.classList.add('editing');
    }

    const addGroupButton = document.getElementById('add-group-button');
    const removeGroupButton = document.getElementById('remove-group-button');
    if (addGroupButton) addGroupButton.classList.add('editing');
    if (removeGroupButton) removeGroupButton.classList.add('editing');

    const diceSelectionContainer = document.querySelector('.content-col-dice');
    diceSelectionContainer.innerHTML = '';
    
    for (let i = 0; i < groupCount; i++) {
        addDiceGroup();
        const groupDiv = rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`);
        const groupData = JSON.parse(groupDiv.dataset.diceCounts);
        const groupName = groupDiv.textContent.split(':')[0].trim();
        
        // Use the new ID format for the group name input
        const groupNameInput = document.getElementById(`group-${i}-name`);
        if (groupNameInput) {
            groupNameInput.value = groupName;
        }
        
        diceTypes.forEach(diceType => {
            const countElement = document.getElementById(`group-${i}-${diceType}-counter-value`);
            if (countElement) {
                countElement.textContent = groupData[diceType] || '0';
            }
        });
        
        const modElement = document.getElementById(`group-${i}-mod-counter-value`);
        if (modElement) {
            modElement.value = groupData.mod || '0';
        }
    }
    
    window.scrollTo(0, 0);
    
    document.body.dataset.editingRollId = rollId;

    rollEntry.classList.add('editing');
    element.classList.add('editing');
}

function updateSavedRoll(rollId, rollData) {
    const rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
    if (!rollEntry) {
        console.error(`Roll entry with ID ${rollId} not found`);
        return;
    }

    rollEntry.querySelector('.roll-entry-label').textContent = rollData.name;
    rollEntry.dataset.rollName = rollData.name;

    const diceDisplay = rollEntry.querySelector('.roll-entry-dice');
    diceDisplay.innerHTML = '';
    rollData.groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'dice-group';
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(group.diceCounts);

        const diceGroupText = Object.entries(group.diceCounts)
            .filter(([diceType, count]) => count > 0 && diceType !== "mod")
            .map(([diceType, count]) => `${count}${diceType}`)
            .join(" + ");

        const modifier = group.diceCounts.mod;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+" : ""}${modifier}` : "";
        console.log("Group name in addSavedRoll before processing:", group.name);

        // const groupName = group.name || `Group ${index + 1}`;
        const groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;


        groupDiv.textContent = `${groupName}: ${diceGroupText}${modifierText ? ` ${modifierText}` : ""}`;
        diceDisplay.appendChild(groupDiv);
    });

    rollEntry.dataset.groupCount = rollData.groups.length;

    updateRollButtons(rollEntry, rollData);

    rollEntry.dataset.timestamp = Date.now();

    rollEntry.classList.remove('editing');
    const editButton = rollEntry.querySelector('.edit-roll');
    if (editButton) editButton.classList.remove('editing');
    delete document.body.dataset.editingRollId;
}

function abortEditing() {
    const editingRollId = document.body.dataset.editingRollId;
    if (editingRollId) {
        const editingRollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${editingRollId}"]`);
        if (editingRollEntry) {
            editingRollEntry.classList.remove('editing');
            const editButton = editingRollEntry.querySelector('.edit-roll');
            if (editButton) editButton.classList.remove('editing');
        }
        delete document.body.dataset.editingRollId;
    }

    // Reset the roll name input and label
    const rollNameInput = document.getElementById('roll-name');
    rollNameInput.classList.remove('editing');

    const rollLabelElement = document.querySelector('label[for="roll-name"]');
    if (rollLabelElement) {
        rollLabelElement.textContent = 'Roll Label';
        rollLabelElement.classList.remove('editing');
    }

    // Remove editing class from group name inputs
    const groupNameInputs = document.querySelectorAll('.dice-group-name-input');
    groupNameInputs.forEach(input => {
        input.classList.remove('editing');
    });

    // Remove editing class from Add Group and Remove Group buttons
    const addGroupButton = document.getElementById('add-group-button');
    const removeGroupButton = document.getElementById('remove-group-button');
    if (addGroupButton) addGroupButton.classList.remove('editing');
    if (removeGroupButton) removeGroupButton.classList.remove('editing');
}

function updateRollButtons(rollEntry, rollData) {
    const rowOfButtons = rollEntry.querySelector('.row-buttons-container');
    if (!rowOfButtons) {
        console.error('Row of buttons container not found in roll entry');
        return;
    }

    rowOfButtons.innerHTML = ''; // Clear existing buttons
    
    createRollButton("rolling", "normal", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("advantage", "advantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("disadvantage", "disadvantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("best-of-three", "best-of-three", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("crit", "crit-dice", rollData.groups, "roll-button row-button", rowOfButtons);
}

function createRollButton(imageName, rollType, rollGroups, classes, parent) {
    const rollButton = document.createElement("div");
    rollButton.className = classes;
    rollButton.onclick = function () {
        if (!Array.isArray(rollGroups) || rollGroups.length === 0 || rollGroups.every(isDiceGroupEmpty)) {
            console.error('Attempted to roll an empty or invalid saved roll');
            return;
        }
        rollsModule.roll(rollType, rollGroups);
    };

    const imageIcon = document.createElement("img");
    imageIcon.src = `./images/icons/${imageName}.png`;
    imageIcon.className = "roll-type-image";
    rollButton.appendChild(imageIcon);

    if (parent && typeof parent.appendChild === 'function') {
        parent.appendChild(rollButton);
    } else {
        console.error('Invalid parent element provided to createRollButton');
    }

    return rollButton;
}

function reset() {
    document.getElementById("roll-name").value = "";

    diceGroupsData.forEach((group, index) => {
        // Reset group name
        const groupNameInput = document.getElementById(`group-${index}-name`);
        if (groupNameInput) groupNameInput.value = "";

        diceTypes.forEach((type) => {
            const counter = document.getElementById(
                `group-${index}-${type}-counter-value`
            );
            const modCounter = document.getElementById(
                `group-${index}-mod-counter-value`
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

    // Reset diceGroupsData to contain only one empty group
    diceGroupsData = [{
        name: "",
        diceCounts: Object.fromEntries(diceTypes.map(type => [type, 0]).concat([['mod', 0]]))
    }];

    // Update the data to ensure consistency between UI and data
    updateDiceGroupsData();
}

function disableButtonById(id, disable = true) {
    document.getElementById(id).disabled = disable;
}