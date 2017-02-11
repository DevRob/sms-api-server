const config = require('./config')
const test = require('./test');
const processSMS = require('./processSMS')
var frequency = config.serverConfig.frequency

function listenSMS() {
  console.log("SMS service is running.")
  setInterval(function(){
    processSMS.processQueuedSMS()
  }, frequency)
}

test.testDatabaseConnect(listenSMS)
