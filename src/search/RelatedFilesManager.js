define(function (require, exports, module) {
    "use strict";
    
    // Load dependent modules.
    var QuickOpen           = require("search/QuickOpen"),
        Commands            = require("command/Commands"),
        CommandManager      = require("command/CommandManager"),
        DocumentManager     = require("document/DocumentManager"),
        Strings             = require("strings"),
        EditorManager       = require("editor/EditorManager");
    
    // Object that has list of doc type and their providers.
    var relatedFilesProviders    = { "all" : [] };
        
    /**
    * Register provider for related files.
    * @param {Object} Provider object that has information about 
    * @param {Array} Array of doc types supported by related files provider.
    * @param {number} Specifies priority.
    **/
    function registerRelatedFilesProvider(providerInfo, languageIds, priority) {
        var providerObj = {
            provider: providerInfo,
            priority: priority || 0
        };
        
        if (languageIds.indexOf("all") !== -1) {
            var languageId;
            for (languageId in relatedFilesProviders) {
                if (relatedFilesProviders.hasOwnProperty(languageId)) {
                    relatedFilesProviders[languageId].push(providerObj);
                    relatedFilesProviders[languageId].sort(_providerSort);
                }
            }
        } else {
            languageIds.forEach(function (languageId) {
                if (!relatedFilesProviders[languageId]) {
                    relatedFilesProviders[languageId] = Array.prototype.concat(relatedFilesProviders.all);
                }
                relatedFilesProviders[languageId].push(providerObj);
                relatedFilesProviders[languageId].sort(_providerSort);
            });
        }
        
        addRelatedFilesPlugin();
    }
    
    function _providerSort(a, b) {
        return b.priority - a.priority;
    }
    
    function _getProvidersForLanguageIds(languageId) {
        return (relatedFilesProviders[languageId] || relatedFilesProviders['all']);
    }
    
    /**
    * Get the view to dispaly related files when searched with prefix "#".
    **/
    function doRelatedFilesSearch() {
        if (DocumentManager.getCurrentDocument()) {
            var currentEditor = EditorManager.getActiveEditor();
            var selectedText = (currentEditor && currentEditor.getSelectedText()) || "";
            QuickOpen.beginSearch("#", selectedText);
        }
    }
    
    function match(query) {
        return (query[0] === "#" && this.name === "Related files");
    }
    
    function itemFocus(selectedItem, query, explicit) {
        var cursorPos = extractCursorPos(query);

        var doClose = true,
            self = this;
        
            // Navigate to file and line number
            var fullPath = selectedItem && selectedItem.fullPath;
            if (fullPath) {
                CommandManager.execute(Commands.CMD_OPEN, {fullPath: fullPath});
            }
    }
    var CURSOR_POS_EXP = new RegExp(":([^,]+)?(,(.+)?)?");
    
    function extractCursorPos(query) {
        var regInfo = query.match(CURSOR_POS_EXP);

        if (query.length <= 1 || !regInfo ||
                (regInfo[1] && isNaN(regInfo[1])) ||
                (regInfo[3] && isNaN(regInfo[3]))) {

            return null;
        }

        return {
            query:  regInfo[0],
            local:  query[0] === ":",
            line:   regInfo[1] - 1 || 0,
            ch:     regInfo[3] - 1 || 0
        };
    }
    
    function itemSelect(selectedItem, query) {
        itemFocus(selectedItem, query, true);
    }
        
    // Add plugin for related files.
    function addRelatedFilesPlugin() {
        var search = _getProvidersForLanguageIds("html")[0];
        QuickOpen.addQuickOpenPlugin({
            name: "Related files",
            languageIds: ["html"],
            search: search.provider.getRelatedFiles,
            match: match,
            itemFocus: QuickOpen.itemFocus,
            itemSelect: QuickOpen.itemSelect
    });
    }
    
    // Register realted files command.
    CommandManager.register(Strings.CMD_FIND_RELATED_FILES, Commands.NAVIGATE_GOTO_RELATED_FILES, doRelatedFilesSearch);
    
    exports.registerRelatedFilesProvider = registerRelatedFilesProvider;
});