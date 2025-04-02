// TODO: Split this file into multiple files for better organization: AddRemove, Edit, Reset, Sort

document.addEventListener("DOMContentLoaded", updateDiceGroupsData);
document.addEventListener("DOMContentLoaded", sortSavedRolls);
document.getElementById("save-rolls-button").addEventListener("click", saveRollsToLocalStorage);
document.getElementById("load-rolls-button").addEventListener("click", loadRollsFromLocalStorage);
document.addEventListener("DOMContentLoaded", initializeSortingFunctionality);
document.addEventListener("DOMContentLoaded", function () {
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    if (diceGroupsContainer && diceGroupsContainer.children.length === 0) { // If there are no dice groups, add a new dice group
        addDiceGroup();
    }
});

/**
 * Checks if a dice group is empty.
 *
 * A dice group is considered empty if it is null, undefined, or if all dice counts are zero
 * (excluding the 'mod' key).
 *
 * @param {Object} diceGroup - The dice group to check.
 * @returns {boolean} - Returns true if the dice group is empty, otherwise false.
 */
function isDiceGroupEmpty(diceGroup) {
    if (!diceGroup || !diceGroup.diceCounts) {
        return true; // Consider it empty if there's no data
    }
    return Object.entries(diceGroup.diceCounts).every(([key, value]) => key === 'mod' || value === 0);
}


/**
 * Increments the dice counter value for a given dice type.
 *
 * @param {string} type - The type of dice in the format "groupId-diceType".
 *                        Example: "group1-d6" where "group1" is the groupId and "d6" is the diceType.
 * 
 * The function extracts the groupId and diceType from the provided type string,
 * constructs the counter element's ID, and increments its value by 1 if it is less than 50.
 * If the counter element is not found, an error is logged to the console.
 */
function incrementDice(type) {
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


/**
 * Decrements the dice count for a specified type.
 *
 * @param {string} type - The type of dice to decrement, formatted as "groupId-diceType".
 *                        For example, "group1-d6" where "group1" is the groupId and "d6" is the diceType.
 * 
 * The function extracts the groupId and diceType from the provided type string,
 * constructs the counter element's ID, and decrements its value by 1 if it is greater than 0.
 * If the counter element is not found, an error is logged to the console.
 */
function decrementDice(type) {
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

function addDiceGroup() {
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    const groupIndex = diceGroupsContainer.children.length;

    const wrapper = document.createElement("div");
    wrapper.className = "dice-group-wrapper";

    const accordionHeader = document.createElement("div");
    accordionHeader.className = "dice-group-header";
    accordionHeader.innerHTML = `
    <span class="group-title" id="accordion-title-${groupIndex}">New Group</span>
    <span class="accordion-toggle" onclick="toggleDiceGroupAccordion(event)">v</span>
`;


    const content = document.createElement("div");
    content.className = "dice-selection";
    content.id = `${groupIndex}`;

    let diceHTML = `
        <div class="dice-group-container">
            <div class="dice-group-name">
                <input type="text" style="margin-top: 5px;" class="dice-group-name-input" id="group-${groupIndex}-name" placeholder="Group Name" 
                    oninput="document.getElementById('accordion-title-${groupIndex}').textContent = this.value || 'New Group';">
            </div>
            <div class="dice-row">
    `;

    diceTypes.forEach((type) => {
        diceHTML += `
            <div class="dice-counter unselectable" id="group-${groupIndex}-${type}-counter">
                <i class="ts-icon-${type} ts-icon-large" onclick="incrementDice('group-${groupIndex}-${type}')" 
                oncontextmenu="decrementDice('group-${groupIndex}-${type}'); return false;"></i>
                <div class="counter-overlay" id="group-${groupIndex}-${type}-counter-value">0</div>
                <div class="dice-label">${type.toUpperCase()}</div>
            </div>
        `;
    });

    diceHTML += `
        <div class="plus-sign"><span>+</span></div>
        <div class="dice-counter unselectable" id="group-${groupIndex}-mod-counter">
            <i class="ts-icon-circle-dotted ts-icon-large mod-holder"></i>
            <input type="number" class="counter-overlay mod-counter-overlay" 
            id="group-${groupIndex}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" />
            <div class="dice-label">MOD</div>
        </div>
    `;

    content.innerHTML = diceHTML;
    wrapper.appendChild(accordionHeader);
    wrapper.appendChild(content);
    diceGroupsContainer.appendChild(wrapper);

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

        if (debugMode) { // If debug mode is enabled, log the group name to the console
            console.log("Group Name in updateDiceGroupsData:", groupName);
        };

        diceTypes.forEach((diceType) => {
            const countElement = groupElement.querySelector(`[id="group-${groupId}-${diceType}-counter-value"]`);
            groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
        });

        const modElement = groupElement.querySelector(`[id="${groupId}-mod-counter-value"]`);
        groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

        if (debugMode) { // If debug mode is enabled, log the group name and dice counts to the console
            console.log("Group Dice Counts in updateDiceGroupsData:", groupDiceCounts);
        };

        diceGroupsData.push({
            name: groupName,
            diceCounts: groupDiceCounts
        });
    });

    if (debugMode) { // If debug mode is enabled, log the updated dice groups data to the console
        console.log('Updated diceGroupsData:', JSON.stringify(diceGroupsData, null, 2));
    };
}

