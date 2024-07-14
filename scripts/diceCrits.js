/**
 * Multiplies the total of all values in the result groups by 1.5, rounding down.
 * 
 * @param {Array<Object>} resultGroups - An array of result group objects.
 * @returns {Array<Object>} A new array of result groups with totals multiplied by 1.5 and rounded down.
 */
function onePointFiveTotal(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: onePointFiveResultsRecursive(group.result)
        }));
    }
    return onePointFiveResultsRecursive(result);
}

function onePointFiveResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        return {
            ...result,
            results: result.results.map(r => Math.floor(r * 1.5)), // Round down with Math.floor
            total: Math.floor((result.total || 0) * 1.5), // Round down with Math.floor
            description: `Critical Hit! Total multiplied by 1.5 (rounded down)`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(onePointFiveResultsRecursive),
            total: Math.floor((result.total || 0) * 1.5), // Round down with Math.floor
            description: `Critical Hit! Total multiplied by 1.5 (rounded down)`
        };
    } else if (result.value !== undefined) {
        return {
            ...result,
            value: Math.floor(result.value * 1.5) // Round down with Math.floor
        };
    }
    return result;
}

/**
 * Doubles the count of dice in roll groups, leaving modifiers unchanged.
 * 
 * This function is typically used for the "double-die-count" critical hit behavior.
 * It doubles the number of each type of die in the roll, but does not modify the modifier.
 *
 * @param {Array<Object>} rollGroups - An array of objects, each representing a group of dice counts.
 * @returns {Array<Object>} A new array of objects with doubled dice counts.
 */
function doubleDiceCounts(rollGroups) {
    return rollGroups.map(diceCounts => {
        let doubledDiceCounts = {};
        for (const [die, count] of Object.entries(diceCounts)) {
            if (die !== 'mod') {
                doubledDiceCounts[die] = String(parseInt(count, 10) * 2);
            } else {
                doubledDiceCounts[die] = count;
            }
        }
        return doubledDiceCounts;
    });
}

/**
 * Doubles the results of dice rolls in result groups.
 * 
 * This function handles complex nested structures of dice results.
 * It doubles each individual die result while leaving modifiers unchanged.
 *
 * @param {Array<Object>|Object} resultGroups - An array of result groups or a single result group.
 * @returns {Array<Object>} An array of result groups with doubled dice results.
 */
function doubleDiceResults(resultGroups) {
    if (!Array.isArray(resultGroups)) {
        console.warn('doubleDiceResults received non-array input, converting to array');
        resultGroups = [resultGroups];
    }

    return resultGroups.map(group => {
        if (group && group.result) {
            return {
                ...group,
                result: doubleResultsRecursive(group.result)
            };
        } else {
            console.warn('Encountered group without result, returning unchanged:', group);
            return group;
        }
    });
}

/**
 * Doubles the total of all values in the result group.
 * 
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array of result group objects with doubled totals.
 */
function doubleTotal(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: doubleResultsRecursive(group.result)
        }));
    }
    return doubleResultsRecursive(result);
}

/**
 * Recursively doubles dice results in a nested result structure.
 * 
 * This helper function is used by doubleDiceResults to handle nested operands.
 *
 * @param {Object} result - A result object that may contain nested operands.
 * @returns {Object} A new result object with doubled dice results.
 */
function doubleResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        return {
            ...result,
            results: result.results.map(r => r * 2)
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(doubleResultsRecursive)
        };
    } else {
        console.log('Encountered non-dice operand, returning unchanged:', result);
        return result;
    }
}

/**
 * Doubles the modifiers in result groups.
 * 
 * This function doubles all numeric modifiers in the result groups while
 * preserving the structure of the results.
 *
 * @param {Array<Object>} resultGroups - An array of result group objects.
 * @returns {Array<Object>} A new array of result groups with doubled modifiers.
 */
