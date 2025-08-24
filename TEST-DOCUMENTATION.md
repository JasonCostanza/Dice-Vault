# Dice Vault Test Dataset Documentation

This comprehensive JSON dataset is designed to exercise all UI features and edge cases of the Dice Vault saved rolls system. Import this data to test your releases thoroughly.

## Dataset Structure

The dataset follows the standard Dice Vault save format with two main sections:
- `rollsData`: Array of creature groups with their saved rolls
- `counters`: Array of counter objects for testing counter functionality

## Test Coverage Overview

### 1. **Creature Accordion Groups** (13 groups total)
Tests the collapsible accordion functionality for organizing rolls by creature/character name.

### 2. **Roll Entries** (35+ individual rolls)
Each creature has multiple saved rolls to test the roll management UI.

### 3. **Dice Group Combinations**
Tests every dice type (d4, d6, d8, d10, d12, d20, d100) and modifiers in various combinations.

### 4. **Counter System** (15 counters)
Tests all counter functionality including creation, editing, increment/decrement operations.

---

## Detailed Test Cases

### **Ancient Red Dragon**
Tests basic monster stat blocks and single-group rolls:
- **Claw Attack**: d20 + 2d6 + 17 (attack roll with damage)
- **Bite Attack**: d20 + 4d6 + 17 (larger damage dice)
- **Fire Breath**: 26d6 (large damage roll, no attack)
- **Initiative**: d20 only (simple roll)

**UI Features Tested**:
- Single dice group rolls
- Various dice counts (1-26)
- Positive modifiers
- Zero modifier handling

### **Paladin**
Tests multi-group rolls and complex character abilities:
- **Longsword Attack**: 2 groups (Attack: d20+d8+8, Divine Smite: 4d8)
- **Lay on Hands**: Only modifier (50) - tests modifier-only rolls
- **Saving Throws**: 2 groups (Generic: d20+5, Wisdom: d20+8)

**UI Features Tested**:
- Multi-group roll display
- Roll buttons for different roll types (normal, advantage, disadvantage, best-of-three, critical)
- Modifier-only groups
- Group naming functionality

### **Wizard**
Tests spell-focused character with various damage types:
- **Fireball**: 8d6 (classic spell damage)
- **Magic Missile**: 3d4+3 (auto-hit spell)
- **Lightning Bolt**: 8d6 (alternate damage spell)
- **Counterspell Check**: d20+12 (ability check)

**UI Features Tested**:
- Spell damage calculations
- Different dice types for different spells
- High modifier values

### **Rogue**
Tests skill-heavy character with multi-group abilities:
- **Sneak Attack**: d20+10d6+5 (attack with sneak attack damage)
- **Skills**: 2 groups (Lockpicking: d20+12, Stealth: d20+11)

**UI Features Tested**:
- High dice counts (10d6)
- Skill check combinations
- Multi-group skill rolls

### **Barbarian**
Tests characters using d12 dice and critical hit mechanics:
- **Rage Greataxe**: d20+d12+10 (weapon attack)
- **Brutal Critical**: 3d12+10 (critical hit damage)

**UI Features Tested**:
- d12 dice type
- Critical hit mechanics
- Rage damage bonuses

### **Bard**
Tests social character abilities and inspiration mechanics:
- **Vicious Mockery**: 4d4 (cantrip damage)
- **Bardic Inspiration**: d10 (inspiration die)
- **Social Skills**: 3 groups (Performance: d20+8, Persuasion: d20+9, Deception: d20+9)

**UI Features Tested**:
- d4 and d10 dice types
- Three-group roll combinations
- Social interaction mechanics

### **Cleric**
Tests healing and support abilities:
- **Cure Wounds**: 3d8+4 (healing spell)
- **Turn Undead**: d20+7 (channel divinity)
- **Spiritual Weapon**: 2 groups (Attack: d20+d8+7, Damage: d8+4)

**UI Features Tested**:
- Healing calculations
- Channel divinity mechanics
- Bonus action spell combinations

### **Warlock**
Tests unique warlock mechanics:
- **Eldritch Blast**: 3d20+3d10+15 (multiple beams)
- **Hex Damage**: d6 (additional damage)

**UI Features Tested**:
- Multiple dice of same type in single group
- Cantrip scaling
- Hex mechanics

### **Sorcerer**
Tests metamagic and wild magic features:
- **Twinned Spell**: 16d6 (doubled fireball)
- **Wild Magic Surge**: d100 (percentile roll)
- **Chaos Bolt**: 2 groups (Attack: d20+2d8+8, Damage: 2d8)

**UI Features Tested**:
- Very high dice counts (16d6)
- d100 percentile dice
- Metamagic mechanics

### **Goblin Horde**
Tests multiple creature mechanics:
- **Scimitar Attacks**: 5d20+5d6+20 (group attacks)
- **Shortbow Volley**: 5d20+5d6+20 (ranged group attacks)

**UI Features Tested**:
- Multiple identical attacks
- Group combat mechanics
- High modifier values from multiple creatures

### **NPC Merchant**
Tests NPC interactions and random elements:
- **Insight**: d20+3 (social check)
- **Random Inventory**: 1 of each die type (d4+d6+d8+d10+d12+d20+d100)

**UI Features Tested**:
- NPC mechanics
- All dice types in single roll
- Random generation mechanics

### **Test Edge Cases**
Comprehensive edge case testing:
- **Zero Dice with Modifier**: Only +15 modifier (tests modifier-only display)
- **Negative Modifier**: d20-5 (tests negative modifier display)
- **Maximum Dice**: 99 of each die type +999 (tests large number handling)
- **Single d100**: d100 only (tests percentile dice)
- **Seven Groups**: Groups A-G with single die each (tests maximum group display)

