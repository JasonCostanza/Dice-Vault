// Main application entry point - clean class-based architecture
// This file contains class instantiation and application initialization

// Initialize all class instances
const diceGroupManager = new DiceGroupManager();
const rollSorter = new RollSorter();
const savedRollManager = new SavedRollManager(diceGroupManager, rollSorter);
const uiManager = new UIManager();

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
        saveButton.addEventListener("click", saveRollsToLocalStorage);
    }
    
    if (loadButton) {
        loadButton.addEventListener("click", loadRollsFromLocalStorage);
    }
});

/**
 * Saves the current dice configuration to local storage.
 * This function collects all dice groups from the UI and saves them
 * to TaleSpire's local storage system.
 */
function saveRollsToLocalStorage() {
    // Implementation is in SaveLoadManager.js
}

/**
 * Loads saved dice configurations from local storage.
 * This function retrieves previously saved dice groups from TaleSpire's
 * local storage and restores them to the UI.
 */
function loadRollsFromLocalStorage() {
    // Implementation is in SaveLoadManager.js
}
