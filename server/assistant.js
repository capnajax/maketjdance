
const 
    IBMCloudEnv = require('ibm-cloud-env'),
    serviceManager = require('./services/service-manager'),
    _ = require('lodash');

var assistant = serviceManager.get("watson_assistant"),
    assistantWorkspace = IBMCloudEnv.getString("watson_assistant_workspace"),

    express = {
    	sad: [ "Ho hum", "&lt;sigh&gt;" ],
    	happy: [ "Hey-yo", "Cheerio", "Good day", "Ahoy me swabbie" ]
    }

    // why does TJ feel that way
    reasonsFor = {
            sad: [
                "I feel lonely",
                "I feel empty",
                "I have no energy",
                "I feel I can't do anything right"
            ],
            happy: [
                "I feel I can take on the world!",
                "All I want to do is dance!"
            ]
        },

    dance = {
    		sad: [
    			"I'm not feeling it right now",
    			"I'd rather sit in the corner right now",
    			"Don't make me do this"
    		],
    		happy: [
    			"Yay!",
    			"Let's party!"
    		]
    },

    movement = {
    	"express_emotion" : { sad: "sigh", happy: "upbeat" },
    	"dance" : { sad: "sulk", happy: "dance" },
    },

    feeling = "sad";

module.exports = {
	assist: (text, cb) => {

		console.log("assisting: ", text);

		assistant.message({
			workspace_id: assistantWorkspace,
			input: {text: text}
		}, function(err, response) {

			console.log("assist: err == ", err)
			console.log("assist: response == ", response)

			var intent;

			if (err) {
				cb && cb(err);
			} else {

				intent = _.first(response.intents).intent;

				switch(intent) {
				case 'express_emotion':
					cb && cb(null, {speak: _.sample(express[feeling]), movement: movement[intent][feeling]});
					break;
				case 'explain_emotion':
					cb && cb(null, {speak: _.sample(reasonsFor[feeling])});
					break;
				case 'dance':
					cb && cb(null, {speak: _.sample(dance[feeling]), movement: movement[intent][feeling]});
					break;
				default:
					cb && cb(null, response);
					break;
				}
			}
		});

	}
};

