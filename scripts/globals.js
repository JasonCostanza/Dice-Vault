let savedInVault = []; // Array of arrays, contains diceGroupsData[] arrays as elements which is everything saved to JSON ./localstorage/ inside one array
let diceGroupsData = []; // Array of objects, contains the dice groups that are currently being rolled
let savedDiceGroups = []; // MOVE to globals.js
let trackedRollIds = {}; // MOVE to globals.js
const diceTypes = ["d4", "d6", "d8", "d10", "d12", "d20"]; // Array containing all dice denominations that exist

const rollTypes = Object.freeze({
    normal: "normal",
    advantage: "advantage",
    disadvantage: "disadvantage",
    bestofThree: "best-of-three",
    critical: "crit-dice",
});
