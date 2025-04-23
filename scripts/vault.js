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

function isDiceGroupEmpty(diceGroup) {
    if (!diceGroup || !diceGroup.diceCounts) {
        return true; // Consider it empty if there's no data
    }
    
    // Check if any dice type has a non-zero count
    // We need to check all possible dice types since some might be missing
    return !diceTypes.some(diceType => {
        const count = diceGroup.diceCounts[diceType] || 0;
        return count > 0;
    }) && (!diceGroup.diceCounts.mod || diceGroup.diceCounts.mod === 0);
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

// In vault.js - replace the current addDiceGroup function with this improved version
function addDiceGroup() {
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    const groupIndex = diceGroupsContainer.children.length;

    const wrapper = document.createElement("div");
    wrapper.className = "dice-group-wrapper";

    const accordionHeader = document.createElement("div");
    accordionHeader.className = "dice-group-header";
    accordionHeader.innerHTML = `
        <div class="header-content">
            <input type="text" class="dice-group-name-input header-input" id="group-${groupIndex}-name" 
                placeholder="Group Name" value="New Group">
        </div>
        <span class="accordion-toggle">-</span>
    `;

    accordionHeader.addEventListener('click', function(event) {
        // Skip if we're clicking on the input
        if (event.target.classList.contains('header-input') || 
            event.target.classList.contains('dice-group-name-input')) {
            return;
        }
        toggleDiceGroupAccordion(event);
    });

    const content = document.createElement("div");
    content.className = "dice-selection";
    content.id = `${groupIndex}`;

    let diceHTML = `
        <div class="dice-group-container">
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
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Make sure the content is fully visible immediately
    content.classList.remove('collapsed');
    content.style.display = 'flex';
    content.style.maxHeight = 'none'; // Allow natural height

    // accordionHeader.querySelector('.accordion-toggle').textContent = 'V';
    accordionHeader.querySelector('.accordion-toggle').textContent = '-';

    updateDiceGroupsData();
}

function updateDiceGroupsData() {
    diceGroupsData = [];

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    diceGroupElements.forEach((groupElement) => {
        const groupId = groupElement.id;
        const groupDiceCounts = {};
        
        // Find the wrapper and header for this group
        const wrapper = groupElement.closest('.dice-group-wrapper');
        const header = wrapper ? wrapper.querySelector('.dice-group-header') : null;
        const groupNameInput = header ? header.querySelector('.dice-group-name-input') : null;
        const groupName = groupNameInput && groupNameInput.value.trim() ? groupNameInput.value.trim() : `Group ${parseInt(groupId) + 1}`;

        diceTypes.forEach((diceType) => {
            const countElement = document.getElementById(`group-${groupId}-${diceType}-counter-value`);
            groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
        });

        const modElement = document.getElementById(`group-${groupId}-mod-counter-value`);
        groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

        diceGroupsData.push({
            name: groupName,
            diceCounts: groupDiceCounts
        });
    });
}

function removeDiceGroup() {
    const wrappers = document.querySelectorAll('.dice-group-wrapper');
    if (wrappers.length > 1) {
        wrappers[wrappers.length - 1].remove();
        diceGroupsData.pop();
    } else {
        console.warn("Can't remove the last group.");
    }

    updateDiceGroupsData();
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

    // Get all creature accordion groups
    const accordionGroups = Array.from(savedRollsContainer.querySelectorAll('.saved-roll-group'));

    if (debugMode) {
        console.log("Number of accordion groups:", accordionGroups.length);
    }

    // Sort the accordion groups based on selected criteria
    switch (sortOption) {
        case "newest":
            accordionGroups.sort((a, b) => {
                // Get the newest roll from each group
                const aRolls = Array.from(a.querySelectorAll('.saved-roll-entry'));
                const bRolls = Array.from(b.querySelectorAll('.saved-roll-entry'));
                
                if (aRolls.length === 0 || bRolls.length === 0) {
                    return aRolls.length === 0 ? 1 : -1; // Empty groups go to the end
                }
                
                // Find the newest timestamp in each group
                const aNewest = Math.max(...aRolls.map(roll => parseInt(roll.dataset.timestamp) || 0));
                const bNewest = Math.max(...bRolls.map(roll => parseInt(roll.dataset.timestamp) || 0));
                
                return bNewest - aNewest; // Descending order for newest
            });
            break;
        case "oldest":
            accordionGroups.sort((a, b) => {
                // Get the oldest roll from each group
                const aRolls = Array.from(a.querySelectorAll('.saved-roll-entry'));
                const bRolls = Array.from(b.querySelectorAll('.saved-roll-entry'));
                
                if (aRolls.length === 0 || bRolls.length === 0) {
                    return aRolls.length === 0 ? 1 : -1; // Empty groups go to the end
                }
                
                // Find the oldest timestamp in each group
                const aOldest = Math.min(...aRolls.map(roll => parseInt(roll.dataset.timestamp) || Infinity));
                const bOldest = Math.min(...bRolls.map(roll => parseInt(roll.dataset.timestamp) || Infinity));
                
                return aOldest - bOldest; // Ascending order for oldest
            });
            break;
        case "nameAsc":
            accordionGroups.sort((a, b) => {
                const aName = a.dataset.creatureName || "";
                const bName = b.dataset.creatureName || "";
                return aName.localeCompare(bName); // A-Z
            });
            break;
        case "nameDesc":
            accordionGroups.sort((a, b) => {
                const aName = a.dataset.creatureName || "";
                const bName = b.dataset.creatureName || "";
                return bName.localeCompare(aName); // Z-A
            });
            break;
    }

    // Clear and re-append the sorted accordion groups
    savedRollsContainer.innerHTML = "";
    accordionGroups.forEach(group => savedRollsContainer.appendChild(group));

    // Now sort the rolls within each creature group using the same sorting criteria
    accordionGroups.forEach(group => {
        const rollsContent = group.querySelector('.saved-rolls-content');
        if (!rollsContent) return;

        const rollEntries = Array.from(rollsContent.querySelectorAll('.saved-roll-entry'));
        
        // Apply the same sorting logic to roll entries
        switch (sortOption) {
            case "newest":
                rollEntries.sort((a, b) => {
                    const aTimestamp = parseInt(a.dataset.timestamp) || 0;
                    const bTimestamp = parseInt(b.dataset.timestamp) || 0;
                    return bTimestamp - aTimestamp; // Descending order for newest
                });
                break;
            case "oldest":
                rollEntries.sort((a, b) => {
                    const aTimestamp = parseInt(a.dataset.timestamp) || Infinity;
                    const bTimestamp = parseInt(b.dataset.timestamp) || Infinity;
                    return aTimestamp - bTimestamp; // Ascending order for oldest
                });
                break;
            case "nameAsc":
                rollEntries.sort((a, b) => {
                    // Use the first group's name as the roll name for sorting
                    const aGroupDiv = a.querySelector('.dice-group[data-group-index="0"]');
                    const bGroupDiv = b.querySelector('.dice-group[data-group-index="0"]');
                    
                    const aName = aGroupDiv ? aGroupDiv.querySelector('.dice-group-name-text')?.textContent || "" : "";
                    const bName = bGroupDiv ? bGroupDiv.querySelector('.dice-group-name-text')?.textContent || "" : "";
                    
                    return aName.localeCompare(bName); // A-Z
                });
                break;
            case "nameDesc":
                rollEntries.sort((a, b) => {
                    // Use the first group's name as the roll name for sorting
                    const aGroupDiv = a.querySelector('.dice-group[data-group-index="0"]');
                    const bGroupDiv = b.querySelector('.dice-group[data-group-index="0"]');
                    
                    const aName = aGroupDiv ? aGroupDiv.querySelector('.dice-group-name-text')?.textContent || "" : "";
                    const bName = bGroupDiv ? bGroupDiv.querySelector('.dice-group-name-text')?.textContent || "" : "";
                    
                    return bName.localeCompare(aName); // Z-A
                });
                break;
        }

        // Clear and re-append the sorted roll entries
        rollsContent.innerHTML = "";
        rollEntries.forEach(entry => rollsContent.appendChild(entry));
    });

    if (debugMode) {
        console.log("Accordion and roll entry sorting complete");
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
    const creatureNameInput = document.getElementById('creature-name');
    if (creatureNameInput) {
        creatureNameInput.classList.remove('editing');
    }

    const rollLabelElement = document.querySelector('label[for="creature-name"]');
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
    if (addGroupButton) addGroupButton.classList.remove('editing');

    const removeGroupButton = document.getElementById('remove-group-button');
    if (removeGroupButton) removeGroupButton.classList.remove('editing');
}

function save() {
    const editingRollId = document.body.dataset.editingRollId;
    const creatureName = document.getElementById('creature-name').value.trim() || 'Unnamed';

    const diceGroupElements = document.querySelectorAll(".dice-selection");
    savedDiceGroups = [];

    diceGroupElements.forEach((groupElement, index) => {
        const groupId = groupElement.id;
        const groupDiceCounts = {};
        
        // Find the wrapper and header for this group
        const wrapper = groupElement.closest('.dice-group-wrapper');
        const header = wrapper ? wrapper.querySelector('.dice-group-header') : null;
        const groupNameInput = header ? header.querySelector('.dice-group-name-input') : null;
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
        name: creatureName,
        groups: savedDiceGroups
    };

    // Check if we're editing an existing roll
    if (editingRollId) {
        updateSavedRoll(editingRollId, rollData);
    } else {
        // Check if a similar roll already exists
        const existingRoll = findExistingRoll(creatureName, savedDiceGroups);
        
        if (existingRoll && !overwriteConfirmed) {
            // Show the overwrite modal to confirm
            showOverwriteModal(creatureName);
            return; // Stop execution here until user makes a choice
        }
        
        // Reset the flag after using it
        if (overwriteConfirmed) {
            overwriteConfirmed = false;
            
            // If there was an existing roll, delete it before adding the new one
            if (existingRoll) {
                existingRoll.remove();
            }
        }
        
        // Add the new roll
        addSavedRoll(rollData.name, savedDiceGroups);
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

function findExistingRoll(creatureName, groupsData) {
    const savedRollEntries = document.querySelectorAll('.saved-roll-entry');
    
    for (const entry of savedRollEntries) {
        // Skip the roll that's currently being edited if any
        if (document.body.dataset.editingRollId && entry.dataset.rollId === document.body.dataset.editingRollId) {
            continue;
        }
        
        // Check if creature name matches
        if (entry.dataset.creatureName !== creatureName) {
            continue;
        }
        
        // Check if group count matches
        const groupCount = parseInt(entry.dataset.groupCount || 0, 10);
        if (groupCount !== groupsData.length) {
            continue;
        }
        
        // Check each group's name only
        let groupsMatch = true;
        for (let i = 0; i < groupCount; i++) {
            const groupElement = entry.querySelector(`.dice-group[data-group-index="${i}"]`);
            if (!groupElement) {
                groupsMatch = false;
                break;
            }
            
            // Get group name from the entry
            const groupNameText = groupElement.querySelector('.dice-group-name-text');
            const savedGroupName = groupNameText ? groupNameText.textContent.trim() : `Group ${i + 1}`;
            
            // Check if group name matches
            if (savedGroupName !== groupsData[i].name) {
                groupsMatch = false;
                break;
            }
        }
        
        // If all group names match, we found a match - dice counts are intentionally ignored
        if (groupsMatch) {
            return entry;
        }
    }
    
    return null;
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
    modal.style.border = '4px solid var(--ts-accessibility-border)';
    modal.style.zIndex = '1000';
    modal.style.boxShadow = '0 4px 8px var(--ts-background-primary)';
    modal.style.borderRadius = '4px';
    modal.style.color = 'var(--ts-color-primary)';
    modal.style.textAlign = 'center';
    modal.style.minWidth = '300px';

    modal.innerHTML = `
        <p>A saved creature named "${creatureName}" with the same roll group names already exists.</p>
        <p>Do you want to replace it with your new configuration?</p>
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
        // Don't set overwriteConfirmed flag - just abort
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
        overlay.style.backgroundColor = 'var(--ts-background-primary)';
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

    if (debugMode) {
        console.log("Creature name already exists:", creatureName);
    }

    return exists;
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

function updateSavedRoll(rollId, rollData) {
    const rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
    if (!rollEntry) {
        console.error(`Roll entry with ID ${rollId} not found`);
        return;
    }

    const oldCreatureName = rollEntry.dataset.creatureName;
    const newCreatureName = rollData.name;

    // Update roll label (use the first group's name as label)
    rollEntry.querySelector('.roll-entry-label').textContent = rollData.groups[0].name || "Unnamed Roll";
    rollEntry.dataset.creatureName = newCreatureName;

    // Update dice display
    const diceDisplay = rollEntry.querySelector('.roll-entry-dice');
    diceDisplay.innerHTML = '';

    // Convert the groups to savedRoll format
    const savedRoll = rollData.groups.map(group => ({
        name: group.name,
        diceCounts: group.diceCounts
    }));

    savedRoll.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'dice-group';
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(group.diceCounts);

        const diceGroupText = Object.entries(group.diceCounts)
        .filter(([diceType, count]) => count > 0 && diceType !== "mod")
        .map(([diceType, count]) => `${count}${diceType}`)
        .join(" + ");
    
        const modifier = group.diceCounts.mod || 0;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+ " : ""}${modifier}` : "";

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

    rollEntry.dataset.groupCount = savedRoll.length;

    // Update roll buttons to work with new structure
    updateRollButtons(rollEntry, { groups: savedRoll });

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

function addSavedRoll(creatureName, savedRoll) {
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
    creatureEntry.dataset.groupCount = savedRoll.length;
    creatureEntry.dataset.rollType = 'normal';
    creatureEntry.dataset.timestamp = Date.now();

    // Create the roll display
    const diceDisplay = document.createElement("div");
    diceDisplay.className = "roll-entry-dice";

    savedRoll.forEach((group, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "dice-group";
        groupDiv.dataset.groupIndex = index;
        groupDiv.dataset.diceCounts = JSON.stringify(group.diceCounts);

        const groupName = group.name && group.name.trim() ? group.name.trim() : `Group ${index + 1}`;
        const diceGroupText = Object.entries(group.diceCounts)
        .filter(([diceType, count]) => count > 0 && diceType !== "mod")
        .map(([diceType, count]) => `${count}${diceType}`)
        .join(" + ");
    
        const modifier = group.diceCounts.mod || 0;
        const modifierText = modifier !== 0 ? `${modifier >= 0 ? "+ " : ""}${modifier}` : "";

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

    // Set up the roll entry with its label and buttons
    const editIcon = devMode ? '<img src="images/dev_icons/dev_pencil.png" class="debug-icons16">' : '<i class="ts-icon-pencil ts-icon-xsmall"></i>';
    const deleteIcon = devMode ? '<img src="images/dev_icons/dev_trash." class="debug-icons16">' : '<i class="ts-icon-trash ts-icon-xsmall"></i>';

    creatureEntry.innerHTML = `
        <div class="roll-entry-container">
            <div class="roll-entry-dice-container"></div>
            <div class="buttons-container">
                <div class="edit-roll" onclick="startEditingSavedRoll(this)">${editIcon}</div>
                <div class="delete-roll" onclick="deleteSavedRoll(this)">${deleteIcon}</div>
            </div>
        </div>
        <div class="row-buttons-container"></div>
    `;

    // Add the dice display to the container
    const diceContainer = creatureEntry.querySelector('.roll-entry-dice-container');
    diceContainer.appendChild(diceDisplay);

    const rowOfButtons = document.createElement("div");
    rowOfButtons.className = "row-buttons-container";
    creatureEntry.appendChild(rowOfButtons);

    // Update to work with new structure
    updateRollButtons(creatureEntry, { groups: savedRoll });

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
    for (let i = 0; i < groupCount; i++) {
        addDiceGroup();
        const groupDiv = rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`);
        const groupData = JSON.parse(groupDiv.dataset.diceCounts);
        const groupName = groupDiv.textContent.split(':')[0].trim();

        // Update to target the header input instead
        const diceGroupWrapper = document.querySelectorAll('.dice-group-wrapper')[i];
        const groupNameInput = diceGroupWrapper.querySelector('.dice-group-name-input');
        if (groupNameInput) {
            groupNameInput.value = groupName;
            groupNameInput.classList.add('editing');
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
}

function reset() {
    document.getElementById("creature-name").value = "";

    // Clear all existing dice groups
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    diceGroupsContainer.innerHTML = '';

    // Add a single empty group
    addDiceGroup();

    // Reset diceGroupsData to contain only one empty group
    diceGroupsData = [{
        name: "New Group",
        diceCounts: Object.fromEntries(diceTypes.map(type => [type, 0]).concat([['mod', 0]]))
    }];

    updateDiceGroupsData();
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
    // Stop propagation to prevent parent handlers from firing
    event.stopPropagation();
    
    // Find the closest header, content and icon elements
    const header = event.target.closest('.dice-group-header');
    if (!header) {
        console.error(".dice-group-header not found");
        return;
    } 
    
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-toggle');
    
    if (!content || !icon) {
        console.error("Content or icon not found for toggleDiceGroupAccordion");
        return;
    }

    // Check if collapsed based on display style
    const isCollapsed = content.style.display === 'none';

    if (isCollapsed) {
        // Expand
        content.style.display = 'flex';
        content.style.maxHeight = 'none'; // Allow natural height
        icon.textContent = '-';
        // Remove this line:
        // icon.classList.add('rotate');
    } else {
        // Collapse
        content.style.display = 'none';
        icon.textContent = '+';
        // Remove this line:
        // icon.classList.remove('rotate');
    }
}