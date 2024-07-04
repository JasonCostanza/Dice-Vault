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
 * Array containing all dice denominations that exist.
 */
const diceTypes = ["d4", "d6", "d8", "d10", "d12", "d20"];

/**
 * Defines the available roll types for dice operations. The available roll
 * types include:
 *
 * - normal: A standard roll without any modifiers.
 * - advantage: Roll multiple dice and take the highest result.
 * - disadvantage: Roll multiple dice and take the lowest result.
 * - bestofThree: Roll three dice and take the best result.
 * - critical: A critical roll, often leading to enhanced effects or outcomes.
 */
const rollTypes = Object.freeze({
    normal: "normal",
    advantage: "advantage",
    disadvantage: "disadvantage",
    bestofThree: "best-of-three",
    critical: "crit-dice",
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
