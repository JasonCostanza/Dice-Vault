<p align="center">
  <img src="images/DiceVault.png" alt="Dice Vault Logo" width="300">
</p>

# Dice-Vault

Talespire symbiote which offers an expanded dice rolling experience that is system-agnostic without requiring a full character sheet.

Check it out on [Mod.io](https://mod.io/g/talespire/m/dice-vault).

  ## Features
  - Give your rolls a name and record the results in chat.
  - Throw as many dice as you need and add or subtract any modifiers.
  - Roll using advantage, disadvantage, best-of-3, or various other commonly used critical hit methods.
  - Pin a frequently used roll to quickly reuse it.
  - Create counters to track persistent effects like damage over time, spell durations, or any numerical values you need to monitor.
  - Save your dice vault collection to local storage so you never lose your carefully crafted dice vault.
  - Campaign-specific vaults. Have a preset collection for each campaign you're participating in!

# A Note about Updating and Locally Saved Rolls
With major version releases, it is potential that data structures will change and this will render old data unusable. The amount of effort it is to write updater code is a lot of work and maintenance. I strongly recommend you copy your rolls down before updating so you can recreate them in the new version(s).

# Changelog
```
# 5.5
- New Feature: Localization support now includes English, Spanish, German, French, Italian, and Portuguese (Brazil).
# 5.4
- Improvement: Refactored settings menu to a modal interface with keyboard support (Escape key to close). See the new hamburger menu button at the bottom.
- Improvement: Moved the Save and Load buttons to the new hamburger menu modal.
- Bug fix: Removed unused load and save icon images to clean up codebase.
# 5.3
- Improvement: Changed "Retrieve Local Backup" button to a button which copies the data to your clipboard.
# 5.2
- New Feature: Added D100's to the dice lineup for systems like Mothership or any other D100 situations.
# 5.1
- New Feature: Simple counters - create a simple counter to store a value and a purpose like, "Persist Fire Damage" or "Sickened".
- Bug fix: Better handling for attempting to roll or pin a group with a modifier and no dice.
- Bug fix: In certain scenarios, loading data could use duplicate entries to be created in the pinned rolls list
- Improvement: Redid all the JSDoc comments on the source code to improve understanding and maintainability.
# # 5.0
- Refactored code to be more maintainable. No user facing changes.
# # 4.0
- Pinned rolls are now organized by creature name. Each creature can now be collaspsed and expanded to make your pinned roll list more organized.
- Pinned rolls can now be sorted more granularly with sort functions for creatures and groups independely.
- Added a "Default" sorting option for groups so you can put the roll groups back to the order in which you added them instead of the other sort options.
- Improved the overall color scheme to better match Talespire's design guide as well as communicate editable fields more clearly.
# 3.1
- Fixed a bug where adding too many roll groups would break the UI
# 3.0
- New feature: Named roll groups! Previously we expanded functionality to let you roll independent roll groups. Unfortunately, all the groups shared the same name according to Talespire. This has been resolved and all roll groups can have their own unique name. If no name is provided, it defaults to "Group 1", "Group 2", etc. This caused another change in the data structure so rolls from old versions will not roll forward from prior versions of Dice Vault.
- Edit buttons on saved rolls allows for modifying a saved roll without deleting it!
- Buttons have been renamed to clarify their purpose. Pin a roll only stores the roll for that play session. Save Data stores your pinned rolls into ./localstorage. These terms will be the new nomenclature going forward. "Pin" is temporary, "Save" is permanent.
# 2.1
- 3 critical hit modes: 1.5x total, 3x total, and 4x total
# 2.0
- New feature: Roll groups! Create multiple groups of dice which do not add together. Useful for situations where dice needs to be rolled together but not all combined. "I cast Magic Missile at 3rd level dealing, three 1d4's of damage." In this situation we report three independent results with 1 throw, instead of 3d4 we do not add them together so it's three seperate results of 1d4. Useful for all kinds of situations like crossbows where the bolt deals damage and then the magical properties of an explosive bolt for example.
- New UI to saved rolls. Instead of displaying images for dice, we know parse it down to simple and familiar roll strings, "1d4+1d6+5", or "1d20+14". You will notice saved roll cards are now much smaller allowing you to see more at one time. We will expand on this UI in future releases to further improve the UI.
- Breaking change: the data structure we used to use in 1.3 is out. This means your old saved data will not work in 2.0.
# 1.3
- Added Critical Hit support with 5 different styles
- Updated the UI to flow better with iconography
# 1.2
- Improved sort list
- Modifier is now a text input field
- Cleaned up CSS to not allow drag-selection of random things
- Added an options menu
# 1.1
- Added ability to roll "Best of Three" (@PanoramicPanda)
# 1.0
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
## Dice Rolling
1. If you want, enter a name for the creature
2. If you want, enter a name for the roll group
3. If you want, add additional roll groups. Example, a flaming longsword deals one group of slashing damage and another group of fire damage.
4. Left click to increment and right click to decrement the dice that you wish.
5. Enter a modifier into the text box if you need one, example, "5" or "-5".
6. Roll right away by selecting the style of roll you need, standard, advantage, disadvantage, etc., or pin it for later.

## Counters
1. Click the "New Counter" button to create a new counter.
2. Enter a purpose for the counter (e.g., "persistent fire damage", "spell duration", "hit points").
3. Use the + and - buttons to increment or decrement the counter value.
4. Click directly on the number input to manually enter a value.
5. Use the edit button to change the counter's purpose.
6. Use the delete button to remove the counter.
7. All counters are automatically saved and will persist between sessions.

# Report Issues
Create an issue in the github page on the [Issues Tab](https://github.com/JasonCostanza/Dice-Vault/issues).

Any information you can provide to reproducing your issue is appreciated including reproduction steps, screenshots or video, and anything else you think is important.

# Roadmap
See the github issues tab for bugs and enhancements on the roadmap. This project is purely a hobby project and I cannot guarantee timelines of anything depending on my life priorities and free time.

With the recent announcement of the official Dice Engine feature undergoing development, future development of Dice Vault may be slowed or postponed. This symbiote was born in the gap of what Dice Engine (the official feature) will potentially solve. At this time, we don't have full clarity on what the official feature will do. Stay tuned! If Dice Vault continues to have a place, then I plan on continuing to support and develop the tool. Feel free to submit feature requests in the meantime.

# Special Thanks
[DeeForce](https://github.com/D33Force)
[PanoramicPanda](https://github.com/PanoramicPanda)
[kbarnett](https://github.com/kbarnett)

# Want to contribute code?
I am more than happy to let anyone contribute code changes. Reach out to me on Discord (Json_Blob) so we can discuss the design and requirements of what you're seeking and we will see if it's a good fit for Dice Vault.
