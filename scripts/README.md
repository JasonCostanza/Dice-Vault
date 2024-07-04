# Scripts

The Dice Vault symbiote uses the following JavaScript files to deliver all of its features.

## diceCrits.js

< write description >

## globals.js

< write description >

## rolls.js

< write description >

## saveLoad.js

< write description >

## settings.js

< write description >

## vault.js

< write description >

# TaleSpire API Notes

## Example of rollDescriptor Array

[rollDescriptor](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rolldescriptor)

```
[
    {
        "name": "test-4-groups",
        "roll": "+1d4+1d6"
    },
    {
        "name": "test-4-groups",
        "roll": "+1d4+1d6+50"
    },
    {
        "name": "test-4-groups",
        "roll": "+1d6+1d8+100"
    },
    {
        "name": "test-4-groups",
        "roll": "+1d8+1d10+200"
    }
]
```

## Example RollEvent Object

[onRollResults](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#subscriptions/dice/onrollresults)

[rollResults](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollresults)

[rollRemoved](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rollremoved)

```
{
    "kind": "rollResults",
    "payload": {
        "rollId": "17179869185",
        "clientId": "e0a85890-68af-4cc2-b55b-e11d12b89889",
        "resultsGroups": [
            {
                "name": "test-4-groups",
                "result": {
                    "operator": "+",
                    "operands": [
                        {
                            "kind": "d4",
                            "results": [
                                3
                            ]
                        },
                        {
                            "kind": "d6",
                            "results": [
                                4
                            ]
                        }
                    ]
                }
            },
            {
                "name": "test-4-groups",
                "result": {
                    "operator": "+",
                    "operands": [
                        {
                            "kind": "d4",
                            "results": [
                                1
                            ]
                        },
                        {
                            "operator": "+",
                            "operands": [
                                {
                                    "kind": "d6",
                                    "results": [
                                        4
                                    ]
                                },
                                {
                                    "value": 50
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "name": "test-4-groups",
                "result": {
                    "operator": "+",
                    "operands": [
                        {
                            "kind": "d6",
                            "results": [
                                1
                            ]
                        },
                        {
                            "operator": "+",
                            "operands": [
                                {
                                    "kind": "d8",
                                    "results": [
                                        1
                                    ]
                                },
                                {
                                    "value": 100
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "name": "test-4-groups",
                "result": {
                    "operator": "+",
                    "operands": [
                        {
                            "kind": "d8",
                            "results": [
                                4
                            ]
                        },
                        {
                            "operator": "+",
                            "operands": [
                                {
                                    "kind": "d10",
                                    "results": [
                                        5
                                    ]
                                },
                                {
                                    "value": 200
                                }
                            ]
                        }
                    ]
                }
            }
        ],
        "gmOnly": false,
        "quiet": true
    }
}
```
