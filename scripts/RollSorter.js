/**
 * RollSorter - Handles all sorting functionality for saved rolls
 * including sorting creature groups, roll entries, and dice groups within rolls
 */
class RollSorter {
    constructor() {
        // Initialize event listeners for sorting functionality
        this.initializeSortingFunctionality();
    }

    /**
     * Sorts saved roll accordions based on the selected sort option.
     * 
     * This function first sorts the groups within each roll based on the roll sorting option,
     * then sorts the creature groups themselves based on the selected criteria.
     */
    sortSavedRolls() {
        if (debugMode) {
            console.log("Sorting creature groups...");
        }

        // Get both sort options
        const creatureSortOption = document.getElementById("sort-options").value;
        const rollsSortOption = document.getElementById("sort-rolls-options").value;
        
        // First, sort groups within each roll based on the roll sorting option
        this.sortGroupsWithinRolls(rollsSortOption);

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
        switch (creatureSortOption) {
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

        // After sorting creature groups, also apply the current roll sorting option
        this.sortRollsWithinGroups();

        if (debugMode) {
            console.log("Creature group sorting complete");
        }
    }

    /**
     * Sorts roll entries within each creature group based on the selected sort option.
     * 
     * This function sorts individual roll entries within each creature group based on
     * the name of the first dice group in each roll.
     */
    sortRollsWithinGroups() {
        if (debugMode) {
            console.log("Sorting roll entries within creature groups...");
        }

        const sortOption = document.getElementById("sort-rolls-options").value;
        const creatureGroups = document.querySelectorAll('.saved-roll-group');

        // First, sort the groups within each roll according to the sort option
        this.sortGroupsWithinRolls(sortOption);

        // Sort roll entries within each creature group
        creatureGroups.forEach(group => {
            const rollsContent = group.querySelector('.saved-rolls-content');
            if (!rollsContent) return;

            const rollEntries = Array.from(rollsContent.querySelectorAll('.saved-roll-entry'));
            
            // Apply sorting logic to roll entries
            switch (sortOption) {
                case "default":
                    rollEntries.sort((a, b) => {
                        const aTimestamp = parseInt(a.dataset.timestamp) || 0;
                        const bTimestamp = parseInt(b.dataset.timestamp) || 0;
                        return aTimestamp - bTimestamp; // Sort by creation order (oldest first)
                    });
                    break;
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
            console.log("Roll entry sorting complete");
        }
    }

    /**
     * Sorts the dice groups within each saved roll entry by group name or preserves original order.
     * 
     * This function reorganizes the DOM elements representing dice groups within
     * each saved roll based on the selected sort option. It can sort alphabetically
     * or restore the original order (by group index).
     * 
     * @param {string} sortOption - The sorting option to apply ('default', 'nameAsc', or 'nameDesc')
     */
    sortGroupsWithinRolls(sortOption) {
        if (debugMode) {
            console.log(`Sorting dice groups within each roll (${sortOption})...`);
        }

        // If no sort option provided, get it from the dropdown
        if (!sortOption) {
            sortOption = document.getElementById("sort-rolls-options").value;
        }

        // Get all saved roll entries
        const rollEntries = document.querySelectorAll('.saved-roll-entry');
        
        rollEntries.forEach(rollEntry => {
            const diceDisplay = rollEntry.querySelector('.roll-entry-dice');
            if (!diceDisplay) return;
            
            // Get all dice groups in this roll entry
            const diceGroups = Array.from(diceDisplay.querySelectorAll('.dice-group'));
            
            // Sort dice groups based on selected option
            if (sortOption === 'default') {
                // Sort by original group index to restore original order
                diceGroups.sort((a, b) => {
                    const aIndex = parseInt(a.dataset.groupIndex, 10) || 0;
                    const bIndex = parseInt(b.dataset.groupIndex, 10) || 0;
                    return aIndex - bIndex;
                });
            } else if (sortOption === 'nameAsc') {
                // Sort alphabetically by name (A-Z)
                diceGroups.sort((a, b) => {
                    const aName = a.querySelector('.dice-group-name-text')?.textContent || "";
                    const bName = b.querySelector('.dice-group-name-text')?.textContent || "";
                    return aName.localeCompare(bName);
                });
            } else if (sortOption === 'nameDesc') {
                // Sort alphabetically by name (Z-A)
                diceGroups.sort((a, b) => {
                    const aName = a.querySelector('.dice-group-name-text')?.textContent || "";
                    const bName = b.querySelector('.dice-group-name-text')?.textContent || "";
                    return bName.localeCompare(aName);
                });
            }
            
            // Reorder the dice groups in the DOM
            diceDisplay.innerHTML = '';
            diceGroups.forEach(group => diceDisplay.appendChild(group));
            
            // Don't update group indices, as we want to preserve original order information
            // Even when sorted alphabetically, we keep the original indices
        });

        if (debugMode) {
            console.log("Groups within rolls sorting completed");
        }
    }

    /**
     * Initializes and sets up event listeners for the sorting functionality.
     * 
     * This function adds event listeners to the sort dropdowns and ensures
     * that both the group-within-roll sorting and roll-within-group sorting
     * are properly applied.
     */
    initializeSortingFunctionality() {
        // Wait for DOM to be ready before setting up event listeners
        document.addEventListener("DOMContentLoaded", () => {
            const creatureSortOptions = document.getElementById("sort-options");
            const rollsSortOptions = document.getElementById("sort-rolls-options");
            
            // First, update the select options in the HTML to include the default option
            if (rollsSortOptions && !rollsSortOptions.querySelector('option[value="default"]')) {
                // Add the default option if it doesn't exist yet
                const defaultOption = document.createElement('option');
                defaultOption.value = 'default';
                defaultOption.textContent = 'Default (Creation Order)';
                
                // Insert as the first option
                if (rollsSortOptions.firstChild) {
                    rollsSortOptions.insertBefore(defaultOption, rollsSortOptions.firstChild);
                } else {
                    rollsSortOptions.appendChild(defaultOption);
                }
                
                // Select the default option
                defaultOption.selected = true;
            }
            
            if (creatureSortOptions) {
                creatureSortOptions.addEventListener("change", () => {
                    this.sortSavedRolls(); // This will also call sortGroupsWithinRolls with the appropriate option
                });
            } else {
                console.error("Creature sort options element not found");
            }
            
            if (rollsSortOptions) {
                rollsSortOptions.addEventListener("change", () => {
                    this.sortRollsWithinGroups(); // This will also call sortGroupsWithinRolls with the appropriate option
                });
            } else {
                console.error("Roll sort options element not found");
            }

            // Use default sorting option initially
            if (rollsSortOptions) {
                rollsSortOptions.value = 'default';
            }
            
            this.sortSavedRolls();
        });
    }
}
