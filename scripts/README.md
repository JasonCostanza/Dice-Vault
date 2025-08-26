# Scripts

The Dice Vault symbiote uses the following JavaScript files to deliver all of its features. The architecture follows a clean class-based design with separate managers for different functionality areas.

## Core Architecture

### main.js

The `main.js` file serves as the application entry point and coordination layer for the Dice Vault symbiote. It initializes all class instances (DiceGroupManager, RollSorter, SavedRollManager, UIManager, CounterManager), handles dependency injection, and sets up essential event listeners. This file orchestrates the startup sequence and provides the bridge between HTML event handlers and the class-based architecture. The file has been designed as a clean, focused coordination layer that manages application initialization.

### globals.js

The `globals.js` file serves as the foundation for the Dice Vault symbiote by defining and managing global variables and constants that are essential across the application. This includes configurations, state variables, utility functions, and dice type definitions that need to be accessed by multiple components or scripts within the Dice Vault.

## Manager Classes

### DiceGroupManager.js

The `DiceGroupManager` class handles all dice group related functionality including creating, updating, and removing dice groups. It manages the dice groups data structure, validates dice group configurations, and provides utilities for checking if dice groups are empty or valid. This class is central to the dice configuration system within the application.

### RollManager.js

The `RollManager` module (using the Revealing Module Pattern) is responsible for managing and executing dice roll operations. It defines the logic for initiating rolls, calculating results based on predefined rules, and handling different types of rolls such as normal, advantage, disadvantage, best-of-three, and critical rolls. It integrates with TaleSpire's dice rolling API and handles the complex logic of dice roll execution.

### SavedRollManager.js

The `SavedRollManager` class handles all saved roll CRUD operations including saving, loading, editing, deleting, and managing saved rolls. It works closely with the DiceGroupManager and RollSorter to provide comprehensive saved roll functionality. This class manages the persistence and organization of user-created roll configurations.

### UIManager.js

The `UIManager` class handles UI components, modals, overlays, and interface interactions including accordion toggles, modal management, and UI state changes. It provides a centralized way to manage all user interface interactions and maintains separation between UI logic and business logic.

### SettingsManager.js

The `SettingsManager` module provides functionality for managing the configuration settings of the Dice Vault symbiote. It handles storing, retrieving, and updating user preferences and application settings. This includes options for dice roll behavior, auto-save/auto-load functionality, and other customizable features that enhance user interaction with the Dice Vault.

### RollSorter.js

The `RollSorter` class handles all sorting functionality for saved rolls including sorting creature groups, roll entries, and dice groups within rolls. It provides various sorting options and maintains the organization of saved roll data according to user preferences.

### CounterManager.js

The `CounterManager` class manages counter functionality within the application. It handles creating, updating, and removing counters that can be used for tracking various game states like persistent damage, spell slots, or other numerical game elements.

### CriticalManager.js

The `CriticalManager` module contains functions for handling critical hit logic within the Dice Vault symbiote. It defines the rules and behaviors for determining and applying critical hits during dice rolls, including calculations for enhanced effects like 1.5x damage multipliers. This ensures that critical hits are consistently applied across all dice roll operations.

## Utility and Integration Files

### saveLoad.js

The `saveLoad.js` file focuses on low-level persistence operations for user data and application state. It works in conjunction with SaveLoadManager.js to provide save/load functionality and handles auto-save/auto-load operations based on user settings.

### SaveLoadManager.js

The `SaveLoadManager` module provides higher-level save and load operations, complementing the saveLoad.js file. It handles auto-loading/saving functionality and manages the user interface aspects of save/load operations.

### taleSpireSubscriptionHandlers.js

The `taleSpireSubscriptionHandlers.js` file contains event handlers for TaleSpire-specific events. It manages the integration between the Dice Vault symbiote and TaleSpire, handling roll results and state change events from the TaleSpire application. This file bridges the gap between TaleSpire's API and the Dice Vault's internal systems.

# Design Patterns & Architecture

This symbiote uses the following design patterns and coding conventions to maintain clean, maintainable code.

## Class-Based Architecture

The Dice Vault uses modern ES6 class-based architecture for most of its components. Each manager class is responsible for a specific area of functionality:

- **Manager Classes**: Handle specific domains (DiceGroupManager, SavedRollManager, UIManager, etc.)
- **Dependency Injection**: Classes receive their dependencies through constructor parameters
- **Single Responsibility**: Each class has a focused, well-defined purpose
- **Encapsulation**: Internal state and methods are properly encapsulated within classes

## Revealing Module Pattern

The Revealing Module Pattern is used for certain modules, particularly the RollManager. In this pattern, we create a regular JavaScript module with private functions and variables, then "reveal" public pointers to specific functions. This creates clear separation between public API and internal implementation details.

**Example Structure:**
```javascript
const rollManager = (function () {
    // Private functions and variables
    function privateFunction() { /* ... */ }
    
    // Public API
    function publicFunction() { /* ... */ }
    
    // Reveal public interface
    return {
        roll: publicFunction
    };
})();
```

## Functional Programming for Utilities

Utility functions, particularly in SettingsManager and CriticalManager, use functional programming principles with pure functions that have predictable inputs and outputs.

**References**

-   [Mastering the Module Pattern](https://ultimatecourses.com/blog/mastering-the-module-pattern)
-   [MDN Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

# TaleSpire API Notes

## Example of rollDescriptor Array

[rollDescriptor](https://symbiote-docs.talespire.com/api_doc_v0_1.md.html#types/rolldescriptor)

```json
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
