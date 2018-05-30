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
    TJBot = require('tjbot'),
    _ = require('lodash');

var assistantWorkspace = IBMCloudEnv.getString("watson_assistant_workspace"),

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
            },
            speak: {
                speakerDeviceId: "bluealsa:HCI=hci0,DEV=8C:85:80:00:4D:E1,PROFILE=a2dp"
            }
        },

    credentials = {
            speech_to_text: {
                username: IBMCloudEnv.getString("watson_speech_to_text_username"),
                password: IBMCloudEnv.getString("watson_speech_to_text_password")
            },
            text_to_speech: {
                username: IBMCloudEnv.getString("watson_text_to_speech_username"),
                password: IBMCloudEnv.getString("watson_text_to_speech_password")
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

    moves = {

        sigh: [
                {time:   0, servo: 20, led: "#000020"},
                {time: 250, servo: 15               },
                {time: 500, servo: 5, led: "#200010"},
                {time: 999, servo: 0, led: "#180000"}
            ]
    }

console.log(credentials)

// instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, credentials);

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
        assistant.assist(turn, (err, response) => {
            if (!err) {
                console.log(JSON.stringify(response)); 
                // speak the result
                if (_.has(response, "speak")) {
                    tj.speak(response.speak);
                }

                if (_.has(response, "movement") && _.has(moves, response.movement)) {

                    moves[response.movement].forEach((move) => {
                        setTimeout(() => {
                            if(_.has(move.servo)) {
                                tj._motor.servoWrite(
                                        (tj._SERVO_ARM_DOWN - tj._SERVO_ARM_BACK)*move.servo/100 + 
                                        tj._SERVO_ARM_BACK);
                            }
                            if(_.has(move.led)) {
                                tj.shine(move.led)
                            }
                        }, move.time);
                    });

                }


            }
        });
    }
});






