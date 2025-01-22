/**
 * @jest-environment jsdom
 */

const userSettingsModule = require("../scripts/userSettings.js");

test("Toggle user settings display when settings menu element not found. Does not display user settings.", () => {
    // Arrange
    document.body.innerHTML = `
        <div id="menu-bar">
            <i class="ts-icon-gear" id="settings-button"></i>
        </div>
        <div class="hidden"></div>
    `;
    let settingsButton = document.getElementById("settings-button");
    let sut = userSettingsModule;

    // Act
    sut.handleToggleSettingsDisplayEvent();

    // Assert
    expect(settingsButton.classList.contains("active-menu")).toBe(false);
});