**UI Features Tested**:
- Edge cases and boundary conditions
- Negative modifiers
- Very large numbers
- Maximum group counts
- Error handling

### **Special Characters & Unicode Test**
Tests internationalization and special character handling:
- **Émile's Spéll**: 2d8 (accented characters)
- **Björn's Âttäck**: d20+5 (Nordic characters)
- **漢字 Test**: d20 (Chinese characters)
- **🎲 Emoji Roll 🎯**: d6 (emoji support)

**UI Features Tested**:
- Unicode character support
- International character sets
- Emoji rendering
- Text encoding

---

## Counter System Tests (15 counters)

### **Gameplay Counters**
- **Persistent Fire Damage**: 8 (ongoing damage tracking)
- **Spell Duration**: 12 rounds (duration tracking)
- **Hit Points Lost**: 45 (damage tracking)
- **Initiative Tracker**: 18 (turn order)
- **Legendary Actions**: 3 (monster actions)
- **Lair Action Round**: 20 (environmental effects)

### **Resource Counters**
- **Bardic Inspiration Uses**: 3 (class resources)
- **Sorcery Points**: 7 (class resources)
- **Ki Points**: 15 (class resources)
- **Rage Uses**: 2 (class resources)

### **Edge Case Counters**
- **Zero Counter Test**: 0 (zero value handling)
- **Negative Counter Test**: -5 (negative value handling)
- **Large Number Test**: 999 (large number display)
- **Death Saving Throws**: 1 (critical game mechanics)
- **Special Chars Test**: 42 with "Ñiño's Spëll" (Unicode in counter names)

**Counter Features Tested**:
- Counter creation and display
- Increment/decrement buttons
- Manual value input
- Edit counter purpose
- Delete counter functionality
- Counter sorting and organization
- Unicode support in counter names
- Zero, negative, and large number handling

---

## Roll Type Testing

Each saved roll can be executed with different roll types:

1. **Normal Roll** - Standard single roll
2. **Advantage** - Roll twice, take higher
3. **Disadvantage** - Roll twice, take lower  
4. **Best of Three** - Roll three times, take highest
5. **Critical** - Add extra dice for critical hits

The dataset provides diverse roll combinations to test all roll types with different dice configurations.

---

## Sorting and Organization Testing

### **Creature Sorting Options**
- Alphabetical (A-Z and Z-A)
- Newest first
- Oldest first

### **Roll Sorting Options**
- Group name alphabetical
- Dice count
- Creation timestamp

### **How Time-Based Sorting Works with Test Data**

**Important Note**: The test dataset JSON file does **not** contain pre-defined timestamps. Instead, timestamps are dynamically generated when the data is loaded into the application.

**Timestamp Generation Process**:
1. When loading the test dataset, each roll receives a timestamp using `Date.now()`
2. Rolls are processed **sequentially** in the order they appear in the JSON file
3. This creates a predictable timestamp sequence based on the JSON structure order

**Creature Loading Order** (determines relative timestamps):
1. "Ancient Red Dragon" (earliest timestamps)
2. "Paladin"
3. "Wizard" 
4. "Rogue"
5. "Barbarian"
6. "Bard"
7. "Cleric"
8. "Warlock"
9. "Sorcerer"
10. "Goblin Horde"
11. "NPC Merchant"
12. "Test Edge Cases"
13. "Special Characters & Unicode Test" (latest timestamps)

**Sorting Behavior**:
- **"Newest first"**: Sorts by the newest roll timestamp within each creature group
- **"Oldest first"**: Sorts by the oldest roll timestamp within each creature group
- **"Default"**: Maintains creation order (same as "Oldest first" for test data)

**Testing Implications**:
- The sorting appears to work correctly because creatures loaded later get higher timestamps
- Each reload of the dataset will generate new timestamps but maintain the same relative order
- This provides consistent and predictable sorting behavior for testing purposes

The dataset includes creatures and rolls with varied names and this timestamp generation system to test all sorting functionality.

---

## UI Interaction Testing

### **Accordion Functionality**
- Expand/collapse creature groups
- Multiple groups expanded simultaneously
- Empty group handling

### **Edit/Delete Operations**
- Edit roll button functionality
- Delete roll confirmation
- Edit roll name and dice counts
- Move rolls between creatures

### **Import/Export Testing**
- Save rolls to local storage
- Load rolls from local storage
- Data persistence
- Error handling for corrupted data

---

## Expected Results

After importing this dataset, you should see:

1. **13 creature accordion groups** in the saved rolls section
2. **35+ individual rolls** distributed across creatures
3. **1 counter section** with 15 different counters
4. **All dice types** represented (d4, d6, d8, d10, d12, d20, d100)
5. **Various modifier combinations** (positive, negative, zero, large)
6. **Multi-group rolls** demonstrating complex dice combinations
7. **Unicode and special characters** properly displayed
8. **Different roll types** available for each saved roll

---

## Testing Procedure

1. **Backup existing data** (if any) before importing
2. **Import the test dataset** using the load functionality
3. **Verify all creatures appear** in accordion format
4. **Test expand/collapse** for each creature group
5. **Execute different roll types** for various saved rolls
6. **Test counter functionality** (increment, decrement, edit, delete)
7. **Test sorting options** for both creatures and rolls within groups
8. **Test edit/delete operations** on rolls and counters
9. **Verify Unicode characters** display correctly
10. **Test edge cases** (zero dice, negative modifiers, large numbers)

This comprehensive dataset ensures thorough testing of all Dice Vault features and edge cases for reliable release validation.
