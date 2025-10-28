/**
 * LanguageManager.js
 * Handles internationalization (i18n) for the Dice Vault application.
 * Contains translations for all supported languages and methods to apply them to the UI.
 */

/**
 * Translations object containing all UI text in supported languages
 */
const translations = {
    en: {
        // Main UI
        creatureName: "Enter creature name",
        addGroup: "+ Group",
        removeGroup: "- Group",
        roll: "Roll",
        advantage: "Advantage",
        disadvantage: "Disadvantage",
        bestOf3: "Best of 3",
        critical: "Critical",
        pin: "Pin",
        reset: "Reset",
        newCounter: "New Counter",
        pinnedRolls: "Pinned Rolls",
        creatureSort: "Creature sort:",
        groupsSort: "Groups sort:",
        
        // Sort options
        newest: "Newest",
        oldest: "Oldest",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Default",
        
        // Mobile menu
        menu: "Menu",
        saveData: "Save Data",
        loadData: "Load Data",
        settings: "Settings",
        menuQuote: "\"May the rolls be in your favor\"",
        
        // Settings modal
        language: "Language",
        autoLoad: "Automatically load data",
        autoSave: "Automatically save data",
        autoReset: "Auto-Reset Dice on Save",
        critBehavior: "Crit Behavior",
        copyToClipboard: "Copy to Clipboard",
        version: "Version",
        
        // Crit behavior options
        onePointFiveTotal: "1.5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Die Quantity",
        doubleDieResult: "2x the Die Results",
        maxDie: "Max Die Result",
        maxPlus: "Max + Raw Die Result",
        
        // Language names
        langEnglish: "English",
        langSpanish: "Spanish",
        langGerman: "German",
        langFrench: "French",
        langItalian: "Italian",
        langPortuguese: "Portuguese (Brazil)",
        langRussian: "Russian",
        langChinese: "Chinese (Simplified)",
        langJapanese: "Japanese"
    },
    es: {
        // Main UI
        creatureName: "Ingrese nombre de criatura",
        addGroup: "+ Grupo",
        removeGroup: "- Grupo",
        roll: "Tirar",
        advantage: "Ventaja",
        disadvantage: "Desventaja",
        bestOf3: "Mejor de 3",
        critical: "Crítico",
        pin: "Fijar",
        reset: "Reiniciar",
        newCounter: "Nuevo Contador",
        pinnedRolls: "Tiradas Fijadas",
        creatureSort: "Ordenar criaturas:",
        groupsSort: "Ordenar grupos:",
        
        // Sort options
        newest: "Más nuevo",
        oldest: "Más antiguo",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Predeterminado",
        
        // Mobile menu
        menu: "Menú",
        saveData: "Guardar Datos",
        loadData: "Cargar Datos",
        settings: "Configuración",
        menuQuote: "\"Que las tiradas estén a tu favor\"",
        
        // Settings modal
        language: "Idioma",
        autoLoad: "Cargar datos automáticamente",
        autoSave: "Guardar datos automáticamente",
        autoReset: "Auto-Reiniciar Dados al Guardar",
        critBehavior: "Comportamiento Crítico",
        copyToClipboard: "Copiar al Portapapeles",
        version: "Versión",
        
        // Crit behavior options
        onePointFiveTotal: "1.5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Cantidad de Dados",
        doubleDieResult: "2x Resultados de Dados",
        maxDie: "Resultado Máximo",
        maxPlus: "Máx + Resultado Crudo",
        
        // Language names
        langEnglish: "Inglés",
        langSpanish: "Español",
        langGerman: "Alemán",
        langFrench: "Francés",
        langItalian: "Italiano",
        langPortuguese: "Portugués (Brasil)",
        langRussian: "Ruso",
        langChinese: "Chino (Simplificado)",
        langJapanese: "Japonés"
    },
    de: {
        // Main UI
        creatureName: "Kreaturnamen eingeben",
        addGroup: "+ Gruppe",
        removeGroup: "- Gruppe",
        roll: "Würfeln",
        advantage: "Vorteil",
        disadvantage: "Nachteil",
        bestOf3: "Beste von 3",
        critical: "Kritisch",
        pin: "Anheften",
        reset: "Zurücksetzen",
        newCounter: "Neuer Zähler",
        pinnedRolls: "Angeheftete Würfe",
        creatureSort: "Kreatur sortieren:",
        groupsSort: "Gruppen sortieren:",
        
        // Sort options
        newest: "Neueste",
        oldest: "Älteste",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Standard",
        
        // Mobile menu
        menu: "Menü",
        saveData: "Daten speichern",
        loadData: "Daten laden",
        settings: "Einstellungen",
        menuQuote: "\"Mögen die Würfel zu deinen Gunsten fallen\"",
        
        // Settings modal
        language: "Sprache",
        autoLoad: "Daten automatisch laden",
        autoSave: "Daten automatisch speichern",
        autoReset: "Würfel beim Speichern automatisch zurücksetzen",
        critBehavior: "Kritisches Verhalten",
        copyToClipboard: "In Zwischenablage kopieren",
        version: "Version",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Gesamt",
        doubleTotal: "2x Gesamt",
        tripleTotal: "3x Gesamt",
        quadrupleTotal: "4x Gesamt",
        doubleDieCount: "2x Würfelanzahl",
        doubleDieResult: "2x Würfelergebnisse",
        maxDie: "Max Würfelergebnis",
        maxPlus: "Max + Rohes Würfelergebnis",
        
        // Language names
        langEnglish: "Englisch",
        langSpanish: "Spanisch",
        langGerman: "Deutsch",
        langFrench: "Französisch",
        langItalian: "Italienisch",
        langPortuguese: "Portugiesisch (Brasilien)",
        langRussian: "Russisch",
        langChinese: "Chinesisch (Vereinfacht)",
        langJapanese: "Japanisch"
    },
    fr: {
        // Main UI
        creatureName: "Entrez le nom de la créature",
        addGroup: "+ Groupe",
        removeGroup: "- Groupe",
        roll: "Lancer",
        advantage: "Avantage",
        disadvantage: "Désavantage",
        bestOf3: "Meilleur de 3",
        critical: "Critique",
        pin: "Épingler",
        reset: "Réinitialiser",
        newCounter: "Nouveau Compteur",
        pinnedRolls: "Lancers Épinglés",
        creatureSort: "Trier créatures:",
        groupsSort: "Trier groupes:",
        
        // Sort options
        newest: "Plus récent",
        oldest: "Plus ancien",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Par défaut",
        
        // Mobile menu
        menu: "Menu",
        saveData: "Sauvegarder Données",
        loadData: "Charger Données",
        settings: "Paramètres",
        menuQuote: "\"Que les lancers soient en votre faveur\"",
        
        // Settings modal
        language: "Langue",
        autoLoad: "Charger automatiquement les données",
        autoSave: "Sauvegarder automatiquement les données",
        autoReset: "Réinitialiser automatiquement les dés lors de la sauvegarde",
        critBehavior: "Comportement Critique",
        copyToClipboard: "Copier dans le Presse-papiers",
        version: "Version",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Quantité de Dés",
        doubleDieResult: "2x Résultats des Dés",
        maxDie: "Résultat Maximum",
        maxPlus: "Max + Résultat Brut",
        
        // Language names
        langEnglish: "Anglais",
        langSpanish: "Espagnol",
        langGerman: "Allemand",
        langFrench: "Français",
        langItalian: "Italien",
        langPortuguese: "Portugais (Brésil)",
        langRussian: "Russe",
        langChinese: "Chinois (Simplifié)",
        langJapanese: "Japonais"
    },
    it: {
        // Main UI
        creatureName: "Inserisci nome creatura",
        addGroup: "+ Gruppo",
        removeGroup: "- Gruppo",
        roll: "Tira",
        advantage: "Vantaggio",
        disadvantage: "Svantaggio",
        bestOf3: "Migliore di 3",
        critical: "Critico",
        pin: "Fissa",
        reset: "Reimposta",
        newCounter: "Nuovo Contatore",
        pinnedRolls: "Tiri Fissati",
        creatureSort: "Ordina creature:",
        groupsSort: "Ordina gruppi:",
        
        // Sort options
        newest: "Più recente",
        oldest: "Più vecchio",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Predefinito",
        
        // Mobile menu
        menu: "Menu",
        saveData: "Salva Dati",
        loadData: "Carica Dati",
        settings: "Impostazioni",
        menuQuote: "\"Che i tiri siano a tuo favore\"",
        
        // Settings modal
        language: "Lingua",
        autoLoad: "Carica automaticamente i dati",
        autoSave: "Salva automaticamente i dati",
        autoReset: "Auto-Reimposta Dadi al Salvataggio",
        critBehavior: "Comportamento Critico",
        copyToClipboard: "Copia negli Appunti",
        version: "Versione",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Totale",
        doubleTotal: "2x Totale",
        tripleTotal: "3x Totale",
        quadrupleTotal: "4x Totale",
        doubleDieCount: "2x Quantità Dadi",
        doubleDieResult: "2x Risultati Dadi",
        maxDie: "Risultato Massimo",
        maxPlus: "Max + Risultato Grezzo",
        
        // Language names
        langEnglish: "Inglese",
        langSpanish: "Spagnolo",
        langGerman: "Tedesco",
        langFrench: "Francese",
        langItalian: "Italiano",
        langPortuguese: "Portoghese (Brasile)",
        langRussian: "Russo",
        langChinese: "Cinese (Semplificato)",
        langJapanese: "Giapponese"
    },
    "pt-br": {
        // Main UI
        creatureName: "Digite o nome da criatura",
        addGroup: "+ Grupo",
        removeGroup: "- Grupo",
        roll: "Rolar",
        advantage: "Vantagem",
        disadvantage: "Desvantagem",
        bestOf3: "Melhor de 3",
        critical: "Crítico",
        pin: "Fixar",
        reset: "Resetar",
        newCounter: "Novo Contador",
        pinnedRolls: "Rolagens Fixadas",
        creatureSort: "Ordenar criaturas:",
        groupsSort: "Ordenar grupos:",
        
        // Sort options
        newest: "Mais recente",
        oldest: "Mais antigo",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Padrão",
        
        // Mobile menu
        menu: "Menu",
        saveData: "Salvar Dados",
        loadData: "Carregar Dados",
        settings: "Configurações",
        menuQuote: "\"Que as rolagens estejam a seu favor\"",
        
        // Settings modal
        language: "Idioma",
        autoLoad: "Carregar dados automaticamente",
        autoSave: "Salvar dados automaticamente",
        autoReset: "Auto-Resetar Dados ao Salvar",
        critBehavior: "Comportamento Crítico",
        copyToClipboard: "Copiar para Área de Transferência",
        version: "Versão",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Quantidade de Dados",
        doubleDieResult: "2x Resultados dos Dados",
        maxDie: "Resultado Máximo",
        maxPlus: "Máx + Resultado Bruto",
        
        // Language names
        langEnglish: "Inglês",
        langSpanish: "Espanhol",
        langGerman: "Alemão",
        langFrench: "Francês",
        langItalian: "Italiano",
        langPortuguese: "Português (Brasil)",
        langRussian: "Russo",
        langChinese: "Chinês (Simplificado)",
        langJapanese: "Japonês"
    },
    ru: {
        // Main UI
        creatureName: "Введите имя существа",
        addGroup: "+ Группа",
        removeGroup: "- Группа",
        roll: "Бросок",
        advantage: "Преимущество",
        disadvantage: "Помеха",
        bestOf3: "Лучший из 3",
        critical: "Критический",
        pin: "Закрепить",
        reset: "Сброс",
        newCounter: "Новый Счётчик",
        pinnedRolls: "Закреплённые Броски",
        creatureSort: "Сортировка существ:",
        groupsSort: "Сортировка групп:",
        
        // Sort options
        newest: "Новейшие",
        oldest: "Старейшие",
        nameAsc: "А-Я",
        nameDesc: "Я-А",
        default: "По умолчанию",
        
        // Mobile menu
        menu: "Меню",
        saveData: "Сохранить Данные",
        loadData: "Загрузить Данные",
        settings: "Настройки",
        menuQuote: "\"Пусть броски будут в вашу пользу\"",
        
        // Settings modal
        language: "Язык",
        autoLoad: "Автоматически загружать данные",
        autoSave: "Автоматически сохранять данные",
        autoReset: "Авто-сброс костей при сохранении",
        critBehavior: "Поведение Крита",
        copyToClipboard: "Копировать в Буфер Обмена",
        version: "Версия",
        
        // Crit behavior options
        onePointFiveTotal: "1.5x Итого",
        doubleTotal: "2x Итого",
        tripleTotal: "3x Итого",
        quadrupleTotal: "4x Итого",
        doubleDieCount: "2x Количество Костей",
        doubleDieResult: "2x Результаты Костей",
        maxDie: "Макс Результат",
        maxPlus: "Макс + Чистый Результат",
        
        // Language names
        langEnglish: "Английский",
        langSpanish: "Испанский",
        langGerman: "Немецкий",
        langFrench: "Французский",
        langItalian: "Итальянский",
        langPortuguese: "Португальский (Бразилия)",
        langRussian: "Русский",
        langChinese: "Китайский (Упрощённый)",
        langJapanese: "Японский"
    },
    "zh-cn": {
        // Main UI
        creatureName: "输入生物名称",
        addGroup: "+ 组",
        removeGroup: "- 组",
        roll: "投掷",
        advantage: "优势",
        disadvantage: "劣势",
        bestOf3: "三选一",
        critical: "重击",
        pin: "固定",
        reset: "重置",
        newCounter: "新计数器",
        pinnedRolls: "已固定投掷",
        creatureSort: "生物排序：",
        groupsSort: "组排序：",
        
        // Sort options
        newest: "最新",
        oldest: "最旧",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "默认",
        
        // Mobile menu
        menu: "菜单",
        saveData: "保存数据",
        loadData: "加载数据",
        settings: "设置",
        menuQuote: "\"愿投掷对你有利\"",
        
        // Settings modal
        language: "语言",
        autoLoad: "自动加载数据",
        autoSave: "自动保存数据",
        autoReset: "保存时自动重置骰子",
        critBehavior: "重击行为",
        copyToClipboard: "复制到剪贴板",
        version: "版本",
        
        // Crit behavior options
        onePointFiveTotal: "1.5倍总计",
        doubleTotal: "2倍总计",
        tripleTotal: "3倍总计",
        quadrupleTotal: "4倍总计",
        doubleDieCount: "2倍骰子数量",
        doubleDieResult: "2倍骰子结果",
        maxDie: "最大骰子结果",
        maxPlus: "最大值+原始结果",
        
        // Language names
        langEnglish: "英语",
        langSpanish: "西班牙语",
        langGerman: "德语",
        langFrench: "法语",
        langItalian: "意大利语",
        langPortuguese: "葡萄牙语（巴西）",
        langRussian: "俄语",
        langChinese: "中文（简体）",
        langJapanese: "日语"
    },
    ja: {
        // Main UI
        creatureName: "クリーチャー名を入力",
        addGroup: "+ グループ",
        removeGroup: "- グループ",
        roll: "ロール",
        advantage: "有利",
        disadvantage: "不利",
        bestOf3: "3個中最高",
        critical: "クリティカル",
        pin: "ピン留め",
        reset: "リセット",
        newCounter: "新規カウンター",
        pinnedRolls: "ピン留めロール",
        creatureSort: "クリーチャー並び替え：",
        groupsSort: "グループ並び替え：",
        
        // Sort options
        newest: "新しい順",
        oldest: "古い順",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "デフォルト",
        
        // Mobile menu
        menu: "メニュー",
        saveData: "データ保存",
        loadData: "データ読込",
        settings: "設定",
        menuQuote: "\"ロールがあなたに有利でありますように\"",
        
        // Settings modal
        language: "言語",
        autoLoad: "データを自動的に読み込む",
        autoSave: "データを自動的に保存する",
        autoReset: "保存時にダイスを自動リセット",
        critBehavior: "クリティカル動作",
        copyToClipboard: "クリップボードにコピー",
        version: "バージョン",
        
        // Crit behavior options
        onePointFiveTotal: "1.5倍合計",
        doubleTotal: "2倍合計",
        tripleTotal: "3倍合計",
        quadrupleTotal: "4倍合計",
        doubleDieCount: "2倍ダイス数",
        doubleDieResult: "2倍ダイス結果",
        maxDie: "最大ダイス結果",
        maxPlus: "最大値+生の結果",
        
        // Language names
        langEnglish: "英語",
        langSpanish: "スペイン語",
        langGerman: "ドイツ語",
        langFrench: "フランス語",
        langItalian: "イタリア語",
        langPortuguese: "ポルトガル語（ブラジル）",
        langRussian: "ロシア語",
        langChinese: "中国語（簡体字）",
        langJapanese: "日本語"
    }
};

