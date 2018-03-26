define(function (require, exports, module) {
    "use strict";
    
    // Load dependent modules.
    var QuickOpen           = require("search/QuickOpen"),
        QuickOpenHelper     = require("search/QuickOpenHelper"),
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
        
    // Add plugin for related files.
    function addRelatedFilesPlugin() {
        var search = _getProvidersForLanguageIds("html")[0];
        QuickOpen.addQuickOpenPlugin({
            name: "Related files",
            languageIds: ["html"],
            search: search.provider.getRelatedFiles,
            match: match,
            itemFocus: QuickOpenHelper.itemFocus,
            itemSelect: QuickOpenHelper.itemSelect
    });
    }
    
    // Register realted files command.
    CommandManager.register(Strings.CMD_GOTO_RELATED_FILES, Commands.NAVIGATE_GOTO_RELATED_FILES, doRelatedFilesSearch);
    
    exports.registerRelatedFilesProvider = registerRelatedFilesProvider;
});