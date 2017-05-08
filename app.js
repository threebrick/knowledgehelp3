
var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');
var customQnAMakerTools = require('./CustomQnAMakerTools');
var helper = require('sendgrid').mail;

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    //appId: '6c6ce865-88e7-4445-86dc-6bf74befd89f',
    //appPassword: 'OpjSmvMw33YrLhwQsHC6U62'
 appId: process.env.MICROSOFT_APP_ID,
 appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
//server.post('https://knowledgehelp3.azurewebsites.net/api/messages', connector.listen());

//=========================================================
//Dash Bot Metrics
//=========================================================



// only include tokens for the platforms that you support
const dashbotApiMap = {
  
//  webchat: 'y7yja1LzSDmS0OJg2nDGEIEpScuMIYNuxgFO9mFR'
    webchat: 'JJlvf8VMhOfYhnIdXJ2zay3QdYAiPz6hR1kgIyjf'
  
}

const dashbot = require('dashbot')(dashbotApiMap).microsoft
//dashbot.setFacebookToken(process.env.FACEBOOK_PAGE_TOKEN) // only needed for Facebook Bots
bot.use(dashbot)


//=========================================================
// Bots Dialogs
//=========================================================

var recognizer = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: '45447def-4443-49a4-9ce1-b5a6ff3d7e46', 
	subscriptionKey: 'cb8ee4538ccc41ab8c3796d64bd93627',
	top: 3});

var qnaMakerTools = new cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
	recognizers: [recognizer],
	defaultMessage: 'Ask me anything',
	qnaThreshold: 0.3,
	feedbackLib: qnaMakerTools
});

//bot.dialog('/', basicQnAMakerDialog);

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Thanks you for using the Knowledge Help Bot. Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });
bot.beginDialogAction('menu', '/menu', { matches: /^menu|show menu|main menu/i });
bot.beginDialogAction('search', '/search', { matches: /^search|search again/i });


//=========================================================
// Bots Dialogs
//=========================================================
 
// Root dialog, triggers search and process its results
bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
     //   var card = new builder.HeroCard(session)
       //     .title("Knowledge Help Bot")
           // .text("Your bots - wherever your users are talking.")
      //      .images([
      //           builder.CardImage.create(session, "http://www.blocally.com/bots/ey/techsupport/ey_logo.png")
      //      ]);
      //  var msg = new builder.Message(session).attachments([card]);
      //  session.send(msg);
        session.send("Hi... I'm a virtual member of the Knowledge Help team.  I'm an expert on our Knowledge tools.");
        session.beginDialog('/menu');
    },
    //function (session, results) {
        // Display menu
    //    session.beginDialog('/menu');
    //},
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);


const WhatOption = 'What can I ask you?';

bot.dialog('/menu', [
    
 function (session) {

          
        
            session.beginDialog('/initialquestions');
     
   //     session.beginDialog('/FAQs*');

    }
    
    

]).reloadAction('reloadMenu', null, { matches: /^menu|show menu|main menu/i });   

bot.dialog('/search', [
    
 function (session) {

          
       //     session.replaceDialog('/test');
           session.beginDialog('/initialquestions2');
     
     //   session.beginDialog('/FAQs*');

    }
    
    

]).reloadAction('reloadSearch', null, { matches: /^search|search again/i }); 

 

bot.dialog('/initialquestions', [
    function (session) {
        builder.Prompts.choice(session, "How may I help you?  Please select one of the following options:", "Finding a research tool|Collaborating using SharePoint|Submitting knowledge|Help with EY Delivers*|Locating business info on Singapore or Malaysia companies*|Help using Factiva*|Help using Discover*|FAQs*");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    }
]);
bot.beginDialogAction('initialquestions', '/initialquestions'); 

//bot.dialog('/initialquestions2', [
//    function (session) {
//        builder.Prompts.choice(session, "Are you sure that you want to search again", "Yes|No");
//    },
//    function (session, results) {
//        if (results.response && results.response.entity == 'Yes') {
//            // Launch demo dialog
 //           console.log('Entity - ' + results.response.entity);
 //           console.log('Response - ' + results.response);
 //           session.beginDialog('/FAQs*');
 //       } else {
 //           // Exit the menu
 //           session.endDialog();
 //       }
 //   }
//]);
//bot.beginDialogAction('initialquestions2', '/initialquestions2'); 

bot.dialog('/initialquestions2', [
    function (session) {
        
        
        builder.Prompts.text(session, "Are you sure that you would like to search again? Answer yes or no.");
    },
    function (session, results) {
   //    session.send("You entered '%s'", results.response);

        if (results.response == 'yes' || results.response == 'Yes' || results.response == 'YES' ) {
            session.replaceDialog('/FAQs*');
        } else {
            session.send("I will now return you to the main menu");
            session.replaceDialog('/menu');
        }

    }
]);
bot.beginDialogAction('initialquestions2', '/initialquestions2');

bot.dialog('/speaktoadvisor', [
    function (session) {
        builder.Prompts.text(session, "I have access to a lot of the same information that our Knowledge Help team do, but if you'd rather deal with a human I understand.  Your local Knowledge Help team are available during business hours via a range of channels http://chs.ey.net/knowledgehelp.");
    }
]);
bot.beginDialogAction('speaktoadvisor', '/speaktoadvisor'); 

//bot.dialog('/search', [
//    function (session) {
     //   session.userData.search = "yes";

 //       delete session.dialogData.qnaMakerTools;
        //delete session.dialogData;
        //delete session.dialogData.qnaMakerResult;

      //  session.endDialog('BotBuilder:Prompts');
//        session.endDialog();
//        session.beginDialog('/test');
//    }
//]).triggerAction({ matches: /^search|search again/i });   

bot.dialog('/test', [
    function (session) {
        builder.Prompts.choice(session, "Are you sure that you want to search again?:", "Search again|Main Menu");
    },
    function (session, results) {
        if (results.response && results.response.entity == 'Search again') {
            // Launch demo dialog
            session.beginDialog('/FAQs*');
        } else {
            // Exit the menu
            session.endDialog();
        }
    }
]);
bot.beginDialogAction('test', '/test'); 

bot.dialog('/FAQs*', basicQnAMakerDialog);
//bot.beginDialogAction('FAQs', '/FAQs'); 
bot.beginDialogAction('FAQs*', '/FAQs*');

