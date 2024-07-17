/**
 * Upgrades the rolls data from the old format to the new format.
 * 
 * @param {Array} oldData - The old rolls data in 1.3 format.
 * @returns {Array} The upgraded rolls data in 2.0 format.
 */
function upgradeRollsData(oldData) {
    return oldData.map(oldRoll => ({
        name: oldRoll.name,
        type: oldRoll.type,
        counts: [{
            d4: parseInt(oldRoll.counts.d4) || 0,
            d6: parseInt(oldRoll.counts.d6) || 0,
            d8: parseInt(oldRoll.counts.d8) || 0,
            d10: parseInt(oldRoll.counts.d10) || 0,
            d12: parseInt(oldRoll.counts.d12) || 0,
            d20: parseInt(oldRoll.counts.d20) || 0,
            mod: parseInt(oldRoll.counts.mod) || 0
        }]
    }));
}