function doubleModifier(resultGroups) {
    function doubleMod(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                return { ...operand, operands: doubleMod(operand.operands) };
            } else if (operand.value) {
                let newValue = Math.abs(operand.value) * 2;
                return { ...operand, value: newValue };
            } else {
                return operand;
            }
        });
    }

    return resultGroups.map(resultGroup => {
        if (resultGroup && resultGroup.result && resultGroup.result.operands) {
            return {
                ...resultGroup,
                result: {
                    ...resultGroup.result,
                    operands: doubleMod(resultGroup.result.operands)
                }
            };
        }
        return resultGroup;
    });
}

function tripleTotal(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: tripleResultsRecursive(group.result)
        }));
    }
    return tripleResultsRecursive(result);
}

function tripleResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        return {
            ...result,
            results: result.results.map(r => r * 3),
            total: (result.total || 0) * 3,
            description: `Critical Hit! Total tripled`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(tripleResultsRecursive),
            total: (result.total || 0) * 3,
            description: `Critical Hit! Total tripled`
        };
    } else if (result.value !== undefined) {
        return {
            ...result,
            value: result.value * 3
        };
    }
    return result;
}

/**
 * Quadruples the total of all values in the result groups.
 * 
 * @param {Array<Object>} resultGroups - An array of result group objects.
 * @returns {Array<Object>} A new array of result groups with quadrupled totals.
 */
function quadrupleTotal(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: quadrupleResultsRecursive(group.result)
        }));
    }
    return quadrupleResultsRecursive(result);
}

function quadrupleResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        return {
            ...result,
            results: result.results.map(r => r * 4),
            total: (result.total || 0) * 4,
            description: `Critical Hit! Total quadrupled`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(quadrupleResultsRecursive),
            total: (result.total || 0) * 4,
            description: `Critical Hit! Total quadrupled`
        };
    } else if (result.value !== undefined) {
        return {
            ...result,
            value: result.value * 4
        };
    }
    return result;
}

/**
 * Maximizes all dice results in the given result groups.
 * 
 * This function sets each die result to its maximum possible value based on the die type.
 * It handles nested structures and preserves modifiers.
 *
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array of result group objects with maximized dice results.
 */
function maximizeDice(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: maximizeResultsRecursive(group.result)
        }));
    }
    return maximizeResultsRecursive(result);
}

function maximizeResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        const maxResult = parseInt(result.kind.substring(1), 10);
        return {
            ...result,
            results: result.results.map(() => maxResult),
            total: maxResult * result.results.length,
            description: `Critical Hit! Dice maximized to ${maxResult}`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(maximizeResultsRecursive),
            description: `Critical Hit! Dice maximized`
        };
    }
    return result;
}

/**
 * Adds the maximum possible value for each die to the original results.
 * 
 * This function is used for the "max-plus" critical hit behavior. It adds
 * the maximum value of each die type to the original roll, effectively rolling
 * an additional maximized die for each die in the original roll.
 *
 * @param {Array<Object>} resultGroups - An array of result group objects.
 * @returns {Array<Object>} A new array of result groups with added maximum die values.
 */
function addMaxDieForEachKind(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: addMaxResultsRecursive(group.result)
        }));
    }
    return addMaxResultsRecursive(result);
}

function addMaxResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        const maxResult = parseInt(result.kind.substring(1), 10);
        const maxResultsToAdd = new Array(result.results.length).fill(maxResult);
        return {
            ...result,
            results: [...result.results, ...maxResultsToAdd],
            total: (result.total || 0) + maxResultsToAdd.reduce((a, b) => a + b, 0),
            description: `Critical Hit! Added max value for each die`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(addMaxResultsRecursive),
            description: `Critical Hit! Added max value for each die`
        };
    }
    return result;
}

function calculateTotal(result) {
    if (result.operator && result.operands) {
        return result.operands.reduce((sum, operand) => sum + calculateTotal(operand), 0);
    } else if (result.results) {
        return result.results.reduce((sum, val) => sum + val, 0);
    } else if (result.value !== undefined) {
        return result.value;
    }
    return 0;
}