/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

var locationDialog = require('botbuilder-location');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
 * Bot Storage: This is a great spot to register the private state storage for your bot. 
 * We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
 * For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
 * ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({
    gzipData: false
}, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

bot.library(locationDialog.createLibrary("ApbDWJWdHssZ-yan10VKU-7-x4H5l_rt6T1acHGsl2O9Kadmxi6wLh812jb2LV1n"));
// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 


// bot.dialog('SearchHotels', [
//     function (session, args, next) {
//         session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

//         // try extracting entities
//         var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Ciudades');
//         var airportEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'AirportCode');
//         if (cityEntity) {
//             // city entity detected, continue to next step
//             session.dialogData.searchType = 'city';
//             next({
//                 response: cityEntity.entity
//             });
//         } else if (airportEntity) {
//             // airport entity detected, continue to next step
//             session.dialogData.searchType = 'airport';
//             next({
//                 response: airportEntity.entity
//             });
//         } else {
//             // no entities detected, ask user for a destination
//             builder.Prompts.text(session, 'Please enter your destination');
//         }
//     },
//     function (session, results) {
//         var destination = results.response;

//         var message = 'Looking for hotels';
//         if (session.dialogData.searchType === 'airport') {
//             message += ' near %s airport...';
//         } else {
//             message += ' in %s...';
//         }

//         session.send(message, destination);

//         // Async search
//         Store
//             .searchHotels(destination)
//             .then(function (hotels) {
//                 // args
//                 session.send('I found %d hotels:', hotels.length);

//                 var message = new builder.Message()
//                     .attachmentLayout(builder.AttachmentLayout.carousel)
//                     .attachments(hotels.map(hotelAsAttachment));

//                 session.send(message);

//                 // End
//                 session.endDialog();
//             });
//     }
// ]).triggerAction({
//     matches: 'Solicitud',
//     onInterrupted: function (session) {
//         session.send('Please provide a destination');
//     }
// });


bot.dialog('GreetingDialog',
    (session) => {
        session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Saludo'
})

bot.dialog('HelpDialog',
    (session, args, next) => {
        session.send('You reached the Request intent. You said \'%s\'.', session.message.text);
        var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Ciudades');
        var specialEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Especialidades');
        var dateEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.datetimeV2.date');
        var timeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.datetimeV2.time');

        

        // var options = {
        //     prompt: "Where should I ship your order? Type or say an address.",
        //     //useNativeControl: true,
        //     //reverseGeocode: true
        // };
        // locationDialog.getLocation(session, options);


        //session.endDialog();
    },
    function (session, results) {
        if (results.response) {
            var place = results.response;
            var formattedAddress =
                session.send("Thanks, I will ship to " + getFormattedAddressFromPlace(place, ", "));
        }
    }
).triggerAction({
    matches: 'Solicitud'
});

// bot.dialog('CancelDialog',
//     (session) => {
//         session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
//         session.endDialog();
//     }
// ).triggerAction({
//     matches: 'Cancel'
// })