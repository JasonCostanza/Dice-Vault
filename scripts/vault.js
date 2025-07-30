// Main application entry point - now properly organized with class-based architecture
// This file contains class instantiation and backward compatibility functions

// Initialize all class instances
const diceGroupManager = new DiceGroupManager();
const rollSorter = new RollSorter();
const savedRollManager = new SavedRollManager(diceGroupManager, rollSorter);
const uiManager = new UIManager();

// Backward compatibility functions - these delegate to the appropriate classes
function incrementDice(type) {
    return diceGroupManager.incrementDice(type);
}

function decrementDice(type) {
    return diceGroupManager.decrementDice(type);
}

function addDiceGroup() {
    return diceGroupManager.addDiceGroup();
}

function removeDiceGroup() {
    return diceGroupManager.removeDiceGroup();
}

function updateDiceGroupsData() {
    return diceGroupManager.updateDiceGroupsData();
}

function isDiceGroupEmpty(diceGroup) {
    return diceGroupManager.isDiceGroupEmpty(diceGroup);
}

function toggleDiceGroupAccordion(event) {
    return diceGroupManager.toggleDiceGroupAccordion(event);
}

// Sorting function delegates
function sortSavedRolls() {
    return rollSorter.sortSavedRolls();
}

function sortRollsWithinGroups() {
    return rollSorter.sortRollsWithinGroups();
}

function sortGroupsWithinRolls(sortOption) {
    return rollSorter.sortGroupsWithinRolls(sortOption);
}

function initializeSortingFunctionality() {
    // This is now handled by the RollSorter constructor
    // Keep this function for backward compatibility but it does nothing
}

document.addEventListener("DOMContentLoaded", () => diceGroupManager.updateDiceGroupsData());
document.getElementById("save-rolls-button").addEventListener("click", saveRollsToLocalStorage);
document.getElementById("load-rolls-button").addEventListener("click", loadRollsFromLocalStorage);
document.addEventListener("DOMContentLoaded", function () {
    const diceGroupsContainer = document.querySelector(".content-col-dice");
    if (diceGroupsContainer && diceGroupsContainer.children.length === 0) { // If there are no dice groups, add a new dice group
        diceGroupManager.addDiceGroup();
    }
});

// === BACKWARD COMPATIBILITY FUNCTIONS FOR SAVED ROLL MANAGER ===
// These functions delegate to the SavedRollManager class instance

function deleteSavedRoll(element) {
    return savedRollManager.deleteSavedRoll(element);
}

function abortEditing() {
    return savedRollManager.abortEditing();
}

function save() {
    return savedRollManager.save();
}

function findExistingRoll(creatureName, groupsData) {
    return savedRollManager.findExistingRoll(creatureName, groupsData);
}

function showOverwriteModal(creatureName) {
    return savedRollManager.showOverwriteModal(creatureName);
}

function toggleOverlay(show) {
    return savedRollManager.toggleOverlay(show);
}

function creatureNameExists(creatureName) {
    return savedRollManager.creatureNameExists(creatureName);
}

function createRollButton(imageName, rollType, rollGroups, cssClasses, parent) {
    return savedRollManager.createRollButton(imageName, rollType, rollGroups, cssClasses, parent);
}

function updateRollButtons(rollEntry, rollData) {
    return savedRollManager.updateRollButtons(rollEntry, rollData);
}

function updateSavedRoll(rollId, rollData) {
    return savedRollManager.updateSavedRoll(rollId, rollData);
}

function addSavedRoll(creatureName, savedRoll) {
    return savedRollManager.addSavedRoll(creatureName, savedRoll);
}

function startEditingSavedRoll(elementOrId) {
    return savedRollManager.startEditingSavedRoll(elementOrId);
}

function reset() {
    return savedRollManager.reset();
}

// === BACKWARD COMPATIBILITY FUNCTIONS FOR UI MANAGER ===
// These functions delegate to the UIManager class instance

function toggleAccordion(header) {
    return uiManager.toggleAccordion(header);
}