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
        groupName: "Enter Group Name",
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
        
        // Counter-related
        counterPurposePrompt: "Enter counter purpose:",
        counterPurposePlaceholder: "e.g., persistent fire damage",
        newCounterTitle: "New Counter",
        editCounterPrompt: "Enter new counter purpose:",
        editCounterTitle: "Edit Counter",
        countersHeader: "Counters",
        resetAllCountersConfirm: "Are you sure you want to reset all counters to 0?",
        resetAllCountersTitle: "Reset All Counters",
        deleteAllCountersConfirm: "Are you sure you want to delete all counters? This action cannot be undone.",
        deleteAllCountersTitle: "Delete All Counters",
        overwriteRollMessage: "A saved creature named \"{creatureName}\" with the same roll group names already exists.",
        overwriteRollQuestion: "Do you want to replace it with your new configuration?",
        
        // Language names
        langEnglish: "English",
        langSpanish: "Espanol",
        langGerman: "Deutsch",
        langFrench: "Francais",
        langItalian: "Italiano",
        langPortuguese: "Portugues (Brasil)"
    },
    es: {
        // Main UI
        creatureName: "Ingrese nombre de criatura",
        groupName: "Ingrese Nombre del Grupo",
        addGroup: "+ Grupo",
        removeGroup: "- Grupo",
        roll: "Tirar",
        advantage: "Ventaja",
        disadvantage: "Desventaja",
        bestOf3: "Mejor de 3",
        critical: "Critico", // TODO: Replace with "Crítico" when special characters are supported
        pin: "Fijar",
        reset: "Reiniciar",
        newCounter: "Nuevo Contador",
        pinnedRolls: "Fijados",
        creatureSort: "Ordenar criaturas:",
        groupsSort: "Ordenar grupos:",
        
        // Sort options
        newest: "Mas nuevo", // TODO: Replace with "Más nuevo" when special characters are supported
        oldest: "Mas antiguo", // TODO: Replace with "Más antiguo" when special characters are supported
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Por defecto",
        
        // Mobile menu
        menu: "Menu", // TODO: Replace with "Menú" when special characters are supported
        saveData: "Guardar Datos",
        loadData: "Cargar Datos",
        settings: "Configuracion", // TODO: Replace with "Configuración" when special characters are supported
        menuQuote: "\"Que las tiradas esten a tu favor\"", // TODO: Replace with "estén" when special characters are supported
        
        // Settings modal
        language: "Idioma",
        autoLoad: "Cargar datos automaticamente", // TODO: Replace with "automáticamente" when special characters are supported
        autoSave: "Guardar datos automaticamente", // TODO: Replace with "automáticamente" when special characters are supported
        autoReset: "Auto-Reiniciar Dados al Guardar",
        critBehavior: "Comportamiento Critico", // TODO: Replace with "Crítico" when special characters are supported
        copyToClipboard: "Copiar al Portapapeles",
        version: "Version", // TODO: Replace with "Versión" when special characters are supported
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Cantidad de Dados",
        doubleDieResult: "2x Resultados de Dados",
        maxDie: "Resultado Maximo", // TODO: Replace with "Máximo" when special characters are supported
        maxPlus: "Max + Resultado Crudo", // TODO: Replace with "Máx" when special characters are supported
        
        // Counter-related
        counterPurposePrompt: "Ingrese el proposito del contador:", // TODO: Replace with "propósito" when special characters are supported
        counterPurposePlaceholder: "ej., dano de fuego persistente", // TODO: Replace with "daño" when special characters are supported
        newCounterTitle: "Nuevo Contador",
        editCounterPrompt: "Ingrese el nuevo proposito del contador:", // TODO: Replace with "propósito" when special characters are supported
        editCounterTitle: "Editar Contador",
        countersHeader: "Contadores",
        resetAllCountersConfirm: "Esta seguro de que desea restablecer todos los contadores a 0?", // TODO: Replace with "¿Está" when special characters are supported
        resetAllCountersTitle: "Restablecer Todos los Contadores",
        deleteAllCountersConfirm: "Esta seguro de que desea eliminar todos los contadores? Esta accion no se puede deshacer.", // TODO: Replace with "¿Está" and "acción" when special characters are supported
        deleteAllCountersTitle: "Eliminar Todos los Contadores",
        overwriteRollMessage: "Ya existe una criatura guardada llamada \"{creatureName}\" con los mismos nombres de grupos de tiradas.",
        overwriteRollQuestion: "Quiere reemplazarla con su nueva configuracion?", // TODO: Replace with "¿Quiere" and "configuración" when special characters are supported
        
        // Language names
        langEnglish: "Ingles", // TODO: Replace with "Inglés" when special characters are supported
        langSpanish: "Espanol", // TODO: Replace with "Español" when special characters are supported
        langGerman: "Aleman", // TODO: Replace with "Alemán" when special characters are supported
        langFrench: "Frances", // TODO: Replace with "Francés" when special characters are supported
        langItalian: "Italiano",
        langPortuguese: "Portugues (Brasil)" // TODO: Replace with "Portugues" when special characters are supported
    },
    de: {
        // Main UI
        creatureName: "Kreaturnamen eingeben",
        groupName: "Gruppennamen eingeben",
        addGroup: "+ Gruppe",
        removeGroup: "- Gruppe",
        roll: "Wurfeln", // TODO: Replace with "Würfeln" when special characters are supported
        advantage: "Vorteil",
        disadvantage: "Nachteil",
        bestOf3: "Beste von 3",
        critical: "Kritisch",
        pin: "Anheften",
        reset: "Zurucksetzen", // TODO: Replace with "Zurücksetzen" when special characters are supported
        newCounter: "Neuer Zahler", // TODO: Replace with "Zähler" when special characters are supported
        pinnedRolls: "Fixierte",
        creatureSort: "Kreatur sortieren:",
        groupsSort: "Gruppen sortieren:",
        
        // Sort options
        newest: "Neueste",
        oldest: "Alteste", // TODO: Replace with "Älteste" when special characters are supported
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Standard",
        
        // Mobile menu
        menu: "Menu", // TODO: Replace with "Menü" when special characters are supported
        saveData: "Daten speichern",
        loadData: "Daten laden",
        settings: "Einstellungen",
        menuQuote: "\"Mogen die Wurfel zu deinen Gunsten fallen\"", // TODO: Replace with "Mögen" and "Würfel" when special characters are supported
        
        // Settings modal
        language: "Sprache",
        autoLoad: "Daten automatisch laden",
        autoSave: "Daten automatisch speichern",
        autoReset: "Wurfel beim Speichern automatisch zurucksetzen", // TODO: Replace with "Würfel" and "zurücksetzen" when special characters are supported
        critBehavior: "Kritisches Verhalten",
        copyToClipboard: "In Zwischenablage kopieren",
        version: "Version",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Gesamt",
        doubleTotal: "2x Gesamt",
        tripleTotal: "3x Gesamt",
        quadrupleTotal: "4x Gesamt",
        doubleDieCount: "2x Wurfelanzahl", // TODO: Replace with "Würfelanzahl" when special characters are supported
        doubleDieResult: "2x Wurfelergebnisse", // TODO: Replace with "Würfelergebnisse" when special characters are supported
        maxDie: "Max Wurfelergebnis", // TODO: Replace with "Würfelergebnis" when special characters are supported
        maxPlus: "Max + Rohes Wurfelergebnis", // TODO: Replace with "Würfelergebnis" when special characters are supported
        
        // Counter-related
        counterPurposePrompt: "Zweck des Zahlers eingeben:", // TODO: Replace with "Zählers" when special characters are supported
        counterPurposePlaceholder: "z.B., anhaltender Feuerschaden",
        newCounterTitle: "Neuer Zahler", // TODO: Replace with "Zähler" when special characters are supported
        editCounterPrompt: "Neuen Zweck des Zahlers eingeben:", // TODO: Replace with "Zählers" when special characters are supported
        editCounterTitle: "Zahler bearbeiten", // TODO: Replace with "Zähler" when special characters are supported
        countersHeader: "Zahler", // TODO: Replace with "Zähler" when special characters are supported
        resetAllCountersConfirm: "Mochten Sie wirklich alle Zahler auf 0 zurucksetzen?", // TODO: Replace with "Möchten", "Zähler", "zurücksetzen" when special characters are supported
        resetAllCountersTitle: "Alle Zahler zurucksetzen", // TODO: Replace with "Zähler", "zurücksetzen" when special characters are supported
        deleteAllCountersConfirm: "Mochten Sie wirklich alle Zahler loschen? Diese Aktion kann nicht ruckgangig gemacht werden.", // TODO: Replace with "Möchten", "Zähler", "löschen", "rückgängig" when special characters are supported
        deleteAllCountersTitle: "Alle Zahler loschen", // TODO: Replace with "Zähler", "löschen" when special characters are supported
        overwriteRollMessage: "Eine gespeicherte Kreatur namens \"{creatureName}\" mit denselben Wurfgruppennamen existiert bereits.",
        overwriteRollQuestion: "Mochten Sie sie durch Ihre neue Konfiguration ersetzen?", // TODO: Replace with "Möchten" when special characters are supported
        
        // Language names
        langEnglish: "Englisch",
        langSpanish: "Spanisch",
        langGerman: "Deutsch",
        langFrench: "Franzosisch", // TODO: Replace with "Französisch" when special characters are supported
        langItalian: "Italienisch",
        langPortuguese: "Portugiesisch (Brasilien)"
    },
    fr: {
        // Main UI
        creatureName: "Entrez le nom de la creature", // TODO: Replace with "créature" when special characters are supported
        groupName: "Entrez le nom du groupe",
        addGroup: "+ Groupe",
        removeGroup: "- Groupe",
        roll: "Lancer",
        advantage: "Avantage",
        disadvantage: "Desavantage", // TODO: Replace with "Désavantage" when special characters are supported
        bestOf3: "Meilleur des 3",
        critical: "Critique",
        pin: "Epingler", // TODO: Replace with "Épingler" when special characters are supported
        reset: "Reinitialiser", // TODO: Replace with "Réinitialiser" when special characters are supported
        newCounter: "Nouveau Compteur",
        pinnedRolls: "Epingles", // TODO: Replace with "Épinglés" when special characters are supported
        creatureSort: "Tri par creature:", // TODO: Replace with "créature" when special characters are supported
        groupsSort: "Tri par groupe:",
        
        // Sort options
        newest: "Plus recent", // TODO: Replace with "récent" when special characters are supported
        oldest: "Plus ancien",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Defaut", // TODO: Replace with "Défaut" when special characters are supported
        
        // Mobile menu
        menu: "Menu",
        saveData: "Sauvegarder Donnees", // TODO: Replace with "Données" when special characters are supported
        loadData: "Charger Donnees", // TODO: Replace with "Données" when special characters are supported
        settings: "Parametres", // TODO: Replace with "Paramètres" when special characters are supported
        menuQuote: "\"Que les lancers soient en votre faveur\"",
        
        // Settings modal
        language: "Langue",
        autoLoad: "Charger automatiquement les donnees", // TODO: Replace with "données" when special characters are supported
        autoSave: "Sauvegarder automatiquement les donnees", // TODO: Replace with "données" when special characters are supported
        autoReset: "Reinitialiser automatiquement les des lors de la sauvegarde", // TODO: Replace with "Réinitialiser" and "dés" when special characters are supported
        critBehavior: "Comportement Critique",
        copyToClipboard: "Copier dans le Presse-papiers",
        version: "Version",
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Quantite de Des", // TODO: Replace with "Quantité" and "Dés" when special characters are supported
        doubleDieResult: "2x Resultats des Des", // TODO: Replace with "Résultats" and "Dés" when special characters are supported
        maxDie: "Resultat Maximum", // TODO: Replace with "Résultat" when special characters are supported
        maxPlus: "Max + Resultat Brut", // TODO: Replace with "Résultat" when special characters are supported
        
        // Counter-related
        counterPurposePrompt: "Entrez l'objectif du compteur:",
        counterPurposePlaceholder: "ex., degats de feu persistants", // TODO: Replace with "dégâts" when special characters are supported
        newCounterTitle: "Nouveau Compteur",
        editCounterPrompt: "Saisir le but du compteur:",
        editCounterTitle: "Modifier Compteur",
        countersHeader: "Compteurs",
        resetAllCountersConfirm: "Etes-vous sur de vouloir reinitialiser tous les compteurs a 0?", // TODO: Replace with "etes", "sûr", "réinitialiser", "à" when special characters are supported
        resetAllCountersTitle: "Reinitialiser Tous les Compteurs", // TODO: Replace with "Réinitialiser" when special characters are supported
        deleteAllCountersConfirm: "Etes-vous sur de vouloir supprimer tous les compteurs? Cette action ne peut pas etre annulee.", // TODO: Replace with "etes", "sûr", "etre", "annulée" when special characters are supported
        deleteAllCountersTitle: "Supprimer Tous les Compteurs",
        overwriteRollMessage: "Une creature sauvegardee nommee \"{creatureName}\" avec les memes noms de groupes de jets existe deja.", // TODO: Replace with "créature", "sauvegardée", "nommée", "mêmes", "déjà" when special characters are supported
        overwriteRollQuestion: "Voulez-vous la remplacer par votre nouvelle configuration?",
        
        // Language names
        langEnglish: "Anglais",
        langSpanish: "Espagnol",
        langGerman: "Allemand",
        langFrench: "Francais",
        langItalian: "Italien",
        langPortuguese: "Portugais (Bresil)" // TODO: Replace with "Brésil" when special characters are supported
    },
    it: {
        // Main UI
        creatureName: "Inserisci nome creatura",
        groupName: "Inserisci Nome del Gruppo",
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
        pinnedRolls: "Fissati",
        creatureSort: "Ordina creature:",
        groupsSort: "Ordina gruppi:",
        
        // Sort options
        newest: "Più recente",
        oldest: "Più vecchio",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Predefinito",
        
        // Mobile menu
        menu: "Menu", // TODO: Replace with "Menù" when special characters are supported
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
        
        // Counter-related
        counterPurposePrompt: "Inserisci lo scopo del contatore:",
        counterPurposePlaceholder: "es., danno da fuoco persistente",
        newCounterTitle: "Nuovo Contatore",
        editCounterPrompt: "Inserisci il nuovo scopo del contatore:",
        editCounterTitle: "Modifica Contatore",
        countersHeader: "Contatori",
        resetAllCountersConfirm: "Sei sicuro di voler reimpostare tutti i contatori a 0?",
        resetAllCountersTitle: "Reimposta Tutti i Contatori",
        deleteAllCountersConfirm: "Sei sicuro di voler eliminare tutti i contatori? Questa azione non può essere annullata.",
        deleteAllCountersTitle: "Elimina Tutti i Contatori",
        overwriteRollMessage: "Una creatura salvata denominata \"{creatureName}\" con gli stessi nomi di gruppi di tiri esiste gia.", // TODO: Replace with "creatura", "denominata", "già" when special characters are supported
        overwriteRollQuestion: "Vuoi sostituirla con la tua nuova configurazione?",
        
        // Language names
        langEnglish: "Inglese",
        langSpanish: "Spagnolo",
        langGerman: "Tedesco",
        langFrench: "Francese",
        langItalian: "Italiano",
        langPortuguese: "Portoghese (Brasile)"
    },
    "pt-br": {
        // Main UI
        creatureName: "Digite o nome da criatura",
        groupName: "Digite o Nome do Grupo",
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
        pinnedRolls: "Fixados",
        creatureSort: "Ordenar criaturas:",
        groupsSort: "Ordenar grupos:",
        
        // Sort options
        newest: "Recente",
        oldest: "Antigo",
        nameAsc: "A-Z",
        nameDesc: "Z-A",
        default: "Padrão",
        
        // Mobile menu
        menu: "Menu",
        saveData: "Salvar Dados",
        loadData: "Carregar Dados",
        settings: "Configuracoes", // TODO: Replace with "Configuracões" when special characters are supported
        menuQuote: "\"Que as rolagens estejam a seu favor\"",
        
        // Settings modal
        language: "Idioma",
        autoLoad: "Carregar dados automaticamente",
        autoSave: "Salvar dados automaticamente",
        autoReset: "Auto-Resetar Dados ao Salvar",
        critBehavior: "Comportamento Critico", // TODO: Replace with "Crítico" when special characters are supported
        copyToClipboard: "Copiar para Area de Transferencia", // TODO: Replace with "Área" and "Transferencia" when special characters are supported
        version: "Versao", // TODO: Replace with "Versão" when special characters are supported
        
        // Crit behavior options
        onePointFiveTotal: "1,5x Total",
        doubleTotal: "2x Total",
        tripleTotal: "3x Total",
        quadrupleTotal: "4x Total",
        doubleDieCount: "2x Quantidade de Dados",
        doubleDieResult: "2x Resultados dos Dados",
        maxDie: "Resultado Maximo", // TODO: Replace with "Máximo" when special characters are supported
        maxPlus: "Max + Resultado Bruto", // TODO: Replace with "Máx" when special characters are supported
        
        // Counter-related
        counterPurposePrompt: "Digite o objetivo do contador:",
        counterPurposePlaceholder: "ex., dano de fogo persistente",
        newCounterTitle: "Novo Contador",
        editCounterPrompt: "Digite o novo objetivo do contador:",
        editCounterTitle: "Editar Contador",
        countersHeader: "Contadores",
        resetAllCountersConfirm: "Tem certeza de que deseja redefinir todos os contadores para 0?",
        resetAllCountersTitle: "Redefinir Todos os Contadores",
        deleteAllCountersConfirm: "Tem certeza de que deseja excluir todos os contadores? Esta acao nao pode ser desfeita.", // TODO: Replace with "acão" and "não" when special characters are supported
        deleteAllCountersTitle: "Excluir Todos os Contadores",
        overwriteRollMessage: "Uma criatura salva chamada \"{creatureName}\" com os mesmos nomes de grupos de rolagens ja existe.", // TODO: Replace with "já" when special characters are supported
        overwriteRollQuestion: "Deseja substitui-la pela sua nova configuracao?", // TODO: Replace with "configuração" when special characters are supported
        
        // Language names
        langEnglish: "Ingles", // TODO: Replace with "Ingles" when special characters are supported
        langSpanish: "Espanhol",
        langGerman: "Alemao", // TODO: Replace with "Alemão" when special characters are supported
        langFrench: "Frances", // TODO: Replace with "Frances" when special characters are supported
        langItalian: "Italiano",
        langPortuguese: "Portugues (Brasil)" // TODO: Replace with "Portugues" when special characters are supported
    }
};

/**
 * Current language code
 */
let currentLanguage = 'en';

/**
 * Gets a translation for a specific key in the current language.
 * Falls back to English if the key is not found.
 * 
 * @param {string} key - The translation key to look up
 * @returns {string} The translated text
 */
function getTranslation(key) {
    const t = translations[currentLanguage] || translations.en;
    return t[key] || translations.en[key] || key;
}

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
    
    // Dice group name inputs
    const groupNameInputs = document.querySelectorAll('.dice-group-name-input');
    groupNameInputs.forEach(input => {
        input.placeholder = t.groupName;
    });
    
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
    
    // Counter accordion header
    const countersHeader = document.querySelector('.saved-roll-group[data-creature-name="Counters"] .saved-roll-header span:first-child');
    if (countersHeader) countersHeader.textContent = t.countersHeader;
    
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
    if (languageOptions.length >= 6) {
        languageOptions[0].textContent = t.langEnglish;
        languageOptions[1].textContent = t.langSpanish;
        languageOptions[2].textContent = t.langGerman;
        languageOptions[3].textContent = t.langFrench;
        languageOptions[4].textContent = t.langItalian;
        languageOptions[5].textContent = t.langPortuguese;
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
window.getTranslation = getTranslation;
