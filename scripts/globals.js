/**
 * debugMode controls whether we log debug messages to the console.
 */
let debugMode = true; // Set to false to disable console logging

/**
 * Tracks whether the Ctrl key is currently held down.
 * Used as a fallback because TaleSpire's Electron environment
 * may strip modifier key info from mouse events (e.g., event.ctrlKey).
 */
let isCtrlHeld = false;

/**
 * Flag used to confirm overwriting of existing saved rolls.
 * This is set to true when the user confirms they want to overwrite
 * an existing roll with the same name and group structure.
 */
let overwriteConfirmed = false;

/**
 * Array of arrays, contains diceGroupsData[] arrays as elements which is
 * everything saved to JSON ./localstorage/ inside one array.
 */
let savedInVault = [];

/**
 * Array of objects, contains the dice groups that are currently being rolled.
 */
let diceGroupsData = [];

/**
 * Array of objects, contains the saved dice groups.
 */
let savedDiceGroups = [];

/**
 * Array of objects, contains the active set of dice rolls being tracked by
 * the symbiote.
 */
let trackedRollIds = {};

/**
 * Tracks active explosion chains, keyed by the parent (original) rollId.
 * Each entry stores accumulated results, explosion round, and chain metadata.
 */
let activeExplosionChains = {};

/**
 * Maps a child (explosion re-roll) rollId back to the parent rollId
 * that started the explosion chain.
 */
let explosionChildToParent = {};

/**
 * Die size step-up progression for the "Escalating Explosions" setting.
 * When enabled, each explosion re-rolls with the next larger die type.
 * d20 stays d20 (already at max size).
 */
const dieStepUpMap = Object.freeze({
    d4: "d6",
    d6: "d8",
    d8: "d10",
    d10: "d12",
    d12: "d20",
    d20: "d20"
});

/**
 * Array containing all dice denominations that exist.
 */
const diceTypes = ["d4", "d6", "d8", "d10", "d100", "d12", "d20"];

/**
 * Defines the available roll types for dice operations. The available roll
 * types include:
 *
 * - normal: A standard roll without any modifiers.
 * - advantage: Roll multiple dice and take the highest result.
 * - disadvantage: Roll multiple dice and take the lowest result.
 * - bestofThree: Roll three dice and take the best result.
 * - critical: A critical roll, often leading to enhanced effects or outcomes.
 * - duality: 2d12 roll where one is Hope, other is Fear. Dice are totalled and the higher repesents the "with hope" or "with fear" result.
 */
const rollTypes = Object.freeze({
    normal: "normal",
    advantage: "advantage",
    disadvantage: "disadvantage",
    bestofThree: "best-of-three",
    critical: "crit-dice",
    duality: "duality",
});

/**
 * Defines a set of event types related to dice roll operations. The defined
 * event types include:
 *
 * - `rollResults`: Emitted when dice roll results are available.
 * - `rollRemoved`: Emitted when a dice roll is removed from consideration or display.
 */
const rollEvents = Object.freeze({
    rollResults: "rollResults",
    rollRemoved: "rollRemoved",
});