bot.dialog('/faqhelp', [
    function (session) {
       // session.send("Please contact your Engagment Administrator to arrange access. You will find the Engament Administrators names on the site's Engagement Form, which you can open by clicking on the engagement name in [Request & Tracking Site (RTS)](https://eyd-us.ey.com/sites/eydelivers_rts/RTSDefaultPages/) Active Engagements view. From your EYDelivers site you can also find the contacts via the Ressources link under Eng. & Project Admin.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "faqsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "faqfailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('faqhelp', '/faqhelp'); 

 
bot.dialog('/faqsuccess', [
    function (session) {

    //   session.userData.faqTest = "startFAQ"; 

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great! Would you like to 'Search Again', return to the 'Main Menu' or 'Exit'?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "PreFAQs", "", "Search Again"),
                        builder.CardAction.dialogAction(session, "menu", null, "Main Menu"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "Exit")
                    ])
            ]);
        //session.send(msg);
        session.endDialog(msg);
    }
]);
bot.beginDialogAction('faqsuccess', '/faqsuccess'); 

//bot.dialog('/PreFAQs', BasicQnAMakerDialog);
//bot.beginDialogAction('FAQs', '/FAQs'); 
//bot.beginDialogAction('PreFAQs', '/PreFAQs');   


bot.dialog('/PreFAQs', [
    function (session) {

        if (session.userData.product == "Discover") {
            session.beginDialog('/Help using Discover*');
        } else if (session.userData.product == "Factiva") {
            session.beginDialog('/Help using Factiva*');
        } else {
            session.beginDialog('/FAQs*');
        }

       

    }   
]);
bot.beginDialogAction('PreFAQs', '/PreFAQs'); 



bot.dialog('/faqfailure', [
    function (session) {

        //session.send("I'm sorry that I’ve not been able to answer your question here, however there is more comprehensive support on our [EYD tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact the [Client Portal Helpesk](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=CT-73A58812C88CD149C1257C71003712A2) or your Engagment Admin.");
       // session.send("Access Request Failure.");
       var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to 'Search Again', return to the 'Main Menu' or 'Speak to an Advisor'?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "PreFAQs", null, "Search Again"),
                        builder.CardAction.dialogAction(session, "menu", null, "Main Menu"),
                        
                        builder.CardAction.dialogAction(session, "speaktoadvisor", null, "Speak to an Advisor")
                    ])
            ]);
        session.send(msg);

    }   
]);
bot.beginDialogAction('faqfailure', '/faqfailure'); 




bot.dialog('/Help with EY Delivers*', [
    function (session) {
        builder.Prompts.choice(session, "Great! How can I help you with EY Delivers?", "I want to request a new site or follow up on a new site request|I need to arrange access to an existing site|I would like some help using EY Delivers|I am receiving an error message");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    }
]);
bot.beginDialogAction('Help with EY Delivers*', '/Help with EY Delivers*'); 


bot.dialog('/Locating business info on Singapore or Malaysia companies*', [
    function (session) {

        //var msg = new builder.Message(session)
        //    .textFormat(builder.TextFormat.xml)
        //    .attachments([
        //        new builder.HeroCard(session)
                    
        //            .text("Questnet (www.questnet.sq) is a good source for obtaining digital copies of business profile reports and audited financial statements of companies in Singapore / Malaysia. Would you like to explore how to access Questnet content?")
                    
        //            .buttons([
        //                builder.CardAction.dialogAction(session, "questnet", null, "Yes"),
                        
        //                builder.CardAction.dialogAction(session, "questnethowhelp", null, "No")
        //            ])
        //    ]);
        //session.send(msg);
        //session.endDialog(msg);

        session.beginDialog('/questnetinfo');

    }
]);
bot.beginDialogAction('Locating business info on Singapore or Malaysia companies*', '/Locating business info on Singapore or Malaysia companies*'); 



bot.dialog('/Help using Factiva*', [
    function (session) {
        session.userData.product = "Factiva";
        session.beginDialog('/FAQs*');
    }
]);
bot.beginDialogAction('Help using Factiva*', '/Help using Factiva*'); 


// Factiva FAQ Search Code



// End Factiva FAQ Search Code



bot.dialog('/Help using Discover*', [
    function (session) {


        session.userData.product = "Discover";

        builder.Prompts.choice(session, "Discover is EY's global knowledge portal, it connects you to documents, people and communities so that you can harness the knowledge and expertise of all of EY. \nBelow are some common questions people ask about Discover, type the number to learn more or type 5 to ask your own question:", "How can I access EY Discover?|How is Discover different from the search on the EY home page?|How can I contribute to Discover?|What is the best way to search for a Credential?|Ask a question");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            //session.endDialog();
            session.userData.question = results.response.entity;
            // Trigger Search
            session.beginDialog('/FAQs*');
        }
    }
]);
bot.beginDialogAction('Help using Discover*', '/Help using Discover*'); 


// Discover FAQ Search Code

bot.dialog('/How can I access EY Discover?', [
    function (session) {
        // Adds Product variable
        session.userData.product = "Discover";
        session.userData.question = "How can I access EY Discover?";
        // Trigger Search
        session.beginDialog('/FAQTemplate');
    } 

]);
bot.beginDialogAction('How can I access EY Discover?', '/How can I access EY Discover?'); 

bot.dialog('/How is Discover different from the search on the EY home page?', [
    function (session) {
        // Adds Product variable
        session.userData.product = "Discover";
        session.userData.question = "How is Discover different from the search on the EY home page?";
        // Trigger Search
        session.beginDialog('/FAQTemplate');
    }  

]);
bot.beginDialogAction('How is Discover different from the search on the EY home page?', '/How is Discover different from the search on the EY home page?');


bot.dialog('/How can I contribute to Discover?', [
    function (session) {
        // Adds Product variable
        session.userData.product = "Discover";
        session.userData.question = "How can I contribute to Discover?";
        // Trigger Search
        session.beginDialog('/FAQTemplate');
    }  

]);
bot.beginDialogAction('How can I contribute to Discover?', '/How can I contribute to Discover?');


bot.dialog('/What is the best way to search for a Credential?', [
    function (session) {
        // Adds Product variable
        session.userData.product = "Discover";
        session.userData.question = "What is the best way to search for a Credential?";
        // Trigger Search
        session.beginDialog('/FAQTemplate');
    }   

]);
bot.beginDialogAction('What is the best way to search for a Credential?', '/What is the best way to search for a Credential?');

