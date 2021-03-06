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
            "Ms",
            "The"
        ],

    moves = {

        sigh: [
                {time:   0, servo: 30, led: "#000020"},
                {time: 250, servo: 25                },
                {time: 500, servo: 15, led: "#200010"},
                {time: 999, servo: 10, led: "#180000"}
            ],

        sulk: [
                {time:   0, servo: 30, led: "#000020"},
                {time: 250, servo: 25                },
                {time: 500, servo: 15, led: "#200010"},
                {time: 999, servo: 10, led: "#180000"}
            ],

        upbeat: [
                {time:   0, servo: 70, led: "#000020"},
                {time: 250, servo: 60                },
                {time: 500, servo: 55, led: "#006010"},
                {time: 999, servo: 90, led: "#486020"}
            ],

        dance: [
                {time:    0, servo: 100, led: "#FF0000"},
                {time:  100, servo: 100, led: "#200000"},
                {time:  200, servo:  70, led: "#0000FF"},
                {time:  300, servo:  70, led: "#000020"},
                {time:  400, servo: 100, led: "#00FF00"},
                {time:  500, servo: 100, led: "#002000"},
                {time:  600, servo:  40, led: "#0000FF"},
                {time:  700, servo:  40, led: "#000020"},
                {repeat:  800},
                {repeat:  1600},
                {repeat:  2400},
                {repeat:  3200},
                {repeat:  4000},
                {repeat:  4800},
                {repeat:  5600},
                {repeat:  6400},
                {time:  7200, servo:  100, led: "#000040"}
            ]
    };

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

                console.log("ASSISTANT RESPONSE: ", JSON.stringify(response)); 

                // speak the result
                if (_.has(response, "speak")) {

                    console.log();
                    console.log();
                    console.log( response.speak );
                    console.log();
                    console.log();

                    tj.speak(response.speak);
                }

                if (_.has(response, "movement")) {

                    if (_.has(moves, response.movement)) {
                        moves[response.movement].forEach((move) => {

                            if (_.has(move, "repeat")) {

                                moves[response.movement].forEach((repeatMove) => {
                                    if (move.repeat > repeatMove.time) {
                                        setTimeout(() => {makeMove(repeatMove)}, move.repeat + repeatMove.time)
                                    }
                                });

                            }
                            setTimeout(() => {makeMove(move)}, move.time);

                        });

                    }
                }
            }
        });
    }
});

function makeMove(move) {
    var servo;
    if(_.has(move, "servo")) {
        servo = (tj._SERVO_ARM_DOWN - tj._SERVO_ARM_BACK)*(100-move.servo)/100 + 
                tj._SERVO_ARM_BACK;
        tj._motor.servoWrite(servo);
    }
    if(_.has(move, "led")) {
        tj.shine(move.led);
    }

}






