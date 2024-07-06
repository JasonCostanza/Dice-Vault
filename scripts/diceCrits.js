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

function doubleDiceResults(resultGroups) {
    console.log('Entering doubleDiceResults with:', JSON.stringify(resultGroups, null, 2));
    
    if (!Array.isArray(resultGroups)) {
        console.warn('doubleDiceResults received non-array input, converting to array');
        resultGroups = [resultGroups];
    }

    return resultGroups.map(group => {
        if (group && group.result) {
            console.log('Processing group:', JSON.stringify(group, null, 2));
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

function doubleResultsRecursive(result) {
    console.log('Processing result in doubleResultsRecursive:', JSON.stringify(result, null, 2));
    
    if (result.kind && Array.isArray(result.results)) {
        console.log('Doubling dice results for:', result.kind);
        return {
            ...result,
            results: result.results.map(r => r * 2)
        };
    } else if (result.operator && Array.isArray(result.operands)) {
        console.log('Processing nested operands');
        return {
            ...result,
            operands: result.operands.map(doubleResultsRecursive)
        };
    } else {
        console.log('Encountered non-dice operand, returning unchanged:', result);
        return result;
    }
}

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