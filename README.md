<p align="center">
  <img src="images/DiceVault.png" alt="Dice Vault Logo" width="300">
</p>

# Dice-Vault

Talespire symbiote which offers an expanded dice rolling experience without the complexity of a full character sheet.

Check it out on [Mod.io](https://mod.io/g/talespire/m/dice-vault).

  ## Features
  - Name your rolls and have them recorded in chat.
  - Throw as many dice as you need, including adding or subtracting negative modifiers modifiers.
  - Roll using advantage, disadvantage, best-of-3, or 5 different commonly used critical hit methods.
  - Save a roll preset to quickly roll it again in the future.
  - Save your dice vault collection to local storage so you never lose your carefully crafted dice vault or share it with your friends and fellow players.
  - Saved presets are specific to the campaign. Have a preset collection for each campaign you're participating in!
  - 5 different rolling styles with 5 different common critical hit methods. These modes include a standard roll, advantage, disadvantage, best-of-3, and critical hit (configured via the settings menu).

# Changelog
```
2.2
- Edit buttons on saved rolls allows for modifying a saved roll without deleting it
2.1
- 3 critical hit modes: 1.5x total, 3x total, and 4x total
2.0
- New feature: Roll groups! Create multiple groups of dice which do not add together. Useful for situations where dice needs to be rolled together but not all combined. "I cast Magic Missile at 3rd level dealing, three 1d4's of damage." In this situation we report three independent results with 1 throw, instead of 3d4 we do not add them together so it's three seperate results of 1d4. Useful for all kinds of situations like crossbows where the bolt deals damage and then the magical properties of an explosive bolt for example.
- New UI to saved rolls. Instead of displaying images for dice, we know parse it down to simple and familiar roll strings, "1d4+1d6+5", or "1d20+14". You will notice saved roll cards are now much smaller allowing you to see more at one time. We will expand on this UI in future releases to further improve the UI.
- Breaking change: the data structure we used to use in 1.3 is out. This means your old saved data will not work in 2.0. **however**, we have you covered as we built an updater function to try and upgrade your data to 2.0 format. Please report any issues with updating your data via the github issues tab.
1.3
- Added Critical Hit support with 5 different styles
- Updated the UI to flow better with iconography
1.2
- Improved sort list
- Modifier is now a text input field
- Cleaned up CSS to not allow drag-selection of random things
- Added an options menu
1.1
- Added ability to roll "Best of Three" (@PanoramicPanda)
1.0
- Public Release!
```

# Install Instructions
  ## Subscribe
  1. Enable Symbiotes in Talespire settings.
  2. Open the Library bottom bar.
  3. Select `(Beta) Community Mods` tab along the top of the `Library` bar.
  4. Select `Symbiotes` on the left side of the `Library` bar.
  
  ## Manually Install
  1. Download all included files.
  2. Launch and enable Symbiotes in Talespire settings.
  3. Extract the files to your symbiote directory: `C:\Users\%USERNAME%\AppData\LocalLow\BouncyRock Entertainment\TaleSpire\Symbiotes\Dice Vault`.
  4. Open the Symbiote side-panel in Talespire.
  5. Enable Dice Vault by clicking on it in the `Available` section.
  6. Select `Dice Vault` in the `Active` section.

# How to Use
1. Type the name of the roll you want to throw, example "Dagger Strike".
2. Left click to increment and right click to decrement the dice.
3. Enter a modifier into the text box if you need one, example, "5" or "-5".
4. Roll right away by selecting the style of roll you need, standard, advantage, etc. or create a preset with the `Save` button.
5. To reset the staged roll, use the `reset` button.

To delete a preset, use the trash bin icon.

# Before Upgrading 1.3 > 2.0+
1. Navigate to your Symbiote directory and open the folder for Dice Vault
2. navigate to the ./localstorage folder
3. Copy the .json file and place it somewhere you will remember, like your desktop for example
4. Install Dice Vault 2.0
5. Paste the .json file into the same directory that you copied it from, though the ID of the symbiote has likely changed
6. Once you open the Symbiote, the first time you load your data it will automatically upgrade the data to the new data format

# Report Issues
Create an issue in the github reposity on the [Issues Tab](https://github.com/JasonCostanza/Dice-Vault/issues).

Any information you can provide to reproducing your issue is appreciated including reproduction steps, screenshots or video, and anything else you think is important.

# Roadmap
See our github issues tab for bugs and enhancements on the roadmap.

# Special Thanks
[DeeForce](https://github.com/D33Force)
[PanoramicPanda](https://github.com/PanoramicPanda)
[kbarnett](https://github.com/kbarnett)


# Contribor Environment Configuration
If you wish to contribute to the project you are more than welcome to create a feature branch, add your contributions, and open a PR against `main`. To get your local environment set up, it's a pretty easy process:
  1. Clone the repository directly to the game's local directory: `C:\Users\%username%\AppData\LocalLow\BouncyRock Entertainment\TaleSpire\Symbiotes`. Note the username needs to be your username. I develop on Windows so I do not have access to the Mac directory which coincides with this. I recommend doing this to avoid having to copy/paste every time you want to test your changes.
  2. Using your IDE of choice, open the folder. For me, that is `...\TaleSpire\Symbiotes\Dice Vault Dev`.
  3. Launch Talespire and enable Symbiotes in the game settings.
  4. Open the Symbiote sidebar and open the Symbiote. To make this easier, you can rename the symbiote in the `manifest.json` to something like "Symbiote DEV" or something to make it stand out from production version(s) of the same symbiote. Example, "Dice Vault" is the production version and "Dice Vault DEV" will be the one in active development. **DO NOT** include this name change in your PRs.
  5. Make the changes you wish to the code files and make sure you save all changes and to all files.
  6. In Talespire, the Symbiote will automatically do a domain reload and display your updated changes. There is no need to build, deploy, or otherwise. If you do not see the Symbiote update, verify you have the right one opened in the side panel if there are multiple versions with identical names in your Symbiote list, ensure all files did actually save, and verify that there's not extra folder levels after `...\Symbiotes`, example `...\Symbiotes\DEV\Dice Vault` as that may interfere with the game registering the Symbiote's codebase.
  7. To live debug the code and your changes, you can use Talespire's web developer portal which you open in your web browser of choice at the following: `localhost:8080`.
  8. After navigating to this address, ensure the Symbiote is active and visible in the Symbiote panel. If it appears blank or doesn't load, the symbiote must be actively loaded to access this panel. Try opening your Symbiote in the game and then refresh this portal.
  9. Select the Symbiote from the list, in this case, "Dice Vault" or whatever custom name you gave it in the manifest.json in step 4. This allows you to debug the source code, HTML elements, and debug console log among other tools. Any error returned by Unity or `console.log` for example will be recorded here. You can also set breakpoints and add values to watches if you wish.
