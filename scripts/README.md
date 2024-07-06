# Scripts

The Dice Vault symbiote uses the following JavaScript files to deliver all of its features.

## diceCrits.js

The `diceCrits.js` file is dedicated to handling critical hit logic within the Dice Vault symbiote. It defines the rules and behaviors for determining and applying critical hits during dice rolls, including the calculation of enhanced effects or bonuses when certain conditions are met. This file ensures that critical hits are consistently applied across all dice roll operations, enhancing the gameplay experience by adding an extra layer of excitement and unpredictability to the outcomes.

## globals.js

The `globals.js` file serves as the foundation for the Dice Vault symbiote by defining and managing global variables and constants that are essential across the application. This includes configurations, state variables, and utility functions that need to be accessed by multiple components or scripts within the Dice Vault.

## rolls.js

The `rolls.js` file is a core component of the Dice Vault symbiote, responsible for managing and executing dice roll operations. It defines the logic for initiating rolls, calculating results based on predefined rules, and handling different types of rolls such as standard, advantage, disadvantage, and custom roll types. Additionally, this file may include functions for interpreting roll results and integrating them with other features of the Dice Vault, ensuring a seamless dice rolling experience within the application.

## saveLoad.js

The `saveLoad.js` file is integral to the Dice Vault symbiote, focusing on the persistence of user data and application state. It encapsulates the functionality for saving user configurations, dice roll histories, and any other relevant state information to a persistent storage medium. Additionally, it handles the loading of this data upon application startup or as needed, ensuring that users can seamlessly continue from where they left off.

## settings.js

The `settings.js` file is dedicated to managing the configuration settings of the Dice Vault symbiote. It provides mechanisms for storing, retrieving, and updating user preferences and application settings. This includes options for dice roll behavior, visual themes, and other customizable features that enhance user interaction with the Dice Vault.

## vault.js

The `vault.js` file acts as the central repository and interface for the Dice Vault symbiote, managing the collection of dice, roll types, and user-defined roll configurations. It provides a structured way to access and manipulate the dice and roll settings, facilitating the creation, storage, and retrieval of custom dice combinations and roll logic. This file ensures that all dice-related operations are efficiently handled and easily accessible, supporting the dynamic needs of users for customizing their dice rolling experience.

# Design Patterns & Coding Conventions

This symbiote uses the following design patterns and coding conventions.

## Revealing Module Pattern

The Revealing Module Pattern for JavaScript is variant of the Module Pattern, in which we create a regular JavaScript module, but then we "reveal" public pointers to functions inside the module's scope. This creates a nice code management system in which you can clearly see which functions are meant to be used outside the module and which functions are only meant for the module's internal scope. This is one of the primary attractions of the Module and Revealing Module patterns, as they both make scoping a breeze without overcomplicating code and application design.

**References**

-   [Mastering the Module Pattern](https://ultimatecourses.com/blog/mastering-the-module-pattern)

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
