/**
 * DiceGroupManager - Handles all dice group related functionality
 * including creating, updating, removing dice groups and managing their data
 */
class DiceGroupManager {
    constructor() {
        this.diceGroupsData = [];
        // Use global diceTypes variable from globals.js
        this.diceTypes = diceTypes || ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
        this.nextGroupId = 0;
    }

    /**
     * Checks if a dice group is empty (no dice selected)
     * @param {Object} diceGroup - The dice group to check
     * @returns {boolean} - True if the group is empty or only has modifiers
     */
    isDiceGroupEmpty(diceGroup) {
        if (!diceGroup || !diceGroup.diceCounts) {
            return true; // Consider it empty if there's no data
        }

        // Check if any dice type has a non-zero count
        // A group is considered empty for rolling purposes if it has no dice,
        // regardless of whether it has modifiers (since you can't roll modifiers alone)
        return !this.diceTypes.some(diceType => {
            const count = diceGroup.diceCounts[diceType] || 0;
            return count > 0;
        });
    }

    /**
     * Checks if a dice group has only modifiers and no dice
     * @param {Object} diceGroup - The dice group to check
     * @returns {boolean} - True if the group has only modifiers
     */
    hasOnlyModifier(diceGroup) {
        if (!diceGroup || !diceGroup.diceCounts) {
            return false;
        }

        // Check if group has no dice but has a non-zero modifier
        const hasDice = this.diceTypes.some(diceType => {
            const count = diceGroup.diceCounts[diceType] || 0;
            return count > 0;
        });

        const hasModifier = diceGroup.diceCounts.mod && diceGroup.diceCounts.mod !== 0;

        return !hasDice && hasModifier;
    }

    /**
     * Adjusts the dice counter value for a given dice type by the specified delta
     * @param {string} type - The type in format "groupId-diceType"
     * @param {number} delta - The amount to change the counter by (1 to increment, -1 to decrement)
     */
    adjustDice(type, delta) {
        const lastDashIndex = type.lastIndexOf("-");
        const groupId = type.substring(0, lastDashIndex);
        const diceType = type.substring(lastDashIndex + 1);
        const counterId = `${groupId}-${diceType}-counter-value`;
        const counter = document.getElementById(counterId);

        if (counter) {
            const currentValue = parseInt(counter.textContent, 10);
            const newValue = currentValue + delta;
            if (newValue >= 0 && newValue <= 40) {
                counter.textContent = newValue;
                this.updateDiceGroupsData();
            }
        } else {
            console.error("Counter element not found:", counterId);
        }
    }

    /**
     * Resets a single die counter to 0.
     * @param {string} type - The combined group-die identifier (e.g., "group-0-d6").
     */
    resetSingleDie(type) {
        const lastDashIndex = type.lastIndexOf("-");
        const groupId = type.substring(0, lastDashIndex);
        const diceType = type.substring(lastDashIndex + 1);
        const counterId = `${groupId}-${diceType}-counter-value`;
        const counter = document.getElementById(counterId);

        if (counter) {
            counter.textContent = 0;
            this.updateDiceGroupsData();
        }
    }