function removeDiceGroup() {
    updateDiceGroupsData();
    const wrappers = document.querySelectorAll('.dice-group-wrapper');
    
    if (wrappers.length > 1) {
        const lastWrapper = wrappers[wrappers.length - 1];
        lastWrapper.remove();
        diceGroupsData.pop();

        // Renumber remaining groups
        const updatedWrappers = document.querySelectorAll('.dice-group-wrapper');
        updatedWrappers.forEach((wrapper, index) => {
            const groupId = `${index}`;
            const input = wrapper.querySelector('.dice-group-name-input');
            const title = wrapper.querySelector('.group-title');
            const content = wrapper.querySelector('.dice-selection');

            // Update IDs and input handlers
            if (input) {
                input.id = `group-${groupId}-name`;
                input.setAttribute('oninput', `document.getElementById('accordion-title-${groupId}').textContent = this.value || 'New Group';`);
            }

            if (title) {
                title.id = `accordion-title-${groupId}`;
            }

            if (content) {
                content.id = groupId;
            }

            updateGroupElementIds(wrapper, index);
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
        counter.querySelector('.ts-icon-large').setAttribute('onclick', `incrementDice('group-${newIndex}-${diceType}')`);
        counter.querySelector('.ts-icon-large').setAttribute('oncontextmenu', `decrementDice('group-${newIndex}-${diceType}'); return false;`);
    });
}

/**
 * Updates the sorting functionality to handle the accordion structure.
 * 
 * This function modifies the existing sorting to respect the accordion groups
 * while still sorting rolls by the selected criteria.
 */
function sortSavedRolls() {
    if (debugMode) {
        console.log("Sorting saved rolls...");
    }
    
    const sortOption = document.getElementById("sort-options").value;
    const savedRollsContainer = document.querySelector(".saved-rolls-container");
    
    if (!savedRollsContainer) {
        if (debugMode) {
            console.error("Saved rolls container not found");
        }
        return;
    }

    // Get all creature groups
    const creatureGroups = Array.from(savedRollsContainer.querySelectorAll('.saved-roll-group'));
    
    if (debugMode) {
        console.log("Number of creature groups:", creatureGroups.length);
    }

    // Sort the creature groups alphabetically by creature name
    creatureGroups.sort((a, b) => {
        const aName = a.dataset.creatureName;
        const bName = b.dataset.creatureName;
        return aName.localeCompare(bName);
    });

    // For each creature group, sort the rolls inside according to the selected option
    creatureGroups.forEach(group => {
        const rollsContent = group.querySelector('.saved-rolls-content');
        const rolls = Array.from(rollsContent.querySelectorAll('.saved-roll-entry'));
        
        switch (sortOption) {
            case "newest":
                rolls.sort((a, b) => {
                    return parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp);
                });
                break;
            case "oldest":
                rolls.sort((a, b) => {
                    return parseInt(a.dataset.timestamp) - parseInt(b.dataset.timestamp);
                });
                break;
            case "nameAsc":
                rolls.sort((a, b) => {
                    const aName = a.querySelector(".roll-entry-label")?.textContent || "";
                    const bName = b.querySelector(".roll-entry-label")?.textContent || "";
                    return aName.localeCompare(bName);
                });
                break;
            case "nameDesc":
                rolls.sort((a, b) => {
                    const aName = a.querySelector(".roll-entry-label")?.textContent || "";
                    const bName = b.querySelector(".roll-entry-label")?.textContent || "";
                    return bName.localeCompare(aName);
                });
                break;
        }

        // Clear and re-append the sorted rolls
        rollsContent.innerHTML = "";
        rolls.forEach(roll => rollsContent.appendChild(roll));
    });

    // Clear and re-append the creature groups
    savedRollsContainer.innerHTML = "";
    creatureGroups.forEach(group => savedRollsContainer.appendChild(group));
    
    if (debugMode) {
        console.log("Sorting complete");
    }
}

