var IBMCloudEnv = require('ibm-cloud-env');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');

module.exports = function(app, serviceManager){
	var obj = {
        url: IBMCloudEnv.getString('watson_assistant_url'),
        username: IBMCloudEnv.getString('watson_assistant_username'),
        password: IBMCloudEnv.getString('watson_assistant_password'),
        version: '2017-05-26'
    }
    console.log(obj);
    var assistant = new AssistantV1(obj);
    serviceManager.set("watson_assistant", assistant);
};

