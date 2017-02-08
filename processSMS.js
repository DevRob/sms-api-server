const request = require('request');
const config = require('./config')
const APIresponseHandler = require('./APIresponseHandler')
const db = config.db

var msgDetails = {
  baseurl: config.clxAPIconfig.baseurl,
  username: config.clxAPIconfig.username,
  password: config.clxAPIconfig.password,
  destinationAddress: 0,
  sourceAddress: 0,
  messageBody: ""
}

function buildURL(msgDetails) {
  var url = msgDetails.baseurl +
    "&UN=" + msgDetails.username +
    "&P=" + msgDetails.password +
    "&DA=" + msgDetails.destinationAddress +
    "&SA=" + msgDetails.sourceAddress +
    "&M=" + msgDetails.messageBody
  return url
}

function processQueuedSMS() {
  var destination = "",
      sender = "",
      body = ""

  db(config.tables.sms_queue)
  .where("delivered", 0)
  .then((smsListQuery) => {
    for (var smsidx in smsListQuery) {
      smsID =  smsListQuery[smsidx].id
      destination = smsListQuery[smsidx].destinationAddress
      sender = smsListQuery[smsidx].sourceAddress
      body = smsListQuery[smsidx].messageBody

      sendSMS(smsID, destination, sender, body)
    }
  })
}

function sendSMS(id, destination, sender, SMSbody) {
  msgDetails.destinationAddress = destination
  msgDetails.sourceAddress = sender
  msgDetails.messageBody = SMSbody

  request.get(buildURL(msgDetails), (err, res, body) => {
    APIresponseHandler.handleAPIresponse(id, body)
  })
}

module.exports = { processQueuedSMS: processQueuedSMS }
