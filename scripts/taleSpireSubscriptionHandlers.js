/**
 * Handles roll result events from TaleSpire.
 * 
 * This function serves as a bridge between TaleSpire's roll events and our custom roll handling system.
 * It delegates the processing of roll events to the rollsModule, which applies any necessary
 * modifications (such as critical hit behaviors) and manages the display of results.
 * 
 * This function should be subscribed to TaleSpire's roll result events.
 *
 * @param {Object} rollEvent - An object representing a roll event from TaleSpire,
 *                             containing details about the dice roll and its results.
 * @returns {Promise<void>} A promise that resolves when the roll event has been fully processed.
 */
async function handleRollResult(rollEvent) {
    await rollsModule.handleRollResult(rollEvent);
}

/**
 * Handles state change events from TaleSpire.
 * 
 * This function responds to various state change events in TaleSpire. Currently, it's
 * set up to handle the "hasInitialized" event, which occurs when TaleSpire has finished
 * its initialization process.
 * 
 * When the "hasInitialized" event is received, this function triggers the loading of
 * global settings for our plugin.
 * 
 * This function should be subscribed to TaleSpire's state change events.
 *
 * @param {Object} msg - An object representing a state change message from TaleSpire.
 *                       It includes a 'kind' property indicating the type of state change.
 * @returns {Promise<void>} A promise that resolves when the state change has been handled.
 */
async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        loadGlobalSettings();
    }
}