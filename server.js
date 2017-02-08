const config = require('./config')
const processSMS = require('./processSMS')

function listenSMS() {
  setInterval(function(){
    processSMS.processQueuedSMS()
  }, config.serverConfig.frequency)
}

listenSMS()
