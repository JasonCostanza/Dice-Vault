/**
 * @jest-environment jsdom
 */

import userSettingsModel from "../scripts/userSettings.model.js";
import userSettingsComponent from "../scripts/userSettings.component.js";

test("Toggle user settings display when settings menu element not found. Does not display user settings.", () => {
    // Arrange
    document.body.innerHTML = `
        <div id="menu-bar">
            <i class="ts-icon-gear" id="settings-button"></i>
        </div>
        <div class="hidden"></div>
    `;
    let settingsButton = document.getElementById("settings-button");
    let sut = userSettingsComponent;

    // Act
    sut.handleToggleSettingsDisplayEvent();

    // Assert
    expect(settingsButton.classList.contains("active-menu")).toBe(false);
});

test("Handle auto load rolls changed event when toggled to true. Changes setting value to true.", () => {
    // Arrange
    document.body.innerHTML = `
        <input type="checkbox" id="auto-load" checked />
    `;
    let sut = userSettingsComponent;

    // Act
    sut.handleAutoLoadSettingChangedEvent();

    // Assert
    expect(userSettingsModel.getAutoLoadRolls()).toBe(true);
});

test("Handle auto load rolls changed event when toggled to false. Changes setting value to false.", () => {
    // Arrange
    document.body.innerHTML = `
        <input type="checkbox" id="auto-load" />
    `;
    let sut = userSettingsComponent;

    // Act
    sut.handleAutoLoadSettingChangedEvent();

    // Assert
    expect(userSettingsModel.getAutoLoadRolls()).toBe(false);
});
