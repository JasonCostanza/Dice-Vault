//const userSettingsModel = require("./userSettings.model.js");
import userSettingsModel from "./userSettings.model.js";

const userSettingsComponent = (function (document, userSettingsModel) {
    function handleToggleSettingsDisplayEvent() {
        console.log("Toggling settings display.");
    }

    function handleAutoLoadSettingChangedEvent() {
        console.log("Auto-load setting changed.");
        userSettingsModel.setAutoLoadRolls(
            document.getElementById("auto-load").checked
        );
        userSettingsModel.save();
        //saveLoadModule.updateAutoButtons();
    }

    // PUBLIC API //
    return {
        handleToggleSettingsDisplayEvent: handleToggleSettingsDisplayEvent,
        handleAutoLoadSettingChangedEvent: handleAutoLoadSettingChangedEvent,
    };
})(document, userSettingsModel);

export default userSettingsComponent;
