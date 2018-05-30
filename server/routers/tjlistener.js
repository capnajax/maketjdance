const
	assistant = require('../assistant'),
	express = require('express'),
	_ = require('lodash');

module.exports = function(app){
  var router = express.Router();

  router.get('/', function (req, res, next) {
  	console.log("req.query ==", req.query);
  	assistant.assist(req.query.q, (err, response) => {
  		if (_.isString(response) && _.isNil(response.speak)) {
	  		!err && res.json(response);
  		} else {
	  		!err && res.json(response.speak);
  		}
  	})
  });

  app.use("/asktj", router);
}
