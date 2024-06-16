//let isGM = false;
//let me;
//let gmRolls = {};
let trackedIds = {};
let savedInVault = []; // Array of arrays, contains diceGroupsData[] arrays as elements which is everything saved to JSON ./localstorage/ inside one array
const diceGroupsData= [];
const savedDiceGroups = [];
const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];