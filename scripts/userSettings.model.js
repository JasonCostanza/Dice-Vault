const userSettingsModel = (function (document) {
    let autoLoadRolls = false;
    let autoSaveRolls = false;
    let autoResetEdit = false;
    let critBehavior = "double-total";

    const getAutoLoadRolls = () => {
        return autoLoadRolls;
    };

    const setAutoLoadRolls = (value) => {
        autoLoadRolls = value;
    };

    const save = () => {
        console.log("Saving user settings.");
    };

    // PUBLIC API //
    return {
        getAutoLoadRolls: getAutoLoadRolls,
        setAutoLoadRolls: setAutoLoadRolls,
        save: save,
    };
})(document);

module.exports = userSettingsModel;