    /**
     * Adds a new dice group to the interface
     */
    addDiceGroup() {
        const diceGroupsContainer = document.querySelector(".content-col-dice");
        const groupIndex = this.nextGroupId++;

        const wrapper = document.createElement("div");
        wrapper.className = "dice-group-wrapper";
        wrapper.setAttribute('data-group-type', 'dice');

        // Get the current translation for group name placeholder
        const lang = currentLanguage || 'en';
        const t = translations[lang] || translations.en;
        const groupNamePlaceholder = `${t.defaultGroupName || 'Group'} ${groupIndex + 1}`;

        const accordionHeader = document.createElement("div");
        accordionHeader.className = "dice-group-header";
        accordionHeader.innerHTML = `
            <span class="drag-handle" title="Drag to reorder"></span>
            <div class="header-content">
                <input type="text" class="dice-group-name-input header-input" id="group-${groupIndex}-name"
                    placeholder="${groupNamePlaceholder}" oninput="diceGroupManager.updateDiceGroupsData()">
            </div>
            <i class="ts-icon-refresh header-action-btn" title="Reset group" data-group-index="${groupIndex}"></i>
            <i class="ts-icon-minus ts-icon-xsmall header-action-btn accordion-toggle" title="Collapse group"></i>
        `;

        // Accordion toggle click handler
        accordionHeader.querySelector('.accordion-toggle').addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleDiceGroupAccordion(event);
        });

        // Reset button click handler
        accordionHeader.querySelector('.ts-icon-refresh').addEventListener('click', (event) => {
            event.stopPropagation();
            this.resetDiceGroup(groupIndex, 'dice');
        });

        const content = document.createElement("div");
        content.className = "dice-selection";
        content.id = `${groupIndex}`;

        let diceHTML = `
            <div class="dice-group-container">
                <div class="dice-row">
        `;

        this.diceTypes.forEach((type) => {
            diceHTML += `
                <div class="dice-counter unselectable" id="group-${groupIndex}-${type}-counter">
                    <i class="ts-icon-${type} ts-icon-size55" onclick="diceGroupManager.adjustDice('group-${groupIndex}-${type}', 1)"
                    oncontextmenu="isCtrlHeld ? diceGroupManager.resetSingleDie('group-${groupIndex}-${type}') : diceGroupManager.adjustDice('group-${groupIndex}-${type}', -1); return false;"></i>
                    <div class="counter-overlay" id="group-${groupIndex}-${type}-counter-value">0</div>
                    <div class="dice-label">${type.toUpperCase()}</div>
                </div>
            `;
        });

        diceHTML += `
            <div class="plus-sign"><span>+</span></div>
            <div class="dice-counter unselectable" id="group-${groupIndex}-mod-counter">
                <i class="ts-icon-circle-dotted ts-icon-size55 mod-holder"></i>
                <input type="number" class="counter-overlay mod-counter-overlay"
                id="group-${groupIndex}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" oninput="diceGroupManager.updateDiceGroupsData()" onblur="if(this.value==='')this.value='0';diceGroupManager.updateDiceGroupsData()" />
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

        this.updateDiceGroupsData();
        this.updateGroupButtonState();

        // Initialize drag-and-drop for the new group
        if (typeof reorderManager !== 'undefined') {
            reorderManager.initDragForGroup(wrapper);
        }

        return groupIndex;
    }

    /**
     * Adds a new duality group to the interface
     */
    addDualityGroup() {
        const existingDuality = document.querySelectorAll('[data-group-type="duality"]');
        if (existingDuality.length >= 1) return;

        const diceGroupsContainer = document.querySelector(".content-col-dice");
        const groupIndex = this.nextGroupId++;

        const wrapper = document.createElement("div");
        wrapper.className = "dice-group-wrapper";
        wrapper.setAttribute('data-group-type', 'duality');

        // Get the current translation for group name placeholder
        const lang = currentLanguage || 'en';
        const t = translations[lang] || translations.en;
        const groupNamePlaceholder = `${t.defaultGroupName || 'Group'} ${groupIndex + 1}`;

        const accordionHeader = document.createElement("div");
        accordionHeader.className = "dice-group-header";
        accordionHeader.innerHTML = `
            <span class="drag-handle" title="Drag to reorder"></span>
            <div class="header-content">
                <input type="text" class="dice-group-name-input header-input" id="group-${groupIndex}-name"
                    placeholder="${groupNamePlaceholder}" oninput="diceGroupManager.updateDiceGroupsData()">
            </div>
            <i class="ts-icon-refresh header-action-btn" title="Reset group" data-group-index="${groupIndex}"></i>
            <i class="ts-icon-minus ts-icon-xsmall header-action-btn accordion-toggle" title="Collapse group"></i>
        `;

        // Accordion toggle click handler
        accordionHeader.querySelector('.accordion-toggle').addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleDiceGroupAccordion(event);
        });

        // Reset button click handler
        accordionHeader.querySelector('.ts-icon-refresh').addEventListener('click', (event) => {
            event.stopPropagation();
            this.resetDiceGroup(groupIndex, 'duality');
        });

        const content = document.createElement("div");
        content.className = "dice-selection";
        content.id = `${groupIndex}`;

        let diceHTML = `
            <div class="dice-group-container">
                <div class="dice-row">
        `;

        // Only add d12, set initial value to 2
        // TODO: Make this not show a hand while hovering
        diceHTML += `
            <div class="dice-counter unselectable" id="group-${groupIndex}-d12-counter">
                <i class="ts-icon-d12 ts-icon-size55"></i>
                <div class="counter-overlay" id="group-${groupIndex}-d12-counter-value">2</div>
                <div class="dice-label">D12</div>
            </div>
        `;

        diceHTML += `
            <div class="plus-sign"><span>+</span></div>
            <div class="dice-counter unselectable" id="group-${groupIndex}-mod-counter">
                <i class="ts-icon-circle-dotted ts-icon-size55 mod-holder"></i>
                <input type="number" class="counter-overlay mod-counter-overlay"
                id="group-${groupIndex}-mod-counter-value" value="0" min="-999" max="999" onfocus="this.select()" oninput="diceGroupManager.updateDiceGroupsData()" onblur="if(this.value==='')this.value='0';diceGroupManager.updateDiceGroupsData()" />
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

        this.updateDiceGroupsData();
        this.updateDualityButtonState();

        // Initialize drag-and-drop for the new group
        if (typeof reorderManager !== 'undefined') {
            reorderManager.initDragForGroup(wrapper);
        }

        return groupIndex;
    }

    /**
     * Updates the internal dice groups data array
     */
    updateDiceGroupsData() {
        this.diceGroupsData = [];

        const diceGroupElements = document.querySelectorAll(".dice-selection");
        diceGroupElements.forEach((groupElement) => {
            const groupId = groupElement.id;
            const groupDiceCounts = {};
            // Find the wrapper and header for this group
            const wrapper = groupElement.closest('.dice-group-wrapper');
            const header = wrapper ? wrapper.querySelector('.dice-group-header') : null;
            const groupNameInput = header ? header.querySelector('.dice-group-name-input') : null;
            const groupName = groupNameInput && groupNameInput.value.trim() ? groupNameInput.value.trim() : `Group ${parseInt(groupId) + 1}`;
            const groupType = wrapper ? wrapper.getAttribute('data-group-type') || 'dice' : 'dice';

            // Use scoped queries within the wrapper to avoid ID collisions
            // This prevents duality groups and regular dice groups from reading each other's counters
            this.diceTypes.forEach((diceType) => {
                const countElement = wrapper ? wrapper.querySelector(`#group-${groupId}-${diceType}-counter-value`) : null;
                groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
            });

            const modElement = wrapper ? wrapper.querySelector(`#group-${groupId}-mod-counter-value`) : null;
            groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

            if (groupType === 'duality') {
                // Split duality group into two separate groups
                for (let i = 0; i < 2; i++) {
                    this.diceGroupsData.push({
                        name: `${groupName} - ${i === 0 ? 'A' : 'B'}`,
                        diceCounts: { d12: 1, mod: groupDiceCounts.mod },
                        groupType: 'duality'
                    });
                }
            } else {
                this.diceGroupsData.push({
                    name: groupName,
                    diceCounts: groupDiceCounts,
                    groupType: groupType
                });
            }
        });

        // Update global diceGroupsData if it exists
        if (typeof diceGroupsData !== 'undefined') {
            diceGroupsData = this.diceGroupsData;
        }

        this.updateDualityButtonState();
        this.updateGroupButtonState();
    }

    /**
     * Enables or disables the duality button based on whether a duality group already exists.
     * Only one duality group is allowed per roll.
     */
    updateDualityButtonState() {
        const hasDuality = document.querySelectorAll('[data-group-type="duality"]').length >= 1;
        const addBtn = document.getElementById('add-duality-btn');
        const removeBtn = document.getElementById('remove-duality-btn');
        if (addBtn) addBtn.disabled = hasDuality;
        if (removeBtn) removeBtn.disabled = !hasDuality;
    }

    /**
     * Enables or disables the remove group button based on whether any dice groups exist.
     */
    updateGroupButtonState() {
        const hasGroups = document.querySelectorAll('[data-group-type="dice"]').length >= 1;
        const removeBtn = document.getElementById('remove-group-btn');
        if (removeBtn) removeBtn.disabled = !hasGroups;
    }

    /**
     * Removes the last dice group
     */
    removeDiceGroup() {
        // Only remove the last group of type 'dice'
        const wrappers = Array.from(document.querySelectorAll('.dice-group-wrapper'));
        const diceWrappers = wrappers.filter(w => w.getAttribute('data-group-type') === 'dice');
        if (diceWrappers.length > 0) {
            diceWrappers[diceWrappers.length - 1].remove();
        } else {
            console.warn("No dice group to remove.");
        }
        this.updateDiceGroupsData();
        this.updateGroupButtonState();
    }

    /**
     * Removes the last duality group
     * */
    removeDualityGroup() {
        // Only remove the last group of type 'duality'
        const wrappers = Array.from(document.querySelectorAll('.dice-group-wrapper'));
        const dualityWrappers = wrappers.filter(w => w.getAttribute('data-group-type') === 'duality');
        if (dualityWrappers.length > 0) {
            dualityWrappers[dualityWrappers.length - 1].remove();
        } else {
            console.warn("No duality group to remove.");
        }
        this.updateDiceGroupsData();
        this.updateDualityButtonState();
    }

    /**
     * Updates group element IDs when groups are reordered
     * @param {Element} group - The group element to update
     * @param {number} newIndex - The new index for the group
     */
    updateGroupElementIds(group, newIndex) {
        this.diceTypes.forEach(diceType => {
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
            counter.querySelector('.ts-icon-size55').setAttribute('onclick', `diceGroupManager.incrementDice('group-${newIndex}-${diceType}')`);
            counter.querySelector('.ts-icon-size55').setAttribute('oncontextmenu', `diceGroupManager.decrementDice('group-${newIndex}-${diceType}'); return false;`);
        });
    }

    /**
     * Toggles the accordion state of a dice group
     * @param {Event} event - The click event
     */
    toggleDiceGroupAccordion(event) {
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

        const isCollapsed = content.classList.contains('collapsed');

        if (isCollapsed) {
            content.classList.remove('collapsed');
            icon.classList.remove('ts-icon-plus');
            icon.classList.add('ts-icon-minus');
            icon.title = 'Collapse group';
        } else {
            content.classList.add('collapsed');
            icon.classList.remove('ts-icon-minus');
            icon.classList.add('ts-icon-plus');
            icon.title = 'Expand group';
        }
    }

    /**
     * Resets all dice counters and modifier for a specific dice group.
     * Standard groups reset all dice to 0. Duality groups reset d12 to 2.
     * Modifier is always reset to 0.
     * @param {number} groupIndex - The group index to reset
     * @param {string} groupType - The group type ('dice' or 'duality')
     */
    resetDiceGroup(groupIndex, groupType) {
        const diceTypesToReset = groupType === 'duality' ? ['d12'] : this.diceTypes;

        diceTypesToReset.forEach(type => {
            const counter = document.getElementById(`group-${groupIndex}-${type}-counter-value`);
            if (counter) {
                counter.textContent = (groupType === 'duality' && type === 'd12') ? '2' : '0';
            }
        });

        // Reset modifier to 0
        const modCounter = document.getElementById(`group-${groupIndex}-mod-counter-value`);
        if (modCounter) {
            modCounter.value = '0';
        }

        this.updateDiceGroupsData();
    }

    /**
     * Gets the current dice groups data
     * @returns {Array} Array of dice group objects
     */
    getDiceGroupsData() {
        return this.diceGroupsData;
    }

    /**
     * Sets the dice types array
     * @param {Array} types - Array of dice type strings
     */
    setDiceTypes(types) {
        this.diceTypes = types;
    }
}
