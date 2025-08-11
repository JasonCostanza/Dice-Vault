/**
 * DiceGroupManager - Handles all dice group related functionality
 * including creating, updating, removing dice groups and managing their data
 */
class DiceGroupManager {
    constructor() {
        this.diceGroupsData = [];
        // Use global diceTypes variable from globals.js
        this.diceTypes = diceTypes || ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
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
     * Increments the dice counter value for a given dice type
     * @param {string} type - The type in format "groupId-diceType"
     */
    incrementDice(type) {
        const lastDashIndex = type.lastIndexOf("-");
        const groupId = type.substring(0, lastDashIndex);
        const diceType = type.substring(lastDashIndex + 1);
        const counterId = `${groupId}-${diceType}-counter-value`;
        const counter = document.getElementById(counterId);

        if (counter) {
            let currentValue = parseInt(counter.textContent, 10);
            if (currentValue < 50) {
                counter.textContent = currentValue + 1;
                this.updateDiceGroupsData();
            }
        } else {
            console.error("Counter element not found:", counterId);
        }
    }

    /**
     * Decrements the dice counter value for a given dice type
     * @param {string} type - The type in format "groupId-diceType"
     */
    decrementDice(type) {
        const lastDashIndex = type.lastIndexOf("-");
        const groupId = type.substring(0, lastDashIndex);
        const diceType = type.substring(lastDashIndex + 1);
        const counterId = `${groupId}-${diceType}-counter-value`;
        const counter = document.getElementById(counterId);

        if (counter) {
            let currentValue = parseInt(counter.textContent, 10);
            if (currentValue > 0) {
                counter.textContent = currentValue - 1;
                this.updateDiceGroupsData();
            }
        } else {
            console.error("Counter element not found:", counterId);
        }
    }

    /**
     * Adds a new dice group to the interface
     */
    addDiceGroup() {
        const diceGroupsContainer = document.querySelector(".content-col-dice");
        const groupIndex = diceGroupsContainer.children.length;

        const wrapper = document.createElement("div");
        wrapper.className = "dice-group-wrapper";

        const accordionHeader = document.createElement("div");
        accordionHeader.className = "dice-group-header";
        accordionHeader.innerHTML = `
            <div class="header-content">
                <input type="text" class="dice-group-name-input header-input" id="group-${groupIndex}-name" 
                    placeholder="Enter Group Name">
            </div>
            <span class="accordion-toggle">-</span>
        `;

        accordionHeader.addEventListener('click', (event) => {
            // Skip if we're clicking on the input
            if (event.target.classList.contains('header-input') || 
                event.target.classList.contains('dice-group-name-input')) {
                return;
            }
            this.toggleDiceGroupAccordion(event);
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
                    <i class="ts-icon-${type} ts-icon-size48" onclick="diceGroupManager.incrementDice('group-${groupIndex}-${type}')" 
                    oncontextmenu="diceGroupManager.decrementDice('group-${groupIndex}-${type}'); return false;"></i>
                    <div class="counter-overlay" id="group-${groupIndex}-${type}-counter-value">0</div>
                    <div class="dice-label">${type.toUpperCase()}</div>
                </div>
            `;
        });

        diceHTML += `
            <div class="plus-sign"><span>+</span></div>
            <div class="dice-counter unselectable" id="group-${groupIndex}-mod-counter">
                <i class="ts-icon-circle-dotted ts-icon-size48 mod-holder"></i>
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

        accordionHeader.querySelector('.accordion-toggle').textContent = '-';

        this.updateDiceGroupsData();
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

            this.diceTypes.forEach((diceType) => {
                const countElement = document.getElementById(`group-${groupId}-${diceType}-counter-value`);
                groupDiceCounts[diceType] = countElement ? parseInt(countElement.textContent, 10) : 0;
            });

            const modElement = document.getElementById(`group-${groupId}-mod-counter-value`);
            groupDiceCounts.mod = modElement ? parseInt(modElement.value, 10) : 0;

            this.diceGroupsData.push({
                name: groupName,
                diceCounts: groupDiceCounts
            });
        });

        // Update global diceGroupsData if it exists
        if (typeof diceGroupsData !== 'undefined') {
            diceGroupsData = this.diceGroupsData;
        }
    }

    /**
     * Removes the last dice group
     */
    removeDiceGroup() {
        const wrappers = document.querySelectorAll('.dice-group-wrapper');
        if (wrappers.length > 1) {
            wrappers[wrappers.length - 1].remove();
            this.diceGroupsData.pop();
        } else {
            console.warn("Can't remove the last group.");
        }

        this.updateDiceGroupsData();
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
            counter.querySelector('.ts-icon-size48').setAttribute('onclick', `diceGroupManager.incrementDice('group-${newIndex}-${diceType}')`);
            counter.querySelector('.ts-icon-size48').setAttribute('oncontextmenu', `diceGroupManager.decrementDice('group-${newIndex}-${diceType}'); return false;`);
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

        // Check if collapsed based on display style
        const isCollapsed = content.style.display === 'none';

        if (isCollapsed) {
            // Expand
            content.style.display = 'flex';
            content.style.maxHeight = 'none'; // Allow natural height
            icon.textContent = '-';
        } else {
            // Collapse
            content.style.display = 'none';
            icon.textContent = '+';
        }
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
