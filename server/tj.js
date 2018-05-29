/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const 
    IBMCloudEnv = require('ibm-cloud-env');
    isPi = require('detect-rpi'),
    serviceManager = require('services/service-manager'),
    TJBot = isPi() ? require('tjbot') : require('./fake-tjbot');

var t2s = serviceManager.get("watson_text_to_speech"),
    s2t = serviceManager.get("watson_speech_to_text"),
    assistant = serviceManager.get("watson_assistant"),
    assistantWorkspace = IBMCloudEnv.get("watson_assistant_workspace"),

    // these are the hardware capabilities that TJ needs for this recipe
    hardware = ['microphone', 'speaker', 'servo', 'led'],

    // set up TJBot's configuration
    tjConfig = {
            robot: {
                name: 'TJ',
                gender: 'female'
            },
            log: {
                level: 'verbose'
            }
        },

    credentials = {
            speech_to_text: {
                username: IBMCloudEnv.get("02b3fde9-7635-48f4-99cb-152405904dd3"),
                password: IBMCloudEnv.get("XfkakfcjEosZ")
            },
            text_to_speech: {
                username: IBMCloudEnv.get("a3d2ebe7-9a01-4483-8228-fa123e1ac744"),
                password: IBMCloudEnv.get("LJGecNxe6MQB")
            }
        },

    // the call word to tell TJ to wake up. Added a bunch of things that sounds like TJ
    tjCalls = [
            "Watson"
        ],

    // things I might say before the call word
    tjVariances = [
            "Hey",
            "Okay",
            "Ms"
        ],

    // why does TJ feel that way
    reasonsFor = {
            sad: [
                "I feel lonely",
                "I have no energy",
                "I feel I can't do anything right"
            ],
            happy: [
                "I feel I can take on the world!",
                "All I want to do is dance!"
            ]
        },

    // instantiate our TJBot!
    tj = new TJBot(hardware, tjConfig, credentials);


// listen for utterances with our attentionWord and send the result to
// the Conversation service
tj.listen(function(rawMsg) {

    // check to see if they are talking to TJBot
    var msg = rawMsg.toLowerCase(),
        startsWithVariance='',
        startsWithCall=null,
        turn;

    tjVariances.forEach((variance) => {
        if (msg.startsWith(variance.toLowerCase())) {
            startsWithVariance=variance+' ';
        }
    })
    tjCalls.forEach((call) => {
        if (msg.startsWith((startsWithVariance+call).toLowerCase())) {
            startsWithCall=call;
        }
    });

    console.log("Call:" + startsWithVariance.replace(/(\w+) /, ' ($1)'), startsWithCall);

    if (startsWithCall) {
        // remove our name from the message
        var turn = msg.replace((startsWithVariance+startsWithCall).toLowerCase(), "");

        console.log("Turn =" + turn);

        // send to the conversation service
        tj.converse(WORKSPACEID, turn, function(response) {

	    console.log(JSON.stringify(response)); 
	    // speak the result
            tj.speak(response.description);
        });
    }

});