function initializeSortingFunctionality() {
    const sortOptions = document.getElementById("sort-options");
    if (sortOptions) {
        sortOptions.addEventListener("change", sortSavedRolls);
    } else {
        console.error("Sort options element not found");
    }
}

/**
 * Deletes a saved roll and handles accordion updates.
 * 
 * This function removes a roll entry and checks if its parent accordion
 * should also be removed when empty.
 * 
 * @param {Element} element - The delete button element that was clicked.
 */
function deleteSavedRoll(element) {
    const rollEntry = element.closest(".saved-roll-entry");
    const creatureGroup = rollEntry.closest(".saved-roll-group");
    
    rollEntry.remove();
    savedInVault = savedInVault.filter((roll) => roll !== rollEntry);

    // Check if this was the last roll for this creature
    const remainingRolls = creatureGroup.querySelectorAll('.saved-roll-entry');
    if (remainingRolls.length === 0) {
        creatureGroup.remove();
    }

    if (fetchSetting("auto-save")) {
        saveRollsToLocalStorage();
    } else {
        disableButtonById("load-rolls-button", false);
        disableButtonById("save-rolls-button", false);
    }
}

function save() {
    const editingRollId = document.body.dataset.editingRollId;
    const creatureName = document.getElementById('creature-name').value.trim() || 'Unnamed Roll';

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    savedDiceGroups = [];
    
    if (debugMode) {
        console.group("Save()")
        console.log(creatureName);
        console.log("savedDiceGroups[] should be empty:", savedDiceGroups);
        console.groupEnd();
    }

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

        if (debugMode) {
            console.group("Saved().savedDiceGroups[]");
            console.log("savedDiceGroups[]:", savedDiceGroups);
            console.groupEnd();
        }
    });

    const rollData = {
        name: creatureName,
        groups: savedDiceGroups,
        type: 'normal'
    };

    if (editingRollId) {
        updateSavedRoll(editingRollId, rollData);
        if(debugMode) {
            console.group("Editing Roll");
            console.log("Editing roll:", editingRollId);
            console.log("Roll data:", rollData);
            console.groupEnd();
        }
    } else {
        addSavedRoll(rollData.name, rollData.groups, rollData.type);
        if(debugMode) {
            console.group("Adding Roll");
            console.log("Editing roll:", editingRollId);
            console.log("Roll data:", rollData);
            console.groupEnd();
        }
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

function showOverwriteModal(creatureName) {
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
        <p>Overwrite "${creatureName}"?</p>
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

function creatureNameExists(creatureName) {
    const savedCreatures = document.querySelectorAll('.saved-roll-entry');
    const exists = Array.from(savedCreatures).some(roll => roll.dataset.creatureName === creatureName);
    
    if(debugMode) {
        console.log("Creature name already exists:", creatureName);
    }
    
    return exists;
}

/**
 * Adds a saved roll to the appropriate creature accordion group.
 *
 * This function organizes saved rolls by creature name in collapsible accordion sections.
 * If an accordion for the specified creature already exists, the roll is added to that section.
 * Otherwise, a new accordion section is created for the creature.
 *
 * @param {string} creatureName - The name of the creature for which the roll is being saved.
 * @param {Array} savedDiceGroups - Array of dice group objects containing dice counts and group names.
 * @param {string} rollType - The type of roll (normal, advantage, etc.).
 */
function addSavedRoll(creatureName, savedDiceGroups, rollType) {
    const savedRollsContainer = document.querySelector(".saved-rolls-container");
    
    if (!savedRollsContainer) {
        console.error("Saved rolls container not found");
        return;
    }

    // Check if an accordion group for this creature already exists
    let creatureGroup = document.querySelector(`.saved-roll-group[data-creature-name="${creatureName}"]`);

    if (!creatureGroup) {
        // Create new accordion section for this creature
        creatureGroup = document.createElement("div");
        creatureGroup.className = "saved-roll-group";
        creatureGroup.dataset.creatureName = creatureName;
    
        // Create collapsible header for the creature
        creatureGroup.innerHTML = `
            <div class="saved-roll-header" onclick="toggleAccordion(this)">
                <span>${creatureName}</span> <span class="accordion-icon">-</span>
            </div>
            <div class="saved-rolls-content"></div>
        `;
    
        savedRollsContainer.appendChild(creatureGroup);
    }

    const rollsContent = creatureGroup.querySelector(".saved-rolls-content");

    // Create the saved roll entry inside the correct group
    const creatureEntry = document.createElement("div"); 
    creatureEntry.className = "saved-roll-entry"; 
    const rollId = `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Preserve all existing dataset properties
    creatureEntry.dataset.creatureName = creatureName;
    creatureEntry.dataset.rollId = rollId;
    creatureEntry.dataset.groupCount = savedDiceGroups.length;
    creatureEntry.dataset.rollType = rollType || 'normal';
    creatureEntry.dataset.timestamp = Date.now();

    if (debugMode) {
        console.group("addSavedRoll()");
        console.log("Creature Name:", creatureEntry.dataset.creatureName);
        console.log("Roll ID:", creatureEntry.dataset.rollId);
        console.log("Roll group count:", creatureEntry.dataset.groupCount);
        console.log("Roll Type:", creatureEntry.dataset.rollType);
        console.log("Roll timestamp:", creatureEntry.dataset.timestamp);
        console.groupEnd();
        console.log("addSavedRoll(): Group Data Passed to addSavedRoll():", savedDiceGroups);
    }

    const diceDisplay = document.createElement("div"); 
    diceDisplay.className = "roll-entry-dice"; 

    savedDiceGroups.forEach((group, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "dice-group";
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(group.diceCounts);

        const groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;
        const diceGroupText = Object.entries(group.diceCounts)
            .filter(([diceType, count]) => count > 0 && diceType !== "mod")
            .map(([diceType, count]) => `${count}${diceType}`)
            .join(" + ");

        const modifier = group.diceCounts.mod;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+ " : ""}${modifier}` : "";

        if (debugMode) {
            console.log("Rendering group:", groupName, "with dice:", diceGroupText);
        }

        // Create a span for the dice info to allow styling
        const groupNameSpan = document.createElement("span");
        groupNameSpan.className = "dice-group-name-text";
        groupNameSpan.textContent = groupName;
        
        const diceInfoSpan = document.createElement("span");
        diceInfoSpan.className = "dice-info";
        diceInfoSpan.textContent = `: ${diceGroupText}${modifierText ? ` ${modifierText}` : ""}`;
        
        groupDiv.appendChild(groupNameSpan);
        groupDiv.appendChild(diceInfoSpan);
        diceDisplay.appendChild(groupDiv);
    });

    // Set up the roll entry with its label and buttons
    const editIcon = devMode ? '<img src="images/dev_icons/dev_pencil.png" class="debug-icons16">' : '<i class="ts-icon-pencil ts-icon-xsmall"></i>';
    const deleteIcon = devMode ? '<img src="images/dev_icons/dev_trash." class="debug-icons16">' : '<i class="ts-icon-trash ts-icon-xsmall"></i>';

    creatureEntry.innerHTML = `
        <div class="roll-entry-header">
            <div class="saved-rolls-button-container">
                <div class="edit-roll" onclick="startEditingSavedRoll(this)">${editIcon}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">${deleteIcon}</div>
            </div>
        </div>
        <div class="roll-entry-dice-container"></div>
    `;

    // Add the dice display to the container
    const diceContainer = creatureEntry.querySelector('.roll-entry-dice-container');
    diceContainer.appendChild(diceDisplay);

    const rowOfButtons = document.createElement("div"); 
    rowOfButtons.className = "row-buttons-container"; 
    creatureEntry.appendChild(rowOfButtons); 

    const rollData = { 
        name: creatureName,
        groups: savedDiceGroups,
        type: rollType
    };

    if (debugMode) {
        console.group("addSavedRoll(): rollData");
        console.log("Roll data:", rollData);
        console.groupEnd();
    }

    updateRollButtons(creatureEntry, rollData);

    // Append to the correct creature accordion group
    rollsContent.appendChild(creatureEntry);

    // Ensure rolls remain sorted
    sortSavedRolls();
}


