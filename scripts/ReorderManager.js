/**
 * ReorderManager - Handles drag-and-drop reordering for both dice groups
 * and pinned saved rolls via drag handles.
 */
class ReorderManager {
    /**
     * Creates a new ReorderManager instance
     * @param {DiceGroupManager} diceGroupManager - Reference to the dice group manager
     * @param {RollSorter} rollSorter - Reference to the roll sorter
     */
    constructor(diceGroupManager, rollSorter) {
        this.diceGroupManager = diceGroupManager;
        this.rollSorter = rollSorter;
        this._draggedElement = null;
        this._draggedRollElement = null;
    }

    /**
     * Initializes drag-and-drop reordering for a dice group wrapper.
     * The drag handle activates draggable on mousedown to avoid interfering
     * with text selection in the group name input.
     * @param {HTMLElement} wrapper - The .dice-group-wrapper element
     */
    initDragForGroup(wrapper) {
        const handle = wrapper.querySelector('.drag-handle');
        if (!handle) return;

        handle.addEventListener('mousedown', () => {
            wrapper.draggable = true;
        });

        handle.addEventListener('mouseup', () => {
            wrapper.draggable = false;
        });

        wrapper.addEventListener('dragstart', (e) => this._onDragStart(e, wrapper));
        wrapper.addEventListener('dragend', () => this._onDragEnd(wrapper));
        wrapper.addEventListener('dragover', (e) => this._onDragOver(e, wrapper));
        wrapper.addEventListener('dragleave', () => this._onDragLeave(wrapper));
        wrapper.addEventListener('drop', (e) => this._onDrop(e, wrapper));
    }

    /**
     * Handles the dragstart event for a dice group
     * @param {DragEvent} e - The drag event
     * @param {HTMLElement} wrapper - The wrapper being dragged
     */
    _onDragStart(e, wrapper) {
        this._draggedElement = wrapper;
        e.dataTransfer.effectAllowed = 'move';
        wrapper.classList.add('dragging');
    }

