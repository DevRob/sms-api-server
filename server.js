const config = require('./config')
const processSMS = require('./processSMS')
var frequency = config.serverConfig.frequency

function listenSMS() {
  setInterval(function(){
    processSMS.processQueuedSMS()
  }, frequency)
}

listenSMS()