function startEditingSavedRoll(elementOrId) { // Function to start editing a saved roll
    let rollEntry;
    let rollId;

    if (typeof elementOrId === 'string') { // If the argument is a string, assume it's the roll ID, then find the roll entry and roll ID
        rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
        rollId = elementOrId;
    } else if (elementOrId instanceof Element) { // If the argument is an element, assume it's the edit button, then find the roll entry and roll ID
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

    const rollNameInput = document.getElementById('creature-name'); // Get the input field for the creature name
    rollNameInput.value = rollName; // Set the value of the creature name input field to the creature name of the saved roll so the user can edit it
    rollNameInput.classList.add('editing'); // Add the "editing" CSS class to the creature name input field

    const creatureLabelElement = document.querySelector('label[for="creature-name"]'); // Get the label for the creature name input field
    if (creatureLabelElement) { // If the label exists then set the text content to "Editing . . ." and add the "editing" CSS class
        creatureLabelElement.textContent = `Editing . . .`;
        creatureLabelElement.classList.add('editing');
    }

    // TODO: Simpllify this to just be if (document.getElementById('add-group-button')) if possible. We're not using the variables anywhere else, no need to store them
    const addGroupButton = document.getElementById('add-group-button'); // delete this
    const removeGroupButton = document.getElementById('remove-group-button'); // delete this
    if (addGroupButton) {
        addGroupButton.classList.add('editing');
    }
    if (removeGroupButton) {
        removeGroupButton.classList.add('editing');
    }

    // TODO: This name sucks. I don't know what it is referring to by name alone.
    const diceSelectionContainer = document.querySelector('.content-col-dice');
    diceSelectionContainer.innerHTML = '';
    
    // TOOD: This needs to be updated to the new accordion design
    for (let i = 0; i < groupCount; i++) { // Iterate over each group in the saved roll and create a new dice group div for each one
        addDiceGroup(); // In theory this will be updated to the accordion design already
        const groupDiv = rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`); // Get the dice group div for the current group index
        const groupData = JSON.parse(groupDiv.dataset.diceCounts); // Parse the dice counts from the data attribute of the dice group div and store it in groupData
        const groupName = groupDiv.textContent.split(':')[0].trim(); // Get the group name from the dice group div and trim any whitespace from the beginning and end then store it in groupName
        
        const groupNameInput = document.getElementById(`group-${i}-name`);
        if (groupNameInput) { // If the group name input field exists then set the value to the group name and add the "editing" CSS class
            groupNameInput.value = groupName;
            groupNameInput.classList.add('editing');
        }
        
        diceTypes.forEach(diceType => { // Iterate over each dice type and update the count for each type in the dice group
            const countElement = document.getElementById(`group-${i}-${diceType}-counter-value`);
            if (countElement) { // If the count element exists then set the text content to the count for the current dice type or 0 if it doesn't exist
                countElement.textContent = groupData[diceType] || '0';
            }
        });
        
        const modElement = document.getElementById(`group-${i}-mod-counter-value`);
        if (modElement) { // If the mod element exists then set the value to the mod for the current group or 0 if it doesn't exist
            modElement.value = groupData.mod || '0';
        }
    }
    
    window.scrollTo(0, 0); // Scroll to the top of the page. We do this if you're editing a saved creature or roll where the edit form is off the top of the screen
    document.body.dataset.editingRollId = rollId;
    rollEntry.classList.add('editing');
    const editButton = rollEntry.querySelector('.edit-roll');
    if (editButton) { // If the edit button exists then add the "editing" CSS class
        editButton.classList.add('editing');
    }
}

/**
 * Updates a saved roll with new data.
 * 
 * This function updates an existing roll entry with new data. It also handles
 * updating the accordion structure if the creature name has changed.
 * 
 * @param {string} rollId - The ID of the roll to update.
 * @param {Object} rollData - The new roll data.
 */
function updateSavedRoll(rollId, rollData) {
    const rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
    if (!rollEntry) {
        console.error(`Roll entry with ID ${rollId} not found`);
        return;
    }

    const oldCreatureName = rollEntry.dataset.creatureName;
    const newCreatureName = rollData.name;
    
    // Update roll label
    rollEntry.querySelector('.roll-entry-label').textContent = rollData.groups[0].name || "Unnamed Roll";
    rollEntry.dataset.creatureName = newCreatureName;

    // Update dice display
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
        
        if (debugMode) {
            console.log("Group name in updateSavedRoll before processing:", group.name);
        }

        const groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;

        // Create spans for styled content
        const groupNameSpan = document.createElement("span");
        groupNameSpan.className = "dice-group-name-text";
        groupNameSpan.textContent = groupName;
        
        const diceInfoSpan = document.createElement("span");
        diceInfoSpan.className = "dice-info";
        diceInfoSpan.textContent = `: ${diceGroupText}${modifierText ? ` ${modifierText}` : ""}`;
        
        groupDiv.appendChild(groupNameSpan);
        groupDiv.appendChild(diceInfoSpan);
        
        diceDisplay.appendChild(groupDiv);
    });

    rollEntry.dataset.groupCount = rollData.groups.length;

    updateRollButtons(rollEntry, rollData);

    rollEntry.dataset.timestamp = Date.now();

    // If the creature name has changed, move the roll to the correct accordion group
    if (oldCreatureName !== newCreatureName) {
        const oldCreatureGroup = rollEntry.closest('.saved-roll-group');
        
        // Check if a group for the new creature name already exists
        let newCreatureGroup = document.querySelector(`.saved-roll-group[data-creature-name="${newCreatureName}"]`);
        
        if (!newCreatureGroup) {
            // Create a new accordion group for this creature
            newCreatureGroup = document.createElement("div");
            newCreatureGroup.className = "saved-roll-group";
            newCreatureGroup.dataset.creatureName = newCreatureName;
            
            newCreatureGroup.innerHTML = `
                <div class="saved-roll-header" onclick="toggleAccordion(this)">
                    <span>${newCreatureName}</span> <span class="accordion-icon">-</span>
                </div>
                <div class="saved-rolls-content"></div>
            `;
            
            const savedRollsContainer = document.querySelector(".saved-rolls-container");
            savedRollsContainer.appendChild(newCreatureGroup);
        }
        
        // Move the roll entry to the new group
        const newRollsContent = newCreatureGroup.querySelector('.saved-rolls-content');
        newRollsContent.appendChild(rollEntry);
        
        // If old group is now empty, remove it
        const remainingRolls = oldCreatureGroup.querySelectorAll('.saved-roll-entry');
        if (remainingRolls.length === 0) {
            oldCreatureGroup.remove();
        }
        
        // Re-sort all rolls
        sortSavedRolls();
    }

    rollEntry.classList.remove('editing');
    const editButton = rollEntry.querySelector('.edit-roll');
    if (editButton) {
        editButton.classList.remove('editing');
    }
    
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

    // Reset the creature name input and label
    const creatureNameInput = document.getElementById('roll-name');
    creatureNameInput.classList.remove('editing');

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

function updateRollButtons(rollEntry, rollData) { // Function to update the roll buttons for a saved roll
    const rowOfButtons = rollEntry.querySelector('.row-buttons-container');
    if (!rowOfButtons) { // If the row of buttons container doesn't exist then log an error and return
        console.error('Row of buttons container not found in roll entry');
        return;
    }

    rowOfButtons.innerHTML = '';
    
    createRollButton("rolling", "normal", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("advantage", "advantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("disadvantage", "disadvantage", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("best-of-three", "best-of-three", rollData.groups, "roll-button row-button", rowOfButtons);
    createRollButton("crit", "crit-dice", rollData.groups, "roll-button row-button", rowOfButtons);
}

function createRollButton(imageName, rollType, rollGroups, cssClasses, parent) { // Function to create a roll button for a saved roll
    const rollButton = document.createElement("div"); // Create a new div element to hold the roll button
    rollButton.className = cssClasses; // Assign the appropriate CSS classes to the roll button before creating it
    rollButton.onclick = function () { // Add an onclick event listener to the roll button to roll the dice group
        if (!Array.isArray(rollGroups) || rollGroups.length === 0 || rollGroups.every(isDiceGroupEmpty)) { // If the roll groups array is not an array or is empty or all the dice groups are empty then log an error and return
            console.error('Attempted to roll an empty or invalid saved roll');
            return;
        }
        rollsModule.roll(rollType, rollGroups); // Roll the dice group with the specified roll type and dice groups
    };

    // Creating the image icon for the roll button and adding the css class then appending it to the roll button
    const imageIcon = document.createElement("img");
    imageIcon.src = `./images/icons/${imageName}.png`;
    imageIcon.className = "roll-type-image";
    rollButton.appendChild(imageIcon);

    if (parent && typeof parent.appendChild === 'function') { // If the parent element exists and has an appendChild function then append the roll button to the parent element
        parent.appendChild(rollButton);
    } else {
        console.error('Invalid parent element provided to createRollButton');
    }

    return rollButton;
}

function reset() { // Function to reset the dice roller to its default state
    document.getElementById("creature-name").value = "";

    diceGroupsData.forEach((group, index) => { // Iterate over each dice group and reset the group name, dice counts, and modifier
        const groupNameInput = document.getElementById(`group-${index}-name`);
        if (groupNameInput) { // If the group name input field exists then set the value to an empty string
            groupNameInput.value = "";
        }

        diceTypes.forEach((type) => { // Iterate over each dice type and reset the count for each type to 0
            const counter = document.getElementById(`group-${index}-${type}-counter-value`);
            const modCounter = document.getElementById(`group-${index}-mod-counter-value`);
            
            // TODO: Can I skip storing the value and go straight to querying the element and if it's found, set it to 0?
            if (counter) {
                ounter.textContent = "0";
            }
            if (modCounter) {
                modCounter.value = "0";
            }
        });

        if (index > 0) { // If the index is greater than 0 then remove the dice group. We preserve group 0 as the default group so we don't end up with an empty dice roller
            const diceRow = document.getElementById(`${index}`);
            if (diceRow) {
                diceRow.remove();
            }
        }
    });

    // Reset diceGroupsData to contain only one empty group
    diceGroupsData = [{
        name: "",
        diceCounts: Object.fromEntries(diceTypes.map(type => [type, 0]).concat([['mod', 0]])) // Create an object with the dice types and modifier set to 0
    }];

    updateDiceGroupsData();
}

/**
 * Function to disable a button by its ID. We use this against the save/load buttons when auto-load and auto-save is enabled
 * @param {string} id - The ID of the button to disable 
 * @param {bool} disable - Whether to disable the button or not. Default is true
 */
function disableButtonById(id, disable = true) {
    document.getElementById(id).disabled = disable;
}

/**
 * Toggles the visibility of a creature's roll group when clicked.
 *
 * This function handles the expansion and collapse of an accordion section
 * containing saved rolls for a specific creature. It changes the display
 * property of the content section and updates the accordion icon to reflect
 * the current state (+ for collapsed, - for expanded).
 *
 * @param {Element} header - The clicked accordion header element.
 */
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    header.querySelector(".accordion-icon").textContent = isHidden ? "-" : "+";
}

function toggleDiceGroupAccordion(event) {
    const header = event.target.closest('.dice-group-header');
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-toggle');
    if (content.style.display === 'none') {
        content.style.display = 'flex';
        icon.textContent = 'v';
    } else {
        content.style.display = 'none';
        icon.textContent = '^';
    }
}