    /**
     * Handles the dragend event, cleaning up all drag state
     * @param {HTMLElement} wrapper - The wrapper that was being dragged
     */
    _onDragEnd(wrapper) {
        wrapper.classList.remove('dragging');
        wrapper.draggable = false;
        this._draggedElement = null;

        // Clean up all indicator classes
        document.querySelectorAll('.dice-group-wrapper').forEach(w => {
            w.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    }

    /**
     * Handles the dragover event to show drop position indicators
     * @param {DragEvent} e - The drag event
     * @param {HTMLElement} wrapper - The wrapper being dragged over
     */
    _onDragOver(e, wrapper) {
        e.preventDefault();
        if (wrapper === this._draggedElement) return;

        const rect = wrapper.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            wrapper.classList.add('drag-over-top');
            wrapper.classList.remove('drag-over-bottom');
        } else {
            wrapper.classList.add('drag-over-bottom');
            wrapper.classList.remove('drag-over-top');
        }
    }

    /**
     * Handles the dragleave event, removing drop indicators
     * @param {HTMLElement} wrapper - The wrapper being left
     */
    _onDragLeave(wrapper) {
        wrapper.classList.remove('drag-over-top', 'drag-over-bottom');
    }

    /**
     * Handles the drop event, moving the dragged group to the new position
     * @param {DragEvent} e - The drop event
     * @param {HTMLElement} wrapper - The drop target wrapper
     */
    _onDrop(e, wrapper) {
        e.preventDefault();
        if (!this._draggedElement || wrapper === this._draggedElement) return;

        if (wrapper.classList.contains('drag-over-top')) {
            wrapper.parentNode.insertBefore(this._draggedElement, wrapper);
        } else if (wrapper.classList.contains('drag-over-bottom')) {
            wrapper.parentNode.insertBefore(this._draggedElement, wrapper.nextSibling);
        }

        wrapper.classList.remove('drag-over-top', 'drag-over-bottom');
        this.diceGroupManager.updateDiceGroupsData();
    }

    /**
     * Initializes drag-and-drop reordering for a saved roll entry.
     * Drops are constrained to within the same creature group (.saved-rolls-content).
     * @param {HTMLElement} rollEntry - The .saved-roll-entry element
     */
    initDragForRoll(rollEntry) {
        const handle = rollEntry.querySelector('.drag-handle');
        if (!handle) return;

        handle.addEventListener('mousedown', () => {
            rollEntry.draggable = true;
        });

        handle.addEventListener('mouseup', () => {
            rollEntry.draggable = false;
        });

        rollEntry.addEventListener('dragstart', (e) => this._onRollDragStart(e, rollEntry));
        rollEntry.addEventListener('dragend', () => this._onRollDragEnd(rollEntry));
        rollEntry.addEventListener('dragover', (e) => this._onRollDragOver(e, rollEntry));
        rollEntry.addEventListener('dragleave', () => this._onRollDragLeave(rollEntry));
        rollEntry.addEventListener('drop', (e) => this._onRollDrop(e, rollEntry));
    }

    /**
     * Handles the dragstart event for a saved roll entry
     * @param {DragEvent} e - The drag event
     * @param {HTMLElement} rollEntry - The entry being dragged
     */
    _onRollDragStart(e, rollEntry) {
        this._draggedRollElement = rollEntry;
        e.dataTransfer.effectAllowed = 'move';
        rollEntry.classList.add('dragging');
    }

    /**
     * Handles the dragend event for a saved roll entry, cleaning up all drag state
     * @param {HTMLElement} rollEntry - The entry that was being dragged
     */
    _onRollDragEnd(rollEntry) {
        rollEntry.classList.remove('dragging');
        rollEntry.draggable = false;
        this._draggedRollElement = null;

        document.querySelectorAll('.saved-roll-entry').forEach(e => {
            e.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    }

    /**
     * Handles the dragover event for a saved roll entry, showing drop indicators.
     * Ignores drags from a different creature group.
     * @param {DragEvent} e - The drag event
     * @param {HTMLElement} rollEntry - The entry being dragged over
     */
    _onRollDragOver(e, rollEntry) {
        e.preventDefault();
        if (!this._draggedRollElement || rollEntry === this._draggedRollElement) return;

        // Only allow drops within the same creature group
        if (rollEntry.closest('.saved-rolls-content') !== this._draggedRollElement.closest('.saved-rolls-content')) return;

        const rect = rollEntry.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            rollEntry.classList.add('drag-over-top');
            rollEntry.classList.remove('drag-over-bottom');
        } else {
            rollEntry.classList.add('drag-over-bottom');
            rollEntry.classList.remove('drag-over-top');
        }
    }

    /**
     * Handles the dragleave event for a saved roll entry, removing drop indicators
     * @param {HTMLElement} rollEntry - The entry being left
     */
    _onRollDragLeave(rollEntry) {
        rollEntry.classList.remove('drag-over-top', 'drag-over-bottom');
    }

    /**
     * Handles the drop event for a saved roll entry, moving it to the new position
     * @param {DragEvent} e - The drop event
     * @param {HTMLElement} rollEntry - The drop target entry
     */
    _onRollDrop(e, rollEntry) {
        e.preventDefault();
        if (!this._draggedRollElement || rollEntry === this._draggedRollElement) return;
        if (rollEntry.closest('.saved-rolls-content') !== this._draggedRollElement.closest('.saved-rolls-content')) return;

        if (rollEntry.classList.contains('drag-over-top')) {
            rollEntry.parentNode.insertBefore(this._draggedRollElement, rollEntry);
        } else if (rollEntry.classList.contains('drag-over-bottom')) {
            rollEntry.parentNode.insertBefore(this._draggedRollElement, rollEntry.nextSibling);
        }

        rollEntry.classList.remove('drag-over-top', 'drag-over-bottom');
        this._setCustomSortMode();
        handleDataChange();
    }

    /**
     * Switches the rolls sort dropdown to "Custom" mode after a manual reorder,
     * adding the Custom option if it doesn't exist yet.
     */
    _setCustomSortMode() {
        const sortSelect = document.getElementById('sort-rolls-options');
        if (!sortSelect) return;

        // Add Custom option to the hidden <select> if it doesn't exist
        let customOption = sortSelect.querySelector('option[value="custom"]');
        if (!customOption) {
            customOption = document.createElement('option');
            customOption.value = 'custom';
            customOption.textContent = 'Custom';
            sortSelect.appendChild(customOption);
        }

        sortSelect.value = 'custom';

        // Also update the custom dropdown UI that mirrors this select
        const customDropdown = document.querySelector('.custom-dropdown[data-select="sort-rolls-options"]');
        if (customDropdown) {
            const menu = customDropdown.querySelector('.custom-dropdown-menu');
            const toggle = customDropdown.querySelector('.custom-dropdown-toggle');

            // Add "Custom" item to dropdown menu if not already present
            if (menu && !menu.querySelector('[data-value="custom"]')) {
                const customItem = document.createElement('div');
                customItem.className = 'custom-dropdown-item';
                customItem.dataset.value = 'custom';
                customItem.textContent = 'Custom';
                customItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sortSelect.value = 'custom';
                    sortSelect.dispatchEvent(new Event('change'));
                    menu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('selected'));
                    customItem.classList.add('selected');
                    const arrow = toggle.querySelector('.dropdown-arrow');
                    toggle.textContent = 'Custom';
                    if (arrow) toggle.appendChild(arrow);
                    menu.classList.add('hidden');
                    customDropdown.classList.remove('open');
                });
                menu.appendChild(customItem);
            }

            // Select the Custom item and deselect others
            if (menu) {
                menu.querySelectorAll('.custom-dropdown-item').forEach(i => {
                    i.classList.toggle('selected', i.dataset.value === 'custom');
                });
            }

            // Update toggle text
            if (toggle) {
                const arrow = toggle.querySelector('.dropdown-arrow');
                toggle.textContent = 'Custom';
                if (arrow) toggle.appendChild(arrow);
            }
        }
    }
}