bot.dialog('/Ask a question', [
    function (session) {
        
        // Trigger Search
        session.beginDialog('/FAQs*');
    }   

]);
bot.beginDialogAction('Ask a question', '/Ask a question');



bot.dialog('/FAQTemplate', [
    function (session) {

    var Answer1 = "You can access Discover from [here](https://find.ey.net/discover) or from the link in the EY Essentials section of the EY Home Page";
    var Answer2 = "Search from the EY Home Pages returns resources from all searchable systems and databases within the firm.  Discover provides a tailored search experience for finding knowledge documents, people and communities.";
    var Answer3 = "You can help to grow and improve the knowledge collection in Discover by simply clicking \"Submit\" from the top menu in Discover";
    var Answer4 = "To search specifically for a credential, try searching for the name of the type of credential you are looking for, such as ‘Oil and Gas Credentials’ or ‘SAP Credentials’. You may also want to include a keyword that would have been used to describe the type of work EY provided. There are 2 Content Type filters for ‘EY Credentials’, found under ‘Pursuit’ > ‘EY Credentials’ > Engagement Credential and/or Credential Materials.";
    

        // Trigger Search
        if (session.userData.question == "How can I access EY Discover?") {
            session.send('**Q.** %s \n\n **A.** %s',
                session.userData.question,
                Answer1);
        } else if (session.userData.question == "How is Discover different from the search on the EY home page?") {
            session.send('**Q.** %s \n\n **A.** %s',
                session.userData.question,
                Answer2);
        } else if (session.userData.question == "How can I contribute to Discover?") {
            session.send('**Q.** %s \n\n **A.** %s',
                session.userData.question,
                Answer3);
        } else if (session.userData.question == "What is the best way to search for a Credential?") {
            session.send('**Q.** %s \n\n **A.** %s',
                session.userData.question,
                Answer4);

        }

        session.beginDialog('/faqhelp');
    }   

]);
bot.beginDialogAction('FAQTemplate', '/FAQTemplate');





// End Discover FAQ Search Code









bot.dialog('/Finding a research tool', [
    function (session) {

        session.send("I'm sorry I can't  answer this question yet.  Please type 'menu' to return to the main menu.");
    }

]);
bot.beginDialogAction('Finding a research tool', '/Finding a research tool'); 

bot.dialog('/Collaborating using SharePoint', [
    function (session) {

        session.send("I'm sorry I can't  answer this question yet.  Please type 'menu' to return to the main menu.");
    }

]);
bot.beginDialogAction('Collaborating using SharePoint', '/Collaborating using SharePoint');

bot.dialog('/Submitting knowledge', [
    function (session) {

        session.send("I'm sorry I can't  answer this question yet.  Please type 'menu' to return to the main menu.");
    }

]);
bot.beginDialogAction('Submitting knowledge', '/Submitting knowledge');














// Start EY Delivers


bot.dialog('/eydeliversmainmenu', [
    function (session) {
        builder.Prompts.choice(session, "How can we help you with EYDelivers?", "I want to request a new site or follow up on a new site request|I need to arrange access to an existing site|I am receiving an error message|I would like some help using EY Delivers|(quit)");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    }
]);
bot.beginDialogAction('eydeliversmainmenu', '/eydeliversmainmenu');


bot.dialog('/I want to request a new site or follow up on a new site request', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this relate to an existing site or would you like to set up a new site?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "newsite", null, "New site"),
                        
                        builder.CardAction.dialogAction(session, "existingsite", null, "Existing site")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('I want to request a new site or follow up on a new site request', '/I want to request a new site or follow up on a new site request'); 


// existing site flow

bot.dialog('/existingsite', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Have you completed the Engagment Administrator eLearning in the last 48 hours?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "completedelearning", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "notcompletedelearning", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('existingsite', '/existingsite'); 



bot.dialog('/completedelearning', [
    
    function (session) {

        

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("If you submit an urgent site request within 48 hours of completing the eLearning please submit a copy of your Completion Diploma to the Client Portal Helpesk team (part of IT Services). Would you like me to help you to that?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "completiondiploma", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "menu", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('completedelearning', '/completedelearning');



bot.dialog('/completiondiploma', [
    
    function (session) {

        builder.Prompts.attachment(session, "First let's retrieve your ‘Completion Diploma’ once you have passed the eLearning:\n\n* Go back in EYLeads to the Activity Details page for EYDelivers for Engagement Administrators \n* Scroll down in the lesson description November 2016 EYD V3.0EYDelivers: Request an EYD site QRG \n* Click on the diploma icon \n* Make a print screen of the diploma");
        },
        function (session, results) {
            var msg = new builder.Message(session)
                .ntext("I got %d attachment.", "I got %d attachments.", results.response.length);
            results.response.forEach(function (attachment) {
                msg.addAttachment(attachment);    
            });
            session.send(msg);
       

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Do you know your Request ID? (this 4 or 5 digit ID is available from the EYDelivers Request and Tracking Site –My Requests feature)")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "yesid", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "noid", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('completiondiploma', '/completiondiploma');




bot.dialog('/noid', [
    function (session) {
        session.send("If for any reason you can't provide a request ID please share either the GFIS engagement number/code or Client Name and Engagement Name.");
        builder.Prompts.text(session, "Please enter your EY email address.");
    },
    

    function (session, results) {
  
        session.userData.email = results.response;
        
        
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("EY Delivers Request")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        
                        
                        builder.Fact.create(session, "" + session.userData.email + "", "Email Address")
                                               
                    ])
                  
            ]);
        session.send(msg);
        session.beginDialog('/requestsubmit');
        
    }

    
    
    
]);
bot.beginDialogAction('noid', '/noid');   // <-- no 'matches' option means this can only be triggered by a button.




bot.dialog('/yesid', [
    function (session) {
     //   session.send("Good choice! You'll soon be able to access Questnet reports directly.  I just need to collect 3 pieces of info from you to be able to generate a username and password.");
        builder.Prompts.number(session, "Please enter the request ID.");
    },
    function (session, results) {
    //    session.send("You entered '%s'", results.response);
        session.userData.requestid = results.response;
        builder.Prompts.text(session, "And what is your EY email address?");
    },
    function (session, results) {
    //    session.send("You entered '%s'", results.response);
        session.userData.email = results.response;
        
   
        
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("EY Delivers Request")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        
                        builder.Fact.create(session, "" + session.userData.requestid + "", "Request ID"),
                        builder.Fact.create(session, "" + session.userData.email + "", "Email Address")
                                               
                    ])
                  
            ]);
        session.send(msg);
        session.beginDialog('/requestsubmit');

        
        
    }

    
    
    
]);
bot.beginDialogAction('yesid', '/yesid');   // <-- no 'matches' option means this can only be triggered by a button.



