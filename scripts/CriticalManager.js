/**
 * Multiplies the total result by 1.5 (rounded down) for critical hit calculations.
 * 
 * This function handles both single results and arrays of result groups.
 * It applies a 1.5x multiplier to the total while preserving the structure.
 *
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array with totals multiplied by 1.5 (rounded down).
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

/**
 * Recursively applies a 1.5x multiplier to dice results and totals.
 * 
 * This helper function handles nested result structures and applies the multiplier
 * to individual dice results, totals, and values while adding a critical hit description.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with values multiplied by 1.5 (rounded down).
 */
function onePointFiveResultsRecursive(result) {
    if (result.kind && Array.isArray(result.results)) {
        return {
            ...result,
            results: result.results.map(r => Math.floor(r * 1.5)),
            total: Math.floor((result.total || 0) * 1.5),
            description: `Critical Hit! Total multiplied by 1.5 (rounded down)`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(onePointFiveResultsRecursive),
            total: Math.floor((result.total || 0) * 1.5),
            description: `Critical Hit! Total multiplied by 1.5 (rounded down)`
        };
    } else if (result.value !== undefined) {
        return {
            ...result,
            value: Math.floor(result.value * 1.5)
        };
    }
    return result;
}

/**
 * Doubles the dice counts in roll groups.
 * 
 * This function creates a copy of each roll group and doubles the count
 * of each die type present in the diceCounts object.
 *
 * @param {Array<Object>} rollGroups - An array of roll group objects with diceCounts.
 * @returns {Array<Object>} A new array of roll groups with doubled dice counts.
 */
function doubleDiceCounts(rollGroups) {
    return rollGroups.map(group => {
        let doubledGroup = { ...group };
        doubledGroup.diceCounts = { ...group.diceCounts };
        
        // Handle all dice types, even those that are missing from diceCounts
        diceTypes.forEach(diceType => {
            const count = group.diceCounts[diceType] || 0;
            if (count > 0) {
                doubledGroup.diceCounts[diceType] = count * 2;
            }
        });
        
        return doubledGroup;
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
            results: result.results.map(r => r * 2),
            total: (result.total || 0) * 2,
            description: `Critical Hit! Dice results doubled`
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        return {
            ...result,
            operands: result.operands.map(doubleResultsRecursive),
            total: (result.total || 0) * 2,
            description: `Critical Hit! Dice results doubled`
        };
    }
    return result;
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
    /**
     * Recursively doubles modifier values in operand structures.
     * 
     * This helper function processes nested operands and doubles the absolute
     * value of numeric modifiers while preserving the structure.
     *
     * @param {Array<Object>} operands - An array of operand objects.
     * @returns {Array<Object>} A new array of operands with doubled modifier values.
     */
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

/**
 * Triples the total of all values in the result groups.
 * 
 * This function handles both single results and arrays of result groups.
 * It applies a 3x multiplier to the total while preserving the structure.
 *
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array with totals tripled.
 */
function tripleTotal(result) {
    if (Array.isArray(result)) {
        return result.map(group => ({
            ...group,
            result: tripleResultsRecursive(group.result)
        }));
    }
    return tripleResultsRecursive(result);
}

/**
 * Recursively triples dice results in a nested result structure.
 * 
 * This helper function is used by tripleTotal to handle nested operands.
 * It applies a 3x multiplier to individual dice results, totals, and values.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with values tripled.
 */
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
 * This function handles both single results and arrays of result groups.
 * It applies a 4x multiplier to the total while preserving the structure.
 *
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array with totals quadrupled.
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

/**
 * Recursively quadruples dice results in a nested result structure.
 * 
 * This helper function is used by quadrupleTotal to handle nested operands.
 * It applies a 4x multiplier to individual dice results, totals, and values.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with values quadrupled.
 */
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

/**
 * Recursively maximizes dice results in a nested result structure.
 * 
 * This helper function is used by maximizeDice to handle nested operands.
 * It sets each die result to its maximum possible value based on the die type.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with maximized dice results.
 */
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
 * Adds the maximum value for each die to the original results.
 * 
 * This function is used for the "max-plus" critical hit behavior. It adds
 * the maximum value of each die type to the original roll, effectively rolling
 * an additional maximized die for each die in the original roll.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with added maximum die values.
 */
function maxPlusDice(result) {
    if (result.operator && result.operands) {
        return {
            ...result,
            operands: result.operands.map(maxPlusDice),
            total: calculateTotal(result),
            description: `Critical Hit! Max die value added for each die`
        };
    } else if (result.kind && result.results) {
        const maxValue = parseInt(result.kind.substring(1), 10);
        const newResults = [...result.results, ...result.results.map(() => maxValue)];
        return {
            ...result,
            results: newResults,
            total: newResults.reduce((sum, val) => sum + val, 0)
        };
    }
    return result;
}

/**
 * Calculates the total value of a dice roll result.
 * 
 * This function recursively processes nested structures to sum up all values.
 * It handles operators, results arrays, and individual values.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {number} The total calculated value.
 */
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

/**
 * Adds the maximum possible value for each die to the original results.
 * 
 * This function is used for the "max-plus" critical hit behavior. It adds
 * the maximum value of each die type to the original roll, effectively rolling
 * an additional maximized die for each die in the original roll.
 *
 * @param {Object|Array<Object>} result - A single result object or an array of result group objects.
 * @returns {Object|Array<Object>} A new result object or array with added maximum die values.
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

/**
 * Recursively adds maximum die values to results in a nested structure.
 * 
 * This helper function is used by addMaxDieForEachKind to handle nested operands.
 * It adds the maximum possible value for each die to the original results.
 *
 * @param {Object} result - A result object that may contain nested structures.
 * @returns {Object} A new result object with added maximum die values.
 */
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