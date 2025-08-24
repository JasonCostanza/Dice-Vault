// Main application entry point - clean class-based architecture
// This file contains class instantiation and application initialization

// Initialize all class instances
const diceGroupManager = new DiceGroupManager();
const rollSorter = new RollSorter();
const savedRollManager = new SavedRollManager(diceGroupManager, rollSorter);
const uiManager = new UIManager();
const counterManager = new CounterManager();

// Create global rollsModule reference for TaleSpire subscription handlers
const rollsModule = rollManager;

// === APPLICATION INITIALIZATION ===
// Set up essential event listeners and initialize the application

document.addEventListener("DOMContentLoaded", () => {
    // Initialize dice groups data
    diceGroupManager.updateDiceGroupsData();
    
    // Add initial dice group if container is empty
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    if (diceGroupsContainer && diceGroupsContainer.children.length === 0) {
        diceGroupManager.addDiceGroup();
    }
});

// Set up save/load button event listeners
document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save-rolls-button");
    const loadButton = document.getElementById("load-rolls-button");
    
    if (saveButton) {
        saveButton.addEventListener("click", () => {
            saveRollsToLocalStorage();
            // Close mobile menu after action
            const mobileMenuModal = document.getElementById('mobile-menu-modal');
            if (mobileMenuModal && !mobileMenuModal.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    }
    
    if (loadButton) {
        loadButton.addEventListener("click", () => {
            loadRollsFromLocalStorage();
            // Close mobile menu after action
            const mobileMenuModal = document.getElementById('mobile-menu-modal');
            if (mobileMenuModal && !mobileMenuModal.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    }
});

// Save/load functions are implemented in SaveLoadManager.js
// No need to redefine them here
