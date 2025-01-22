const userSettingsModule = (function (document) {
    function handleToggleSettingsDisplayEvent() {
        console.log("Toggling settings display.");
    }

    // PUBLIC API //
    return {
        handleToggleSettingsDisplayEvent: handleToggleSettingsDisplayEvent,
    };
})(document);

module.exports = userSettingsModule;
