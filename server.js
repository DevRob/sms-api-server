const config = require('./config')
const test = require('./test');
const processSMS = require('./processSMS')
var frequency = config.serverConfig.frequency

function listenSMS(isError) {
  if (isError) {
    // console.log("SMS service is stopped.")
  } else {
  //  console.log("SMS service is running.")
    setInterval(function(){
      processSMS.processQueuedSMS()
    }, frequency)
  }
}

listenSMS(test.testDatabaseConnect())
