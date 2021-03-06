const isPi = require('detect-rpi');
if (!isPi()) {
	require('appmetrics-dash').attach();
	require('appmetrics-prometheus').attach();
}

const appName = require('./../package').name;
const express = require('express');
const log4js = require('log4js');
const localConfig = require('./config/local.json');

const logger = log4js.getLogger(appName);
const app = express();
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routers/index')(app);

// Add your code here

if (isPi()) {
	require('./tj');
}

const port = process.env.PORT || localConfig.port;
app.listen(port, function(){
  logger.info(`maketjdance listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`maketjdance listening on http://localhost:${port}/asktj`);
  logger.info(`maketjdance listening on http://localhost:${port}`);
});


