const request = require('request');
const config = require('./config')
const APIresponseHandler = require('./APIresponseHandler')
const db = config.db
const smsQueue = config.tables.sms_queue
var msgDetails = {
  baseurl: config.clxAPIconfig.baseurl,
  username: config.clxAPIconfig.username,
  password: config.clxAPIconfig.password,
  destinationAddress: 0,
  sourceAddress: 0,
  messageBody: ""
}

exports.processQueuedSMS = function() {
  var destination = "",
      sender = "",
      body = ""

  db(smsQueue)
  .where("status", 0)
  .then((smsListQuery) => {
    for (var smsidx in smsListQuery) {
      smsID =  smsListQuery[smsidx].id
      destination = smsListQuery[smsidx].destinationAddress
      sender = smsListQuery[smsidx].sourceAddress
      body = smsListQuery[smsidx].messageBody

      sendSMS(smsID, destination, sender, body)
    }
  })
  .catch(function(err) {
    console.error(err)
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

function buildURL(msgDetails) {
  var url = msgDetails.baseurl +
    "&UN=" + msgDetails.username +
    "&P=" + msgDetails.password +
    "&DA=" + msgDetails.destinationAddress +
    "&SA=" + msgDetails.sourceAddress +
    "&M=" + msgDetails.messageBody
  return url
}