bot.dialog('/requestsubmit', [
    
    
    function (session) {


        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to submit this information now or re-enter the information?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "sendemailrequest", null, "Submit"),
                        
                        builder.CardAction.dialogAction(session, "completiondiploma", null, "Re-enter information")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('requestsubmit', '/requestsubmit');   // <-- no 'matches' option means this can only be triggered by a button.




bot.dialog('/sendemailrequest', [
    
    function (session) {


        // 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
        // using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
//var helper = require('sendgrid').mail;
var fromEmail = new helper.Email('' + session.userData.email + '');
var toEmail = new helper.Email('rkeitch@uk.ey.com');
var subject = 'Knowledge Help Bot Email';
var content = new helper.Content('text/plain', 'Request ID - '+ session.userData.requestid);
var mail = new helper.Mail(fromEmail, subject, toEmail, content);

var sg = require('sendgrid')('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');
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
});

sg.API(request, function (error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});


        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "endhelp", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "sorrymessage", null, "No")
                    ])
            ]);
        session.send(msg);
    }
]);
bot.beginDialogAction('sendemailrequest', '/sendemailrequest');



bot.dialog('/sorrymessage', [
    
    function (session) {

        session.send("Sorry that I have not been able to answer your question here, however this is more comprehensive support on our [EYD tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact the [Client Portal Helpdesk](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=CT-73A58812C88CD149C1257C71003712A2) or your Engagement Admin.");

        
        
        
    }
]);
bot.beginDialogAction('sorrymessage', '/sorrymessage');


bot.dialog('/endhelp', [
    
    function (session) {
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
            ]);
        session.send(msg);
    }
]);
bot.beginDialogAction('endhelp', '/endhelp');














