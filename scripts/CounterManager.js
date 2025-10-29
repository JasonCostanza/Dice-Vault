class CounterManager {
    constructor() {
        this.counters = [];
        this.loadCounters();
    }

    /**
     * Creates a new counter when the "New Counter" button is clicked
     */
    async newCounter() {
        const purpose = await uiManager.showInput(
            getTranslation('counterPurposePrompt'),
            getTranslation('counterPurposePlaceholder'),
            getTranslation('newCounterTitle'),
            ""
        );
        
        if (!purpose || purpose.trim() === '') {
            return;
        }

        const counter = {
            id: `counter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            purpose: purpose.trim(),
            value: 0,
            timestamp: Date.now()
        };

        this.addCounter(counter);
        this.saveCounters();
        handleDataChange();
    }

    /**
     * Adds a counter to the UI
     * @param {Object} counter - The counter object to add
     */
    addCounter(counter) {
        this.addCounterToUI(counter);
        this.counters.push(counter);
    }

    /**
     * Increments a counter value
     * @param {string} counterId - The ID of the counter to increment
     */
    incrementCounter(counterId) {
        const counter = this.counters.find(c => c.id === counterId);
        if (counter) {
            counter.value++;
            this.updateCounterDisplay(counterId, counter.value);
            this.saveCounters();
            handleDataChange();
        }
    }

    /**
     * Decrements a counter value
     * @param {string} counterId - The ID of the counter to decrement
     */
    decrementCounter(counterId) {
        const counter = this.counters.find(c => c.id === counterId);
        if (counter) {
            counter.value--;
            this.updateCounterDisplay(counterId, counter.value);
            this.saveCounters();
            handleDataChange();
        }
    }

    /**
     * Updates a counter value from input field
     * @param {string} counterId - The ID of the counter to update
     * @param {string} value - The new value
     */
    updateCounterValue(counterId, value) {
        const counter = this.counters.find(c => c.id === counterId);
        if (counter) {
            counter.value = parseInt(value) || 0;
            this.updateCounterDisplay(counterId, counter.value);
            this.saveCounters();
            handleDataChange();
        }
    }

    /**
     * Updates the display of a counter
     * @param {string} counterId - The ID of the counter to update
     * @param {number} value - The new value to display
     */
    updateCounterDisplay(counterId, value) {
        const counterEntry = document.querySelector(`[data-counter-id="${counterId}"]`);
        if (counterEntry) {
            const valueInput = counterEntry.querySelector('.counter-value');
            if (valueInput) {
                valueInput.value = value;
            }
            counterEntry.dataset.value = value;
        }
    }

    /**
     * Starts editing a counter
     * @param {Element} element - The edit button element
     */
    async startEditingCounter(element) {
        const counterEntry = element.closest('.counter-entry');
        const counterId = counterEntry.dataset.counterId;
        const counter = this.counters.find(c => c.id === counterId);
        
        if (!counter) return;

        const newPurpose = await uiManager.showInput(
            getTranslation('editCounterPrompt'),
            getTranslation('counterPurposePlaceholder'),
            getTranslation('editCounterTitle'),
            counter.purpose
        );
        
        if (newPurpose !== null && newPurpose.trim() !== '') {
            counter.purpose = newPurpose.trim();
            counterEntry.dataset.purpose = counter.purpose;
            
            const purposeSpan = counterEntry.querySelector('.counter-purpose');
            if (purposeSpan) {
                purposeSpan.textContent = counter.purpose;
            }
            
            this.saveCounters();
            handleDataChange();
        }
    }

    /**
     * Deletes a counter
     * @param {Element} element - The delete button element
     */
    deleteCounter(element) {
        const counterEntry = element.closest('.counter-entry');
        const counterId = counterEntry.dataset.counterId;
        
        // Remove from array
        this.counters = this.counters.filter(c => c.id !== counterId);
        
        // Remove from DOM
        counterEntry.remove();
        
        // Check if Counters group is now empty and remove it
        const countersGroup = document.querySelector(`.saved-roll-group[data-creature-name="Counters"]`);
        if (countersGroup) {
            const remainingCounters = countersGroup.querySelectorAll('.counter-entry');
            if (remainingCounters.length === 0) {
                countersGroup.remove();
            }
        }
        
        this.saveCounters();
        handleDataChange();
    }

    /**
     * Saves counters to localStorage
     */
    saveCounters() {
        localStorage.setItem('diceVaultCounters', JSON.stringify(this.counters));
    }

    /**
     * Loads counters from localStorage
     */
    loadCounters() {
        const savedCounters = localStorage.getItem('diceVaultCounters');
        if (savedCounters) {
            this.counters = JSON.parse(savedCounters);
            // Recreate counter entries in UI without adding to array again
            this.counters.forEach(counter => {
                this.addCounterToUI(counter);
            });
        }
    }

    /**
     * Adds a counter to the UI without adding to the internal array
     * @param {Object} counter - The counter object to add
     */
    addCounterToUI(counter) {
        const countersContainer = document.querySelector(".saved-rolls-container");
        
        // Check if "Counters" group already exists
        let countersGroup = document.querySelector(`.saved-roll-group[data-creature-name="Counters"]`);
        
        if (!countersGroup) {
            // Create new accordion section for Counters
            countersGroup = document.createElement("div");
            countersGroup.className = "saved-roll-group";
            countersGroup.dataset.creatureName = "Counters";
            
            countersGroup.innerHTML = `
                <div class="saved-roll-header" onclick="uiManager.toggleAccordion(this)">
                    <span>${getTranslation('countersHeader')}</span> <span class="accordion-icon">-</span>
                </div>
                <div class="saved-rolls-content"></div>
            `;
            
            countersContainer.appendChild(countersGroup);
        }

        const countersContent = countersGroup.querySelector(".saved-rolls-content");
        
        // Create the counter entry
        const counterEntry = document.createElement("div");
        counterEntry.className = "saved-roll-entry counter-entry";
        counterEntry.dataset.counterId = counter.id;
        counterEntry.dataset.purpose = counter.purpose;
        counterEntry.dataset.value = counter.value;
        counterEntry.dataset.timestamp = counter.timestamp;

        // Create counter display with input field and buttons
        const editIcon = '<i class="ts-icon-pencil ts-icon-xsmall"></i>';
        const deleteIcon = '<i class="ts-icon-trash ts-icon-xsmall"></i>';

        counterEntry.innerHTML = `
            <div class="roll-entry-container">
                <div class="counter-display">
                    <span class="counter-purpose">${counter.purpose}</span>
                    <input type="number" class="counter-value" value="${counter.value}" onchange="counterManager.updateCounterValue('${counter.id}', this.value)">
                </div>
                <div class="buttons-container">
                    <div class="edit-counter" onclick="counterManager.startEditingCounter(this)">${editIcon}</div>
                    <div class="delete-counter" onclick="counterManager.deleteCounter(this)">${deleteIcon}</div>
                </div>
            </div>
        `;

        countersContent.appendChild(counterEntry);
    }

    /**
     * Resets all counters to 0
     */
    async resetAllCounters() {
        const confirmed = await uiManager.showConfirmation(getTranslation('resetAllCountersConfirm'), getTranslation('resetAllCountersTitle'));
        
        if (confirmed) {
            this.counters.forEach(counter => {
                counter.value = 0;
                this.updateCounterDisplay(counter.id, 0);
            });
            this.saveCounters();
            handleDataChange();
        }
    }

    /**
     * Deletes all counters
     */
    async deleteAllCounters() {
        const confirmed = await uiManager.showConfirmation(getTranslation('deleteAllCountersConfirm'), getTranslation('deleteAllCountersTitle'));
        
        if (confirmed) {
            this.counters = [];
            const countersGroup = document.querySelector(`.saved-roll-group[data-creature-name="Counters"]`);
            if (countersGroup) {
                countersGroup.remove();
            }
            this.saveCounters();
            handleDataChange();
        }
    }
}
