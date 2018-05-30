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
    assistant = require('./assistant'),
    IBMCloudEnv = require('ibm-cloud-env'),
    serviceManager = require('./services/service-manager'),
    TJBot = require('tjbot');

var t2s = serviceManager.get("watson_text_to_speech"),
    s2t = serviceManager.get("watson_speech_to_text"),
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
                username: IBMCloudEnv.get(watson_speech_to_text_username),
                password: IBMCloudEnv.get(watson_speech_to_text_password)
            },
            text_to_speech: {
                username: IBMCloudEnv.get(watson_text_to_speech_username),
                password: IBMCloudEnv.get(watson_text_to_speech_password)
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


        // send to the conversation service
        assistant.assist(turn);


	    console.log(JSON.stringify(response)); 
	    // speak the result
        tj.speak(response.speak);
    }

});





