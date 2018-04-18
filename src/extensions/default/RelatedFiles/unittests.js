define(function (require, exports, module) {
    "use strict";
    
    // Modules from the SpecRunner window
    var SpecRunnerUtils     = brackets.getModule("spec/SpecRunnerUtils"),
        Filesystem          = brackets.getModule("filesystem/FileSystem"),
        testHtmlContent     = require("text!unittest-files/test.html"),
        StringMatch         = brackets.getModule("utils/StringMatch"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        Document            = brackets.getModule("document/Document"),
        RelatedFiles        = require("main");
    
    var absPathPrefix = (brackets.platform === "win" ? "c:/" : "/");
    var testWindow, testDocument;
    
    describe("RealtedFiles", function () {
        beforeEach(function () {
            var mock = SpecRunnerUtils.createMockEditor(testHtmlContent, "html");
            testDocument = mock.doc;
            
            SpecRunnerUtils.createTestWindowAndRun(this, function (w) {
            testWindow = w;
            });
        });
            
        afterEach(function () {
            SpecRunnerUtils.closeTestWindow();
            testWindow = null;
        });
        
        
        // Creates object for expected output of test.html file.
        function createExpetcedSearchResults() {
            var expectedFiles = [];
            var searchResult = new StringMatch.SearchResult (absPathPrefix + "_unitTestDummyPath_" + "/index.css");
            searchResult.label = "index.css";
            searchResult.fullPath = absPathPrefix + "_unitTestDummyPath_" + "/index.css";
            searchResult.stringRanges = [{
                text: absPathPrefix + "_unitTestDummyPath_" + "/index.css",
                matched: false,
                includesLastSegment: true
            }];
            expectedFiles.push(searchResult);
            
            searchResult = new StringMatch.SearchResult (absPathPrefix + "_unitTestDummyPath_" + "/css/bootstrap-4.0.0.css");
            searchResult.label = "bootstrap-4.0.0.css";
            searchResult.fullPath = absPathPrefix + "_unitTestDummyPath_" + "/css/bootstrap-4.0.0.css";
            searchResult.stringRanges = [{
                text: absPathPrefix + "_unitTestDummyPath_" + "/css/bootstrap-4.0.0.css",
                matched: false,
                includesLastSegment: true
            }];
            expectedFiles.push(searchResult);
            
            searchResult = new StringMatch.SearchResult ("C:/Users/sarda/Desktop/Animate1.html");
            searchResult.label = "Animate1.html";
            searchResult.fullPath = "C:/Users/sarda/Desktop/Animate1.html";
            searchResult.stringRanges = [{
                text: "C:/Users/sarda/Desktop/Animate1.html",
                matched: false,
                includesLastSegment: true
            }];
            expectedFiles.push(searchResult);
            
            searchResult = new StringMatch.SearchResult ("https://code.jquery.com/jquery-3.3.1.js");
            searchResult.label = "code.jquery.com";
            searchResult.fullPath = "https://code.jquery.com/jquery-3.3.1.js";
            searchResult.stringRanges = [{
                text: "https://code.jquery.com/jquery-3.3.1.js",
                matched: false,
                includesLastSegment: false,
                includesFirstSegment: true
            }];
            expectedFiles.push(searchResult);
            
            searchResult = new StringMatch.SearchResult ("http://www.google.com");
            searchResult.label = "www.google.com";
            searchResult.fullPath = "http://www.google.com";
            searchResult.stringRanges = [{
                text: "http://www.google.com",
                matched: false,
                includesLastSegment: false,
                includesFirstSegment: true
            }];
            expectedFiles.push(searchResult);
            
            return expectedFiles;
        }
        
        describe ("test parseHTML", function () {
            spyOn(DocumentManager, "getCurrentDocument").andReturn(testDocument);

            // Test to see if the given html (test.html) is parsed properly.
            it("should parse given html", function() {
                var expectedOutput = createExpetcedSearchResults();
                var actualOutput = RelatedFiles.relatedFiles.getRelatedFiles();
                for (var i = 0; i < actualOutput.length; i++) {
                    expect(expectedOutput[i].fullPath).toBe(actualOutput[i].fullPath);
                    expect(expectedOutput[i].label).toBe(actualOutput[i].label);
                    expect(expectedOutput[i].stringRanges.text).toBe(actualOutput[i].stringRanges.text);
                    expect(expectedOutput[i].stringRanges.matched).toBe(actualOutput[i].stringRanges.matched);
                    expect(expectedOutput[i].stringRanges.includesLastSegment).toBe(actualOutput[i].stringRanges.includesLastSegment);
                    expect(expectedOutput[i].stringRanges.includesFirstSegment).toBe(actualOutput[i].stringRanges.includesFirstSegment);
                }
            });
        });   
    });
});