bot.dialog('/notcompletedelearning', [
    
    function (session) {

        session.send("Your EYDeliverssite should be available within 24 hours Of requesting it if all the listed Engagment Administrators have taken and passed the EYDelivers for [Engagement Administrators eLearning](https://eyfs.intellinex.com/eysso/sso_login.aspx?DeepLinkKey=569f6d4f-882a-41bc-81f9-0a871f2c999) at least 48hours before initiating the request for a new site. You can obtain a status update on your EYDelivers site request by contacting [Client Portal Helpdesk]( http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=CT-73A58812C88CD149C1257C71003712A2).");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "exisitngsiterequestsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "existingsitefailure", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('notcompletedelearning', '/notcompletedelearning');


bot.dialog('/exisitngsiterequestsuccess', [
    
    function (session) {

       

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('exisitngsiterequestsuccess', '/exisitngsiterequestsuccess');



bot.dialog('/existingsitefailure', [
    
    function (session) {

      //  session.send("Sorry that I’ve not been able to answer your question here. There is more comprehensive support on our [EYDelivers tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact your local [Knowledge Help team](http://chs.ey.net/knowledgehelpContact) or ask your question in the [EYD/WPP Yammer group](https://www.yammer.com/ey.com/#/threads/inGroup?type=in_group&feedId=2770414EYD)");
      session.send("I'm sorry that I’ve not been able to answer your question here, however there is more comprehensive support on our [EYDelivers tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact the [Client Portal Helpdesk](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=CT-73A58812C88CD149C1257C71003712A2) (part of IT Services) by phone or email");

        
    }
]);
bot.beginDialogAction('existingsitefailure', '/existingsitefailure');



// End existing site flow




// new site flow
bot.dialog('/newsite', [
    
    function (session) {
        session.send("New sites can be requested using the [EYDelivers Request & Tracking site](https://eyd-us.ey.com/sites/eydelivers_rts/RTSDefaultPages/) (we have a quick reference guide available [here](https://eyd-us.ey.com/sites/eydelivers_rts/RTSDefaultPages/)). As EYDelivers sites can be made available to clients and third parties sites it’s important they’re managed by a trained member of the Engagement Team (called an Engagement Administrator). A site can’t be created until the Engagement Administrators listed on the request have completed the mandatory eLearning.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "newsitemessage2", null, "Next message")
                        
                        
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('newsite', '/newsite');


bot.dialog('/newsitemessage2', [
    
    function (session) {

        session.send("An Engagement Administrator (EA) is a “super-user” of the engagement who has completed mandatory eLearning. An EA has full access to everything in the engagement, has special admin only rights and is the first point of contact for usage questions by team members. It is recommended to have at least two EAs identified for each engagement.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "newsiterequestsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "requestreferenceguide", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('newsitemessage2', '/newsitemessage2');



bot.dialog('/requestreferenceguide', [
    
    function (session) {

        session.send("You may like to review our [Request an EYD site quick reference guide](http://chs.iweb.ey.com/GLOBAL/CKR/ASIAPACEXTLCONTENTCKR.NSF/ff9ebbe29791239e85257138005b75d9/a31e051d99a604c8c12579aa003f7f54/$FILE/Request%20an%20EYD%20site.V3.0.pdf)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "exisitngsiterequestsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "newsitefailure", null, "No")
                    ])
                        
                        
                    
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('requestreferenceguide', '/requestreferenceguide');


bot.dialog('/newsiterequestsuccess', [
    
    function (session) {

        session.send("New site request success!");

        
    }
]);
bot.beginDialogAction('newsiterequestsuccess', '/newsiterequestsuccess');

bot.dialog('/newsitefailure', [
    
    function (session) {

        session.send("Sorry that I’ve not been able to answer your question here. There is more comprehensive support on our [EYDelivers tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact your local [Knowledge Help team](http://chs.ey.net/knowledgehelp) or ask your question in the [EYD/WPP Yammer group](https://www.yammer.com/ey.com/#/threads/inGroup?type=in_group&feedId=2770414)");

        
    }
]);
bot.beginDialogAction('newsitefailure', '/newsitefailure');



// end new or existing flow







// arrange access flow

bot.dialog('/I need to arrange access to an existing site', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Do you want to grant access for An EY employee or an external client or third party?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "eyemployee", null, "EY employee"),
                        
                        builder.CardAction.dialogAction(session, "externalclient", null, "external client or third party")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('I need to arrange access to an existing site', '/I need to arrange access to an existing site for EY staff'); 


bot.dialog('/externalclient', [
    function (session) {
        //session.send("Please contact your Engagment Administrator to arrange access. You will find the Engament Administrators names on the site's Engagement Form, which you can open by clicking on the engagement name in Request & Tracking Site (RTS) Active Engagements view. From your EYDelivers site you can also find the contacts via the Ressources link under Eng. & Project Admin.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("For clients and third parties to access EYDelivers they first require a Client Portal account. I can help you organise that. Would you like to arrange access for one person or multiple people?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "oneperson", null, "One"),
                        
                        builder.CardAction.dialogAction(session, "multiplepeople", null, "Multiple")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('externalclient', '/externalclient'); 


bot.dialog('/multiplepeople', [
    function (session) {
        session.send("If you are requesting access for multiple users, complete this [Excel form](http://chas.ey.net/GLOBAL/CKR/ASIAPACEXTLCONTENTCKR.NSF/ff9ebbe29791239e85257138005b75d9/a31e051d99a604c8c12579aa003f7f54/$FILE/EYD%20Bulk%20Upload%20Form_client%20portal.xlsx) and send it to Client Portal Helpdesk clientportal@ey.com. \n");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "accessrequestsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "accessrequestfailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('multiplepeople', '/multiplepeople'); 

bot.dialog('/accessrequestfailure2', [
    function (session) {

        session.send("Sorry that I’ve not been able to answer your question here, however there is more comprehensive support on our EYD tools page or you may like to contact the Client Portal Helpesk or your Engagment Admin.");
        //session.send("Access Request Failure.");

    }   
]);
bot.beginDialogAction('accessrequestfailure2', '/accessrequestfailure2'); 




bot.dialog('/oneperson', [
    function (session) {
     //   session.send("Good choice! You'll soon be able to access Questnet reports directly.  I just need to collect 3 pieces of info from you to be able to generate a username and password.");
        builder.Prompts.text(session, "Please enter the client company name (or EY if you are staff)");
    },
    function (session, results) {
        //session.send("You entered '%s'", results.response);
        session.userData.companyname = results.response;
        builder.Prompts.text(session, "Client/third party's full name (including title - Mr/Ms etc.)?");
    },
    function (session, results) {
        //session.send("You entered '%s'", results.response);
        session.userData.name = results.response;
        builder.Prompts.text(session, "Client/third party's full external email address?");
        
    },
    function (session, results) {
        //session.send("You entered '%s'", results.response);
        session.userData.email = results.response;
        builder.Prompts.text(session, "Client/third party's job title?");
    },
    function (session, results) {
        //session.send("You entered '%s'", results.response);
        session.userData.jobtitle = results.response;
        builder.Prompts.number(session, "Client/third party's telephone number?");
        
    },
    function (session, results) {
        //session.send("You entered '%s'", results.response);
        session.userData.contactnumber = results.response;
        builder.Prompts.text(session, "Finally, please enter the content/tools required (eg eRoom, EYDelivers)");
    },
    
    function (session, results) {
  //      session.send("You can send a receipts for purchased good with both images and without...");
       // session.send("You entered '%s'", results.response);
        session.userData.tools = results.response;
        
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Client Portal Access")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        
                        builder.Fact.create(session, "" + session.userData.companyname + "", "Company Name"),
                        builder.Fact.create(session, "" + session.userData.name + "", "Name"),
                        
                        builder.Fact.create(session, "" + session.userData.email + "", "Email Address"),
                        builder.Fact.create(session, "" + session.userData.jobtitle + "", "Job Title"),
                        builder.Fact.create(session, "" + session.userData.contactnumber + "", "Contact Number"),
                        builder.Fact.create(session, "" + session.userData.tools + "", "Tools Required")

                                               
                    ])
                  
            ]);
        session.send(msg);
        session.beginDialog('/shouldwesubmit2');

        
        
    }

    
    
    
]);
bot.beginDialogAction('oneperson', '/oneperson');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/shouldwesubmit2', [
    
    
    function (session) {

// Send Email
var fromEmail = new helper.Email('' + session.userData.email + '');
var toEmail = new helper.Email('rkeitch@uk.ey.com');
//var toEmail = new helper.Email('darnell.clayton2010@gmail.com');
var subject = 'Knowledge Help Bot Email - One Person';
var content = new helper.Content('text/plain', 'Company Name - '+ session.userData.companyname +', Name - ' + session.userData.name + ', Email Address - ' + session.userData.email + ', Job Title - ' + session.userData.jobtitle + ', Contact Number - ' + session.userData.contactnumber + ', Tools - '+ session.userData.tools);
var mail = new helper.Mail(fromEmail, subject, toEmail, content);

var sg = require('sendgrid')('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');
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
});

sg.API(request, function (error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to submit now or re-enter the information?")
                    
                    .buttons([
                        
                        builder.CardAction.dialogAction(session, "addanother", null, "Submit now"),
                        
                        builder.CardAction.dialogAction(session, "oneperson", null, "Re-enter information")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('shouldwesubmit2', '/shouldwesubmit2');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/addanother', [
    
    
    function (session) {


        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to set up another?")
                    
                    .buttons([
                        
                        builder.CardAction.dialogAction(session, "oneperson", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "sendaccessrequest", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('addanother', '/addanother');   // <-- no 'matches' option means this can only be triggered by a button.




bot.dialog('/sendaccessrequest', [
    
    function (session) {
        session.send("Your request has been sent to the Client Portal team and will be actioned within XXhours.");
        session.beginDialog('/sendemailrequest');
    },
    
]);
bot.beginDialogAction('sendaccessrequest', '/sendaccessrequest');





bot.dialog('/eyemployee', [
    function (session) {
        session.send("Please contact your Engagment Administrator to arrange access. You will find the Engament Administrators names on the site's Engagement Form, which you can open by clicking on the engagement name in [Request & Tracking Site (RTS)](https://eyd-us.ey.com/sites/eydelivers_rts/RTSDefaultPages/) Active Engagements view. From your EYDelivers site you can also find the contacts via the Ressources link under Eng. & Project Admin.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "accessrequestsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "accessrequestfailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('eyemployee', '/eyemployee'); 


bot.dialog('/accessrequestsuccess', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('accessrequestsuccess', '/accessrequestsuccess'); 



bot.dialog('/accessrequestfailure', [
    function (session) {

        session.send("I'm sorry that I’ve not been able to answer your question here, however there is more comprehensive support on our [EYD tools page](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=LP-8C1E1313DF94999185257C7D0067F087) or you may like to contact the [Client Portal Helpesk](http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852576F00003462C&contentID=CT-73A58812C88CD149C1257C71003712A2) or your Engagment Admin.");
       // session.send("Access Request Failure.");

    }   
]);
bot.beginDialogAction('accessrequestfailure', '/accessrequestfailure'); 





// end arrange access flow











// receiving errors flow



bot.dialog('/I am receiving an error message', [
    function (session) {
        builder.Prompts.choice(session, "Does you error message match any of these?  You may click any of the following links for more information.", "Your client does not support opening this list with Windows Explorer|Secure Proxy Server -Error Report|Page cannot be displayed|Unable to submit Request and Tracking Site (RTS) form to request a site|Error occured. Access denied.  You do not have permission to perform this action or access this resource");
        
        
    },

    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    }    
    //function (session) {

   //     session.send("Does you error message match any of these?");
      //  session.send("Test 1 \n Test 2 \n Test 3 \n");
   //     session.send("[Your client does not support opening this list with Windows Explorer.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)\n [Secure Proxy Server -Error Report.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)\n [Page cannot be displayed.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)\n [Unable to submit Request and Tracking Site (RTS) form to request a site.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)\n [Error occured. Access denied.  You do not have permission to perform this action or access this resource](https://ey.service-now.com/kb_view.do?sysparm_article=KB0090786)");

      // session.beginDialog('yeskb');
    //  session.beginDialog('/yeskb');
    //}
]);
bot.beginDialogAction('I am receiving an error message', '/I am receiving an error message'); 


bot.dialog('/Your client does not support opening this list with Windows Explorer', [
    function (session) {

        session.send("If you are receiving the following error message, you may click the link to get more information: \n\n [Your client does not support opening this list with Windows Explorer.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)  ");
        session.beginDialog('/errorhelp');

    }   
]);
bot.beginDialogAction('Your client does not support opening this list with Windows Explorer', '/Your client does not support opening this list with Windows Explorer');


bot.dialog('/Secure Proxy Server -Error Report', [
    function (session) {

        session.send("If you are receiving the following error message, you may click the link to get more information: \n\n [Secure Proxy Server -Error Report.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)");
        session.beginDialog('/errorhelp');

    }   
]);
bot.beginDialogAction('Secure Proxy Server -Error Report', '/Secure Proxy Server -Error Report');


bot.dialog('/Page cannot be displayed', [
    function (session) {

        session.send("If you are receiving the following error message, you may click the link to get more information: \n\n [Page cannot be displayed.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)");
        session.beginDialog('/errorhelp');

    }   
]);
bot.beginDialogAction('Page cannot be displayed', '/Page cannot be displayed');


bot.dialog('/Unable to submit Request and Tracking Site (RTS) form to request a site', [
    function (session) {

        session.send("If you are receiving the following error message, you may click the link to get more information: \n\n [Unable to submit Request and Tracking Site (RTS) form to request a site.](https://ey.service-now.com/kb_view.do?sysparm_article=KB0218016)");
        session.beginDialog('/errorhelp');

    }   
]);
bot.beginDialogAction('Unable to submit Request and Tracking Site (RTS) form to request a site', '/Unable to submit Request and Tracking Site (RTS) form to request a site');


bot.dialog('/Error occured. Access denied.  You do not have permission to perform this action or access this resource', [
    function (session) {

        session.send("If you are receiving the following error message, you may click the link to get more information: \n\n [Error occured. Access denied.  You do not have permission to perform this action or access this resource](https://ey.service-now.com/kb_view.do?sysparm_article=KB0090786)");
        session.beginDialog('/errorhelp');

    }   
]);
bot.beginDialogAction('Error occured. Access denied.  You do not have permission to perform this action or access this resource', '/Error occured. Access denied.  You do not have permission to perform this action or access this resource');

bot.dialog('/errorhelp', [
    function (session) {

      

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Does this help?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "knownissuesuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "knownissuefailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('errorhelp', '/errorhelp'); 





bot.dialog('/knownissuesuccess', [
    function (session) {
        
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);

    }   
]);
bot.beginDialogAction('knownissuesuccess', '/knownissuesuccess'); 



bot.dialog('/knownissuefailure', [
    function (session) {

        session.send("Sorry that I’ve not been able to solve your issue here, IT Services provide technical support for EYDelivers. Please call your local IT Service Desk or use the [IT Self-Service portal](https://ey.service-now.com/ey/contact_it_service_desk.do) to chat with a technician or log a ticket.");
        //session.send("Access Request Failure.");

    }   
]);
bot.beginDialogAction('knownissuefailure', '/knownissuefailure'); 



// end receiving errors flow



// I'd like some help flow

bot.dialog('/I would like some help using EY Delivers', [
    function (session) {
        // Adds Product variable
        session.userData.product = "EY Delivers";
        session.userData.question = null;
        // Trigger Search
        session.beginDialog('/FAQs*');
    }  

]);
 



// I'd like some help flow


// End EY Delivers











// Start Questnet App

// Root dialog, triggers search and process its results
bot.dialog('/questnet', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Questnet Bot")
           // .text("Your bots - wherever your users are talking.")
            .images([
                 builder.CardImage.create(session, "http://www.blocally.com/bots/ey/techsupport/ey_logo.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi... I'm the Questnet Bot. I can help  you ... and answer your FAQs.");
        session.beginDialog('/questnetmenu');
    },
    //function (session, results) {
        // Display menu
    //    session.beginDialog('/menu');
    //},
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);
bot.beginDialogAction('questnet', '/questnet'); 

bot.dialog('/questnetmenu', [
    
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Are you looking for information on a Singapore or Malaysian company?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "questnetinfo", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "questnethowhelp", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/questnetmenu');
    }
]);
bot.beginDialogAction('questnetmenu', '/questnetmenu'); 

bot.dialog('/questnethowhelp', [
    function (session) {
        session.endDialog("How else can I help you?  Global commands that are available anytime:\n\n* menu - returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);
bot.beginDialogAction('questnethowhelp', '/questnethowhelp'); 

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

// Create a service tickets flow

bot.dialog('/questnetinfo', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Questnet is a good source for obtaining digital copies of business profile reports and audited financial statements of companies in Singapore / Malaysia.  Are you based in Singapore or Malaysia?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "account", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "purchaseorfind", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('questnetinfo', '/questnetinfo'); 




bot.dialog('/location', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Are you based in Singapore or Malaysia?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "account", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "purchaseorfind", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('location', '/location'); 

bot.dialog('/purchaseorfind', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to purchase it yourself (with a credit card), or would you prefer an EY Knowledge researcher to find it for you?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "creditcard", null, "Purchase it myself"),
                        builder.CardAction.dialogAction(session, "acrachargecodequestions", null, "Find it for me")
                        
                        
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('purchaseorfind', '/purchaseorfind'); 



bot.dialog('/creditcard', [
    function (session) {

 //       var msg = new builder.Message(session)
//            .textFormat(builder.TextFormat.xml)
//            .attachments([
//                new builder.HeroCard(session)
                    
//                    .text("You can find guidance for how to use your credit card to set up a personal account by clicking the button below")
                    
//                    .buttons([
//                        builder.CardAction.dialogAction(session, "http://chs.ey.net/servlet/CHSRenderingServlet?contentlD=CT-BB", null, "Use cc for personal account")
//                    ])
//            ]);
//        session.send(msg);
        //session.endDialog(msg);
        session.send("Please click [here](http://chs.ey.net/servlet/CHSRenderingServlet?contentID=CT-BBED0AF038A8C8AD85257CEC00512EAB&chsReplicaID=852576F00003462C) for step-by-step details on how to purchase Questnet reports.");
        session.beginDialog('/waitforaccount');
    }
]);
bot.beginDialogAction('creditcard', '/creditcard'); 

bot.dialog('/account', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("If you are working on a project for Singapore/Malaysia with a Singapore/Malaysia charge code and are located in Singapore/Malaysia I can either set you up with a Questnet account or organise for the report to be retreived for you.  If your request is not a one off, I recommend you request your own Questnet account.  Would you like an account?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "chargecodequestions", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "acrachargecodequestions", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('account', '/account');

bot.dialog('/chargecodequestions', [
    function (session) {
        session.send("Good choice! You'll soon be able to access Questnet reports directly.  I just need to collect 3 pieces of info from you to be able to generate a username and password.");
        builder.Prompts.text(session, "Please enter your EY email address.");
    },
    function (session, results) {
     //   session.send("You entered '%s'", results.response);
        session.userData.email = results.response;
        builder.Prompts.text(session, "And what is your contact number?");
    },
    function (session, results) {
    //    session.send("You entered '%s'", results.response);
        session.userData.phonenumber = results.response;
        builder.Prompts.text(session, "Lastly, please enter your charge code (Questnet charges a variable fee based on the type of report that is downloaded).");
        //session.beginDialog('/sendemail');
    },
    

    function (session, results) {
  //      session.send("You can send a receipts for purchased good with both images and without...");
  //      session.send("You entered '%s'", results.response);
        session.userData.chargecode = results.response;
        // Send a receipt with images
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Questnet Account Request")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                    //    builder.Fact.create(session, "SR1234567898", "Ticket Number"),
                        builder.Fact.create(session, "" + session.userData.email + "", "Email Address"),
                       
                        builder.Fact.create(session, "" + session.userData.phonenumber + "", "Phone Number"),
                        builder.Fact.create(session, "" + session.userData.chargecode + "", "Charge Code")
                        
                    ])
                  //  .tax("$4.40")
                  //  .total("$48.40")
            ]);
        session.send(msg);
        session.beginDialog('/ticketsubmit');

        
        
    }

    
    
    
]);
bot.beginDialogAction('chargecodequestions', '/chargecodequestions');   // <-- no 'matches' option means this can only be triggered by a button.



bot.dialog('/ticketsubmit', [
    
    
    function (session) {
//        builder.Prompts.choice(session, "What demo would you like to run?", "ticket|prompts|picture|cards|list|carousel|receipt|actions|(quit)");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to submit this information now or re-enter the information?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "sendemail", null, "Submit"),
                        
                        builder.CardAction.dialogAction(session, "chargecodequestions", null, "Re-enter Information")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('ticketsubmit', '/ticketsubmit');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/ticketcomplete', [
    function (session) {
        session.endDialog("Please note it can take between one and three days to receive your username and password.  If you don't yet have your own login details and your request is urgent EY Knowledge can still find reports for you until it arrives.");
        
    }
    
]);
bot.beginDialogAction('ticketcomplete', '/ticketcomplete');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/sendemail', [
    //function (session) {
    //    session.send("Please note it can take between one and three days to receive your username and password.  If you don't yet have your own login details and your request is urgent EY Knowledge can still find reports for you until it arrives.");
        
    //},
    function (session) {
        session.send("Please note it can take up to 3 days to receive your username and password.  If you don't yet have your own login details and your request is urgent EY Knowledge can still find reports for you until it arrives.");
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to wait for your account or is your request urgent?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "urgentacrachargecodequestions", null, "Urgent"),
                        
                        builder.CardAction.dialogAction(session, "waitforaccount", null, "Wait")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('sendemail', '/sendemail');

bot.dialog('/urgentacrachargecodequestions', [
    function (session) {
// Urgent
// Send Email
var fromEmail = new helper.Email('' + session.userData.email + '');
var toEmail = new helper.Email('rkeitch@uk.ey.com');
//var toEmail = new helper.Email('darnell.clayton2010@gmail.com');
var subject = 'Knowledge Help Bot Email - Questnet Account Request - Urgent';
var content = new helper.Content('text/plain', 'Email Address - '+ session.userData.email +', Phone Number - ' + session.userData.phonenumber + ', Charge Code - ' + session.userData.chargecode);
var mail = new helper.Mail(fromEmail, subject, toEmail, content);

var sg = require('sendgrid')('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');
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
});

sg.API(request, function (error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});
        session.send("Please provde a few details to help us locate the documents you need while you wait for the vendor to set up your license.");
        session.beginDialog('/acrachargecodequestions');
    }
    
]);
bot.beginDialogAction('urgentacrachargecodequestions', '/urgentacrachargecodequestions');



bot.dialog('/acrachargecodequestions', [
    function (session) {
        //session.send("Good choice! You'll soon be able to access Questnet reports directly.  I just need to collect 3 pieces of info from you to be able to generate a username and password.");
        builder.Prompts.text(session, "Please provide a Singapore/Malaysia charge code.");
    },
    function (session, results) {
   //     session.send("You entered '%s'", results.response);
        session.userData.singmachargecode = results.response;
        builder.Prompts.text(session, "Please specify the ACRA registration/entity number or provide detailed info to help our researcher locate the reports you need.");
    },
    function (session, results) {
    //    session.send("You entered '%s'", results.response);
        session.userData.acraregistration = results.response;
       
        //session.userData.acrachargecode = results.response;
        // Send a receipt with images
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Questnet Account Request")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                       // builder.Fact.create(session, "SR1234567898", "Ticket Number"),
                        builder.Fact.create(session, "" + session.userData.singmachargecode + "", "Charge Code"),
                        builder.Fact.create(session, "" + session.userData.acraregistration + "", " ACRA Registration Number")
                       
                        
                        
                        
                    ])
                  //  .tax("$4.40")
                  //  .total("$48.40")
            ]);
        session.send(msg);
        session.beginDialog('/shouldwesubmit');

        
        
    }

    
    
    
]);
bot.beginDialogAction('acrachargecodequestions', '/acrachargecodequestions');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/shouldwesubmit', [
    
    function (session) {
//        builder.Prompts.choice(session, "What demo would you like to run?", "ticket|prompts|picture|cards|list|carousel|receipt|actions|(quit)");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to submit this information now or re-enter the information?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "acraticketsubmit", null, "Submit"),
                        
                        builder.CardAction.dialogAction(session, "acrachargecodequestions", null, "Re-enter Information")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
    
    
]);
bot.beginDialogAction('shouldwesubmit', '/shouldwesubmit');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/acraticketsubmit', [
    
    
    function (session) {

// ACRA registration/entity number'
// Send Email
var fromEmail = new helper.Email('' + session.userData.email + '');
var toEmail = new helper.Email('rkeitch@uk.ey.com');
//var toEmail = new helper.Email('darnell.clayton2010@gmail.com');
var subject = 'Knowledge Help Bot Email - Questnet Account Request - ACRA registration/entity number';
var content = new helper.Content('text/plain', 'Charge Code - '+ session.userData.singmachargecode +', ACRA Registration Number - ' + session.userData.acraregistration);
var mail = new helper.Mail(fromEmail, subject, toEmail, content);

var sg = require('sendgrid')('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');
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
});


        session.send("These requests are handled Monday-Wednesday 9:00am-3:30pm and Thursday 09:00- 11:30am (Sydney time). If your query is urgent and outside of these times please contact Knowledge Help quoting message ‘urgent-questnet-bot’.");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Have I resolved your issue?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "acrasuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "acrafailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('acraticketsubmit', '/acraticketsubmit');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/acrasuccess', [
    function (session) {
        //session.send("Please note it can take up to 3 days to receive your username and password.  If you don't yet have your own login details and your request is urgent EY Knowledge can still find reports for you until it arrives.");
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('acrasuccess', '/acrasuccess'); 

bot.dialog('/acrafailure', [
    function (session) {
        session.endDialog("I'm sorry I've not been able to help.  You might find our [Questnet user manual]( http://chs.iweb.ey.com/GLOBAL1/CKR/CLDCKR.NSF/646309c4a5106dcc8525710800779429/46fea6ce1b59ac1986257c9300551609?OpenDocument) helpful or your local [Knowledge Help Team](http://chs.ey.net/knowledgehelp) will be happy to assist you.");
    }
]);
bot.beginDialogAction('acrafailure', '/acrafailure'); 

bot.dialog('/acraticketcomplete', [
    function (session) {
//        builder.Prompts.choice(session, "What demo would you like to run?", "ticket|prompts|picture|cards|list|carousel|receipt|actions|(quit)");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("This should not be here - error")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "acraticketcomplete", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "acrachargecodequestions", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('acraticketcomplete', '/acraticketcomplete');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/waitforaccount', [
    
    
    function (session) {

// Wait
// Send Email
var fromEmail = new helper.Email('' + session.userData.email + '');
var toEmail = new helper.Email('rkeitch@uk.ey.com');
//var toEmail = new helper.Email('darnell.clayton2010@gmail.com');
var subject = 'Knowledge Help Bot Email - Questnet Account Request - Wait';
var content = new helper.Content('text/plain', 'Email Address - '+ session.userData.email +', Phone Number' + session.userData.phonenumber + ', Charge Code - ' + session.userData.chargecode);
var mail = new helper.Mail(fromEmail, subject, toEmail, content);

var sg = require('sendgrid')('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');
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
});
        //session.send("These requests are handled by a researcher who is located in Sydney, Monday-Wednesday 9:00am-3:30pm and Thursday before 11:30am if your query is more urgent please contact Knowledge Help quoting message urgent-questnet-bot.");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Have I resolved your issue?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "waitsuccess", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "waitfailure", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('waitforaccount', '/waitforaccount');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/waitsuccess', [
    
    
    function (session) {
        //session.send("These requests are handled by a researcher who is located in Sydney, Monday-Wednesday 9:00am-3:30pm and Thursday before 11:30am if your query is more urgent please contact Knowledge Help quoting message urgent-questnet-bot.");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Great, can I help you with anything else?")
                    
                    .buttons([
                        //builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        builder.CardAction.dialogAction(session, "menu", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "goodbye", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('waitsuccess', '/waitsuccess');   // <-- no 'matches' option means this can only be triggered by a button.



bot.dialog('/waitfailure', [
    function (session) {

        session.endDialog("I'm sorry I've not been able to help.  You might find our [Questnet user manual]( http://chs.iweb.ey.com/GLOBAL1/CKR/CLDCKR.NSF/646309c4a5106dcc8525710800779429/46fea6ce1b59ac1986257c9300551609?OpenDocument) helpful or your local [Knowledge Help Team](http://chs.ey.net/knowledgehelp) will be happy to assist you.");
    }
]);
bot.beginDialogAction('waitfailure', '/waitfailure'); 

bot.dialog('/howtohelp', [
    function (session) {
        session.endDialog("How else can I help you? Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);
bot.beginDialogAction('howtohelp', '/howtohelp'); 


// END Questnet FLOW 

server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));