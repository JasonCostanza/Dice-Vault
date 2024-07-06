async function handleRollResult(rollEvent) {
    await rollsModule.handleRollResult(rollEvent);
}

async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        loadGlobalSettings();
    }
}
