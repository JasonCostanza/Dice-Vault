function multiplyDieCounts(diceCounts, multiplier) {
    let newDiceCounts = {};
    for (const [die, count] of Object.entries(diceCounts)) {
        if (die !== 'mod') {
            newDiceCounts[die] = String(parseInt(count, 10) * multiplier);
        } else {
            newDiceCounts[die] = count;
        }
    }
    return newDiceCounts;
}

function multiplyDiceResults(resultGroup, multiplier) {
    // Handle scenario without nested operands
    if (resultGroup.result.kind && Array.isArray(resultGroup.result.results)) {
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                results: resultGroup.result.results.map(result => result * multiplier)
            }
        };
    }

    function multiplyResults(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                return { ...operand, operands: multiplyResults(operand.operands, multiplier) };
            } else if (operand.results && Array.isArray(operand.results)) {
                return { ...operand, results: operand.results.map(result => result * multiplier) };
            } else {
                return operand;
            }
        });
    }

    // Assuming the nested structure if direct handling wasn't applicable
    if (resultGroup.result.operands) {
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                operands: multiplyResults(resultGroup.result.operands, multiplier)
            }
        };
    }

    return resultGroup;
}


function multiplyModifier(resultGroup, multiplier) {
    // Directly handle scenario without nested operands (no direct handling needed for modifiers)
    function multiplyMod(operands) {
        return operands.map(operand => {
            if (operand.operator && operand.operands) {
                return { ...operand, operands: multiplpyMod(operand.operands) };
            } else if (operand.value) {
                let newValue = Math.abs(operand.value) * multiplier;
                return { ...operand, value: newValue };
            } else {
                return operand;
            }
        });
    }

    if (resultGroup.result.operands) {
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                operands: multiplyMod(resultGroup.result.operands)
            }
        };
    }

    return resultGroup;
}

function maximizeDiceResults(resultGroup) {
    if (resultGroup.result.kind && Array.isArray(resultGroup.result.results)) {
        const maxResult = parseInt(resultGroup.result.kind.substring(1), 10);
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                results: resultGroup.result.results.map(() => maxResult)
            }
        };
    }

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

    if (resultGroup.result.operands) {
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                operands: maximizeResults(resultGroup.result.operands)
            }
        };
    }

    return resultGroup;
}

function addMaxDieForEachKind(resultGroup) {
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
    }

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

    if (resultGroup.result.operands) {
        return {
            ...resultGroup,
            result: {
                ...resultGroup.result,
                operands: addMaxResults(resultGroup.result.operands)
            }
        };
    }

    return resultGroup;
}