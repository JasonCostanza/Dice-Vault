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
        // Would we put this here or in the component?
        // TS.localStorage.global.setBlob(JSON.stringify(settings)).then(() => {
        //     console.log('Settings saved successfully.');
        // }).catch(error => {
        //     console.error('Failed to save settings:', error);
        // });
    };

    // PUBLIC API //
    return {
        getAutoLoadRolls: getAutoLoadRolls,
        setAutoLoadRolls: setAutoLoadRolls,
        save: save,
    };
})(document);

export default userSettingsModel;
