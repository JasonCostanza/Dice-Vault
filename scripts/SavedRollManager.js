/**
 * SavedRollManager - Handles all saved roll CRUD operations
 * including saving, loading, editing, deleting, and managing saved rolls
 */
class SavedRollManager {
    constructor(diceGroupManager, rollSorter) {
        this.diceGroupManager = diceGroupManager;
        this.rollSorter = rollSorter;
    }

    /**
     * Deletes a saved roll and handles accordion updates.
     * 
     * This function removes a roll entry and checks if its parent accordion
     * should also be removed when empty.
     * 
     * @param {Element} element - The delete button element that was clicked.
     */
    deleteSavedRoll(element) {
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

    /**
     * Aborts the current editing session and resets UI state
     */
    abortEditing() {
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

        // Remove editing class from dice group wrappers
        const diceGroupWrappers = document.querySelectorAll('.dice-group-wrapper');
        diceGroupWrappers.forEach(wrapper => {
            wrapper.classList.remove('editing');
        });

        // Remove editing class from Add Group and Remove Group buttons
        const addGroupButton = document.getElementById('add-group-btn');
        if (addGroupButton) addGroupButton.classList.remove('editing');

        const removeGroupButton = document.getElementById('remove-group-btn');
        if (removeGroupButton) removeGroupButton.classList.remove('editing');
    }

    /**
     * Saves the current dice configuration as a new roll or updates an existing one
     */
    save() {
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

        // Check for groups with only modifiers (error case)
        const modifierOnlyGroups = savedDiceGroups.filter(group => {
            if (!group || !group.diceCounts) return false;
            
            const hasDice = diceTypes.some(diceType => {
                const count = group.diceCounts[diceType] || 0;
                return count > 0;
            });
            
            const hasModifier = group.diceCounts.mod && group.diceCounts.mod !== 0;
            
            return !hasDice && hasModifier;
        });

        if (modifierOnlyGroups.length > 0) {
            const groupNames = modifierOnlyGroups.map(group => group.name || 'Unnamed Group').join(', ');
            console.error(`Cannot pin/save groups with only modifiers and no dice: ${groupNames}`);
            alert(`Error: Cannot pin groups with only modifiers and no dice.\n\nGroups with this issue: ${groupNames}\n\nPlease add at least one die to these groups or set their modifier to 0 before pinning.`);
            return;
        }

        // Check if all groups are empty
        if (savedDiceGroups.every(this.diceGroupManager.isDiceGroupEmpty.bind(this.diceGroupManager))) {
            console.warn("Attempted to pin/save empty dice groups");
            alert("Error: No dice selected for pinning. Please add at least one die to a group before pinning.");
            return;
        }

        const rollData = {
            name: creatureName,
            groups: savedDiceGroups
        };

        // Check if we're editing an existing roll
        if (editingRollId) {
            this.updateSavedRoll(editingRollId, rollData);
        } else {
            // Check if a similar roll already exists
            const existingRoll = this.findExistingRoll(creatureName, savedDiceGroups);
            
            if (existingRoll && !overwriteConfirmed) {
                // Show the overwrite modal to confirm
                this.showOverwriteModal(creatureName);
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
            this.addSavedRoll(rollData.name, savedDiceGroups);
        }

        // Remove editing classes from dice group wrappers
        const diceGroupWrappers = document.querySelectorAll('.dice-group-wrapper');
        diceGroupWrappers.forEach(wrapper => {
            wrapper.classList.remove('editing');
        });

        this.abortEditing();

        if (fetchSetting("auto-reset")) {
            this.reset();
        }

        if (fetchSetting("auto-save")) {
            saveRollsToLocalStorage();
        } else {
            disableButtonById("save-rolls-button", false);
            disableButtonById("load-rolls-button", false);
        }

        updateAutoButtons();
    }

    /**
     * Finds an existing roll with the same creature name and group names
     * @param {string} creatureName - The creature name to search for
     * @param {Array} groupsData - Array of group data to compare
     * @returns {Element|null} - The matching roll element or null
     */
    findExistingRoll(creatureName, groupsData) {
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

    /**
     * Shows a modal asking user to confirm overwriting an existing roll
     * @param {string} creatureName - The name of the creature being saved
     */
    showOverwriteModal(creatureName) {
        uiManager.showOverlay(true);

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
            uiManager.showOverlay(false);
            overwriteConfirmed = true;  // Set the flag to true
            this.save(); // Call save() again to proceed with saving
        });

        document.getElementById('overwrite-no').addEventListener('click', () => {
            document.body.removeChild(modal);
            uiManager.showOverlay(false);
            // Don't set overwriteConfirmed flag - just abort
        });
    }

    /**
     * Checks if a creature name already exists in saved rolls
     * @param {string} creatureName - The creature name to check
     * @returns {boolean} - True if the name exists
     */
    creatureNameExists(creatureName) {
        const savedCreatures = document.querySelectorAll('.saved-roll-entry');
        const exists = Array.from(savedCreatures).some(roll => roll.dataset.creatureName === creatureName);

        if (debugMode) {
            console.log("Creature name already exists:", creatureName);
        }

        return exists;
    }

    /**
     * Updates an existing saved roll with new data
     * @param {string} rollId - The ID of the roll to update
     * @param {Object} rollData - The new roll data
     */
    updateSavedRoll(rollId, rollData) {
        const rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${rollId}"]`);
        if (!rollEntry) {
            console.error(`Roll entry with ID ${rollId} not found`);
            return;
        }

        const oldCreatureName = rollEntry.dataset.creatureName;
        const newCreatureName = rollData.name;

        // Update roll label (use the first group's name as label) - Check if element exists first
        const rollEntryLabel = rollEntry.querySelector('.roll-entry-label');
        if (rollEntryLabel) {
            rollEntryLabel.textContent = rollData.groups[0].name || "Unnamed Roll";
        }
        
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
        this.updateRollButtons(rollEntry, { groups: savedRoll });

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
                <div class="saved-roll-header" onclick="uiManager.toggleAccordion(this)">
                    <span>${newCreatureName}</span> <span class="accordion-icon">-</span>
                </div>
                <div class="saved-rolls-content"></div>
            `;                const savedRollsContainer = document.querySelector(".saved-rolls-container");
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
            this.rollSorter.sortSavedRolls();
        }

        rollEntry.classList.remove('editing');
        const editButton = rollEntry.querySelector('.edit-roll');
        if (editButton) {
            editButton.classList.remove('editing');
        }

        delete document.body.dataset.editingRollId;
    }

    /**
     * Adds a new saved roll to the UI
     * @param {string} creatureName - The name of the creature
     * @param {Array} savedRoll - Array of dice groups data
     */
    addSavedRoll(creatureName, savedRoll) {
        const savedRollsContainer = document.querySelector(".saved-rolls-container");

        if (!savedRollsContainer) {
            console.error("Saved rolls container not found");
            return;
        }

        // Defensive validation: Check for groups with only modifiers (mainly for legacy data)
        const modifierOnlyGroups = savedRoll.filter(group => {
            if (!group || !group.diceCounts) return false;
            
            const hasDice = diceTypes.some(diceType => {
                const count = group.diceCounts[diceType] || 0;
                return count > 0;
            });
            
            const hasModifier = group.diceCounts.mod && group.diceCounts.mod !== 0;
            
            return !hasDice && hasModifier;
        });

        if (modifierOnlyGroups.length > 0) {
            const groupNames = modifierOnlyGroups.map(group => group.name || 'Unnamed Group').join(', ');
            console.warn(`Loading saved roll "${creatureName}" with groups that have only modifiers: ${groupNames}. These groups will not be rollable.`);
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
            <div class="saved-roll-header" onclick="uiManager.toggleAccordion(this)">
                <span>${creatureName}</span> <span class="accordion-icon">-</span>
            </div>
            <div class="saved-rolls-content"></div>
        `;            savedRollsContainer.appendChild(creatureGroup);
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
        const editIcon = '<i class="ts-icon-pencil ts-icon-xsmall"></i>'
        const deleteIcon = '<i class="ts-icon-trash ts-icon-xsmall"></i>'

        creatureEntry.innerHTML = `
            <div class="roll-entry-container">
                
                <div class="roll-entry-dice-container"></div>
                <div class="buttons-container">
                    <div class="edit-roll" onclick="savedRollManager.startEditingSavedRoll(this)">${editIcon}</div>
                    <div class="delete-roll" onclick="savedRollManager.deleteSavedRoll(this)">${deleteIcon}</div>
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
        this.updateRollButtons(creatureEntry, { groups: savedRoll });

        // Append to the correct creature accordion group
        rollsContent.appendChild(creatureEntry);

        // Ensure rolls remain sorted
        this.rollSorter.sortSavedRolls();
    }

    /**
     * Creates roll buttons for a saved roll entry
     * @param {Element} rollEntry - The roll entry element
     * @param {Object} rollData - The roll data containing groups
     */
    updateRollButtons(rollEntry, rollData) {
        const rowOfButtons = rollEntry.querySelector('.row-buttons-container');
        if (!rowOfButtons) {
            console.error('Row of buttons container not found in roll entry');
            return;
        }

        rowOfButtons.innerHTML = '';

        this.createRollButton("rolling", "normal", rollData.groups, "roll-button row-button", rowOfButtons);
        this.createRollButton("advantage", "advantage", rollData.groups, "roll-button row-button", rowOfButtons);
        this.createRollButton("disadvantage", "disadvantage", rollData.groups, "roll-button row-button", rowOfButtons);
        this.createRollButton("best-of-three", "best-of-three", rollData.groups, "roll-button row-button", rowOfButtons);
        this.createRollButton("crit", "crit-dice", rollData.groups, "roll-button row-button", rowOfButtons);
    }

    /**
     * Creates a single roll button
     * @param {string} imageName - The image name for the button
     * @param {string} rollType - The type of roll
     * @param {Array} rollGroups - Array of roll groups
     * @param {string} cssClasses - CSS classes for the button
     * @param {Element} parent - Parent element to append to
     * @returns {Element} The created button element
     */
    createRollButton(imageName, rollType, rollGroups, cssClasses, parent) {
        const rollButton = document.createElement("div");
        rollButton.className = cssClasses;
        rollButton.onclick = function () {
            if (!Array.isArray(rollGroups) || rollGroups.length === 0) {
                console.error('Attempted to roll an empty or invalid saved roll');
                alert('Error: This saved roll has no valid dice groups.');
                return;
            }
            
            // Check for groups with only modifiers
            const modifierOnlyGroups = rollGroups.filter(group => {
                if (!group || !group.diceCounts) return false;
                
                const hasDice = diceTypes.some(diceType => {
                    const count = group.diceCounts[diceType] || 0;
                    return count > 0;
                });
                
                const hasModifier = group.diceCounts.mod && group.diceCounts.mod !== 0;
                
                return !hasDice && hasModifier;
            });
            
            if (modifierOnlyGroups.length > 0) {
                const groupNames = modifierOnlyGroups.map(group => group.name || 'Unnamed Group').join(', ');
                console.error(`Cannot roll saved roll with groups that have only modifiers: ${groupNames}`);
                alert(`Error: Cannot roll groups with only modifiers and no dice.\n\nGroups with this issue: ${groupNames}\n\nPlease edit this saved roll to add dice or remove the modifiers.`);
                return;
            }
            
            if (rollGroups.every(diceGroupManager.isDiceGroupEmpty.bind(diceGroupManager))) {
                console.error('Attempted to roll an empty or invalid saved roll');
                alert('Error: This saved roll has no dice selected. Please edit the saved roll to add at least one die.');
                return;
            }
            
            rollsModule.roll(rollType, rollGroups);
        };

        // Creating the image icon for the roll button and adding the css class then appending it to the roll button
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

    /**
     * Starts editing a saved roll
     * @param {Element|string} elementOrId - The element clicked or roll ID
     */
    startEditingSavedRoll(elementOrId) {
        let rollEntry;
        let rollId;

        if (typeof elementOrId === 'string') {
            rollEntry = document.querySelector(`.saved-roll-entry[data-roll-id="${elementOrId}"]`);
            rollId = elementOrId;
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
            this.abortEditing();
            return;
        }

        if (document.body.dataset.editingRollId) {
            this.abortEditing();
        }

        document.body.dataset.editingRollId = rollId;
        rollEntry.classList.add('editing');

        if (elementOrId instanceof Element) {
            elementOrId.classList.add('editing');
        }

        const groupCount = parseInt(rollEntry.dataset.groupCount, 10);
        const creatureName = rollEntry.dataset.creatureName || '';

        const creatureNameInput = document.getElementById('creature-name');
        creatureNameInput.value = creatureName;
        creatureNameInput.classList.add('editing');

        const creatureLabelElement = document.querySelector('label[for="creature-name"]');
        if (creatureLabelElement) {
            creatureLabelElement.textContent = `Editing . . .`;
            creatureLabelElement.classList.add('editing');
        }

        const addGroupButton = document.getElementById('add-group-btn');
        const removeGroupButton = document.getElementById('remove-group-btn');
        if (addGroupButton) {
            addGroupButton.classList.add('editing');
        }
        if (removeGroupButton) {
            removeGroupButton.classList.add('editing');
        }

        const diceSelectionContainer = document.querySelector('.content-col-dice');
        diceSelectionContainer.innerHTML = '';

        for (let i = 0; i < groupCount; i++) {
            this.diceGroupManager.addDiceGroup();
            const groupDiv = rollEntry.querySelector(`.dice-group[data-group-index="${i}"]`);
            const groupData = JSON.parse(groupDiv.dataset.diceCounts);
            const groupName = groupDiv.querySelector('.dice-group-name-text').textContent.trim();
        
            // Apply editing class to all dice group wrappers
            const diceGroupWrapper = document.querySelectorAll('.dice-group-wrapper')[i];
            diceGroupWrapper.classList.add('editing');
            
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

    /**
     * Resets the dice configuration to default state
     */
    reset() {
        document.getElementById("creature-name").value = "";

        // Clear all existing dice groups
        const diceGroupsContainer = document.querySelector(".content-col-dice");
        diceGroupsContainer.innerHTML = '';

        // Add a single empty group
        this.diceGroupManager.addDiceGroup();

        // Reset diceGroupsData to contain only one empty group
        diceGroupsData = [{
            name: "New Group",
            diceCounts: Object.fromEntries(diceTypes.map(type => [type, 0]).concat([['mod', 0]]))
        }];

        this.diceGroupManager.updateDiceGroupsData();
    }
}