/**
 * Current language code
 */
let currentLanguage = 'en';

/**
 * Changes the UI language based on the selected language in the dropdown.
 * Also saves the language preference to settings.
 */
function changeLanguage() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) {
        console.error('Language select element not found');
        return;
    }
    
    currentLanguage = languageSelect.value;
    applyTranslations(currentLanguage);
    saveLanguagePreference(currentLanguage);
}

/**
 * Applies translations to all UI elements based on the selected language.
 * 
 * @param {string} lang - The language code to apply (e.g., 'en', 'es', 'de')
 */
function applyTranslations(lang) {
    const t = translations[lang] || translations.en;
    
    // Main UI elements
    const creatureNameInput = document.getElementById('creature-name');
    if (creatureNameInput) {
        creatureNameInput.placeholder = t.creatureName;
    }
    
    // Buttons
    const addGroupBtn = document.getElementById('add-group-btn');
    if (addGroupBtn) addGroupBtn.textContent = t.addGroup;
    
    const removeGroupBtn = document.getElementById('remove-group-btn');
    if (removeGroupBtn) removeGroupBtn.textContent = t.removeGroup;
    
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.textContent = t.pin;
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.textContent = t.reset;
    
    const newCounterBtn = document.getElementById('new-counter');
    if (newCounterBtn) newCounterBtn.textContent = t.newCounter;
    
    // Rolling buttons - update only text nodes, preserve images
    updateButtonWithImage('.rolling-button', 0, t.roll);
    updateButtonWithImage('.rolling-button', 1, t.advantage);
    updateButtonWithImage('.rolling-button', 2, t.disadvantage);
    updateButtonWithImage('.rolling-button', 3, t.bestOf3);
    updateButtonWithImage('.rolling-button', 4, t.critical);
    
    // Saved rolls header
    const pinnedRollsLabel = document.querySelector('.saved-rolls-header .field-title');
    if (pinnedRollsLabel) pinnedRollsLabel.textContent = t.pinnedRolls;
    
    // Sort labels
    const sortLabels = document.querySelectorAll('.sort-label');
    if (sortLabels[0]) sortLabels[0].textContent = t.creatureSort;
    if (sortLabels[1]) sortLabels[1].textContent = t.groupsSort;
    
    // Sort options - creature sort
    const creatureSortOptions = document.querySelectorAll('#sort-options option');
    if (creatureSortOptions.length >= 4) {
        creatureSortOptions[0].textContent = t.newest;
        creatureSortOptions[1].textContent = t.oldest;
        creatureSortOptions[2].textContent = t.nameAsc;
        creatureSortOptions[3].textContent = t.nameDesc;
    }
    
    // Sort options - groups sort
    const groupsSortOptions = document.querySelectorAll('#sort-rolls-options option');
    if (groupsSortOptions.length >= 5) {
        groupsSortOptions[0].textContent = t.default;
        groupsSortOptions[1].textContent = t.newest;
        groupsSortOptions[2].textContent = t.oldest;
        groupsSortOptions[3].textContent = t.nameAsc;
        groupsSortOptions[4].textContent = t.nameDesc;
    }
    
    // Mobile menu
    const mobileMenuHeader = document.querySelector('#mobile-menu-modal .modal-header h2');
    if (mobileMenuHeader) mobileMenuHeader.textContent = t.menu;
    
    const saveRollsButton = document.getElementById('save-rolls-button');
    if (saveRollsButton) {
        updateButtonWithIcon(saveRollsButton, t.saveData);
    }
    
    const loadRollsButton = document.getElementById('load-rolls-button');
    if (loadRollsButton) {
        updateButtonWithIcon(loadRollsButton, t.loadData);
    }
    
    const settingsButton = document.querySelector('.mobile-menu-button[onclick*="toggleSettingsDisplay"]');
    if (settingsButton) {
        updateButtonWithIcon(settingsButton, t.settings);
    }
    
    const quoteText = document.querySelector('.quote-text');
    if (quoteText) quoteText.textContent = t.menuQuote;
    
    // Settings modal
    const settingsHeader = document.querySelector('#settings-modal .modal-header h2');
    if (settingsHeader) settingsHeader.textContent = t.settings;
    
    // Settings labels
    const settingsLabels = document.querySelectorAll('#settings-modal .field-title');
    if (settingsLabels.length >= 5) {
        settingsLabels[0].textContent = t.language;
        settingsLabels[1].textContent = t.autoLoad;
        settingsLabels[2].textContent = t.autoSave;
        settingsLabels[3].textContent = t.autoReset;
        settingsLabels[4].textContent = t.critBehavior;
    }
    
    // Language options
    const languageOptions = document.querySelectorAll('#language-select option');
    if (languageOptions.length >= 9) {
        languageOptions[0].textContent = t.langEnglish;
        languageOptions[1].textContent = t.langSpanish;
        languageOptions[2].textContent = t.langGerman;
        languageOptions[3].textContent = t.langFrench;
        languageOptions[4].textContent = t.langItalian;
        languageOptions[5].textContent = t.langPortuguese;
        languageOptions[6].textContent = t.langRussian;
        languageOptions[7].textContent = t.langChinese;
        languageOptions[8].textContent = t.langJapanese;
    }
    
    // Crit behavior options
    const critOptions = document.querySelectorAll('#crit-behavior option');
    if (critOptions.length >= 8) {
        critOptions[0].textContent = t.onePointFiveTotal;
        critOptions[1].textContent = t.doubleTotal;
        critOptions[2].textContent = t.tripleTotal;
        critOptions[3].textContent = t.quadrupleTotal;
        critOptions[4].textContent = t.doubleDieCount;
        critOptions[5].textContent = t.doubleDieResult;
        critOptions[6].textContent = t.maxDie;
        critOptions[7].textContent = t.maxPlus;
    }
    
    // Copy to clipboard button
    const copyButton = document.getElementById('copy-backup-button');
    if (copyButton) copyButton.textContent = t.copyToClipboard;
    
    // Version text
    const versionDiv = document.querySelector('.version');
    if (versionDiv) {
        const versionNumber = versionDiv.textContent.match(/[\d.]+/);
        if (versionNumber) {
            versionDiv.textContent = `${t.version}: ${versionNumber[0]}`;
        }
    }
}

