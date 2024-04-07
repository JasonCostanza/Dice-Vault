function doubleDieCounts(diceCounts) {
    let newDiceCounts = {};
    for (const [die, count] of Object.entries(diceCounts)) {
        if (die !== 'mod') {
            newDiceCounts[die] = String(parseInt(count, 10) * 2);
        } else {
            newDiceCounts[die] = count;
        }
    }
    return newDiceCounts;
}

function doubleDiceResults(resultGroup) {
    function doubleResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                // Recursively double results for nested operands
                return {...operand, operands: doubleResults(operand.operands)};
            } else if (operand.results && Array.isArray(operand.results)) {
                // Double the results of the dice
                return {...operand, results: operand.results.map(result => result * 2)};
            } else {
                // Return the operand unchanged if it's not a dice result
                return operand;
            }
        });
    }

    // Create a new resultGroup with doubled dice results
    return {
        ...resultGroup,
        result: {
            ...resultGroup.result,
            operands: doubleResults(resultGroup.result.operands)
        }
    };
}

function doubleModifier(resultGroup) {
    function doubleMod(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                // Recursively search for modifiers to double
                return {...operand, operands: doubleMod(operand.operands)};
            } else if (operand.value) {
                // Double the modifier value, ensuring it stays positive if initially negative
                return {...operand, value: Math.abs(operand.value) * 2};
            } else {
                // Return the operand unchanged if it's not a modifier
                return operand;
            }
        });
    }

    // Create a new resultGroup with doubled modifier
    return {
        ...resultGroup,
        result: {
            ...resultGroup.result,
            operands: doubleMod(resultGroup.result.operands)
        }
    };
}

function maximizeDiceResults(resultGroup) {
    function maximizeResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                // Recursively process for nested operands
                return {...operand, operands: maximizeResults(operand.operands)};
            } else if (operand.kind && operand.results && Array.isArray(operand.results)) {
                // Extract the maximum die value from the kind (e.g., "d8" => 8)
                const maxResult = parseInt(operand.kind.substring(1), 10);
                // Set all results to the maximum value for the die kind
                return {...operand, results: operand.results.map(() => maxResult)};
            } else {
                // Return the operand unchanged if it's not a die result
                return operand;
            }
        });
    }

    // Apply the maximizing logic to the operands
    return {
        ...resultGroup,
        result: {
            ...resultGroup.result,
            operands: maximizeResults(resultGroup.result.operands)
        }
    };
}

function addMaxDieForEachKind(resultGroup) {
    function addMaxResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                // Recursively process for nested operands
                return { ...operand, operands: addMaxResults(operand.operands) };
            } else if (operand.kind && operand.results && Array.isArray(operand.results)) {
                // Extract the maximum die value from the kind (e.g., "d8" => 8)
                const maxResult = parseInt(operand.kind.substring(1), 10);
                // Calculate the number of dice rolled of this kind
                const diceCount = operand.results.length;
                // Create an array with the max result repeated diceCount times
                const maxResultsToAdd = new Array(diceCount).fill(maxResult);
                // Add the array of maximum value for the die kind to the results array
                return { ...operand, results: [...operand.results, ...maxResultsToAdd] };
            } else {
                // Return the operand unchanged if it's not a die result
                return operand;
            }
        });
    }

    // Apply the logic to add maximum die results according to the count of each kind
    return {
        ...resultGroup,
        result: {
            ...resultGroup.result,
            operands: addMaxResults(resultGroup.result.operands)
        }
    };
}