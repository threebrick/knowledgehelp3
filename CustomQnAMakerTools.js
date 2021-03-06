"use strict";

var builder = require("botbuilder");
var CustomQnAMakerTools = (function () {
    function CustomQnAMakerTools() {
        this.lib = new builder.Library('customQnAMakerTools');
        this.lib.dialog('answerSelection', [
            function (session, args) {
                var qnaMakerResult = args;
                session.dialogData.qnaMakerResult = qnaMakerResult;
                var questionOptions = [];
                qnaMakerResult.answers.forEach(function (qna) { questionOptions.push(qna.questions[0]); });
                var promptOptions = { listStyle: builder.ListStyle.button };
                builder.Prompts.choice(session, "There are multiple good matches. Please select from the following:", questionOptions, promptOptions);
            },
            function (session, results) {
                var qnaMakerResult = session.dialogData.qnaMakerResult;
                var filteredResult = qnaMakerResult.answers.filter(function (qna) { return qna.questions[0] === results.response.entity; });
                var selectedQnA = filteredResult[0];
                session.send(selectedQnA.answer);
                console.log("The question - " + results.response.entity);
                console.log("The answer - " + selectedQnA.answer);
                session.send(selectedQnA);
                session.beginDialog('/faqhelp');
            },
        ]);
    }
    CustomQnAMakerTools.prototype.createLibrary = function () {
        return this.lib;
    };
    CustomQnAMakerTools.prototype.answerSelector = function (session, options) {
        session.beginDialog('customQnAMakerTools:answerSelection', options || {});
    };
    return CustomQnAMakerTools;
}());
exports.CustomQnAMakerTools = CustomQnAMakerTools;