/**
 * Helper function to update button text while preserving the image element.
 * 
 * @param {string} selector - CSS selector for the button
 * @param {number} index - Index of the button in the NodeList
 * @param {string} text - New text to set
 */
function updateButtonWithImage(selector, index, text) {
    const buttons = document.querySelectorAll(selector);
    if (buttons[index]) {
        const img = buttons[index].querySelector('img');
        const br = buttons[index].querySelector('br');
        if (img && br) {
            // Clear the button and re-add the elements
            buttons[index].textContent = '';
            buttons[index].appendChild(img);
            buttons[index].appendChild(br);
            buttons[index].appendChild(document.createTextNode(text));
        }
    }
}

/**
 * Helper function to update button text while preserving the icon element.
 * 
 * @param {HTMLElement} button - The button element
 * @param {string} text - New text to set
 */
function updateButtonWithIcon(button, text) {
    const icon = button.querySelector('i');
    if (icon) {
        button.textContent = '';
        button.appendChild(icon);
        button.appendChild(document.createTextNode(' ' + text));
    } else {
        button.textContent = text;
    }
}

/**
 * Saves the language preference to settings.
 * 
 * @param {string} lang - The language code to save
 */
function saveLanguagePreference(lang) {
    TS.localStorage.global.getBlob().then(settingsJson => {
        const settings = JSON.parse(settingsJson || '{}');
        settings.language = lang;
        return TS.localStorage.global.setBlob(JSON.stringify(settings));
    }).then(() => {
        console.log('Language preference saved:', lang);
    }).catch(error => {
        console.error('Failed to save language preference:', error);
    });
}

/**
 * Loads the language preference from settings and applies it.
 */
function loadLanguagePreference() {
    TS.localStorage.global.getBlob().then(settingsJson => {
        const settings = JSON.parse(settingsJson || '{}');
        const savedLanguage = settings.language || 'en';
        currentLanguage = savedLanguage;
        
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }
        
        applyTranslations(savedLanguage);
    }).catch(error => {
        console.error('Failed to load language preference:', error);
        // Default to English if loading fails
        applyTranslations('en');
    });
}

// Export to global scope
window.changeLanguage = changeLanguage;
window.loadLanguagePreference = loadLanguagePreference;
window.applyTranslations = applyTranslations;
