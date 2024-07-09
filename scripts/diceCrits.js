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

/**
 * Maximizes all dice results in the given result groups.
 * 
 * This function sets each die result to its maximum possible value based on the die type.
 * It handles nested structures and preserves modifiers.
 *
 * @param {Array<Object>} resultGroups - An array of result group objects.
 * @returns {Array<Object>} A new array of result groups with maximized dice results.
 */
function maximizeDiceResults(resultGroups) {
    function maximizeResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                return { ...operand, operands: maximizeResults(operand.operands) };
            } else if (operand.kind && operand.results && Array.isArray(operand.results)) {
                const maxResult = parseInt(operand.kind.substring(1), 10);
                return { ...operand, results: operand.results.map(() => maxResult) };
            } else {
                return operand;
            }
        });
    }

    return resultGroups.map(resultGroup => {
        if (resultGroup && resultGroup.result) {
            if (resultGroup.result.kind && Array.isArray(resultGroup.result.results)) {
                const maxResult = parseInt(resultGroup.result.kind.substring(1), 10);
                return {
                    ...resultGroup,
                    result: {
                        ...resultGroup.result,
                        results: resultGroup.result.results.map(() => maxResult)
                    }
                };
            } else if (resultGroup.result.operands) {
                return {
                    ...resultGroup,
                    result: {
                        ...resultGroup.result,
                        operands: maximizeResults(resultGroup.result.operands)
                    }
                };
            }
        }
        return resultGroup;
    });
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
function addMaxDieForEachKind(resultGroups) {
    function addMaxResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                return { ...operand, operands: addMaxResults(operand.operands) };
            } else if (operand.kind && operand.results && Array.isArray(operand.results)) {
                const maxResult = parseInt(operand.kind.substring(1), 10);
                const maxResultsToAdd = new Array(operand.results.length).fill(maxResult);
                return { ...operand, results: [...operand.results, ...maxResultsToAdd] };
            } else {
                return operand;
            }
        });
    }

    return resultGroups.map(resultGroup => {
        if (resultGroup && resultGroup.result) {
            if (resultGroup.result.kind && Array.isArray(resultGroup.result.results)) {
                const maxResult = parseInt(resultGroup.result.kind.substring(1), 10);
                const maxResultsToAdd = new Array(resultGroup.result.results.length).fill(maxResult);
                return {
                    ...resultGroup,
                    result: {
                        ...resultGroup.result,
                        results: [...resultGroup.result.results, ...maxResultsToAdd]
                    }
                };
            } else if (resultGroup.result.operands) {
                return {
                    ...resultGroup,
                    result: {
                        ...resultGroup.result,
                        operands: addMaxResults(resultGroup.result.operands)
                    }
                };
            }
        }
        return resultGroup;
    });
}