const { DEVELOPMENT, PRODUCTION, APPLICATION_NAME } = require("./src/types");

const currentEnv = (process.argv.indexOf("--dev") >= 0) ? DEVELOPMENT : PRODUCTION; 

if(currentEnv === DEVELOPMENT){
    const ecosystemFile = require('../ecosystem.config')
    const currentApp = ecosystemFile && ecosystemFile.apps.filter(app => app.name == APPLICATION_NAME);
    for (const p in currentApp[0].env_development) {
        process.env[p] = currentApp[0].env_development[p]
    }
}

const telegramBot = require('./src/bot')

telegramBot.start_bot()