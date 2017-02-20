const config = require('./config')
const db = config.db
const smsQueue = config.tables.sms_queue
const smsAPILog = config.tables.sms_api_log
var retryCount = config.serverConfig.reSendCap

exports.handleAPIresponse = function(id, result) {
  var responseCode = getAPIresultCode(result)

  switch(responseCode) {
    case 0:
      logSuccess(smsID, result)
      // @TODO: Success msg to user
      break
    case 5:
    case 10:
    case 15:
    case 25:
      logOnHold(smsID, result)
      // ERR 5 @TODO: Top-up msg to Admin
      // ERR 10 @TODO: Check Setup details msg to Admin
      // ERR 15 @TODO: Check destination msg to user
      // ERR 25 @TODO: Check parameters
      break
    case 20:
      retrySend(smsID, result)
      // ERR 20 @TODO: Retry and send System ERR msg to
      // user after number of retry set in config file.
      break
    default:
      logOnHold(smsID, "ERR -999 Unexpected Error.")
      console.log("Unexpected Error. Please contact Administrator.")
      // ERR 999 @TODO: Unexpected error msg to user.
  }
}

function getAPIresultCode(body) {
  // returns error code or 0 if no error. Example: body = "ERR -25" => 25
  var errPattern = /(-\d+)/
  var okPattern = /(OK \d+)/
  return errPattern.test(body) ? - Number(errPattern.exec(body)[0]) : okPattern.test(body) ? 0 : 999
}

function logAPIresponse(id, result) {
  db(smsAPILog)
  .insert({
    smsID: id,
    APIresponse: String(result).replace(/^\s+|\s+$/g, ''),
    responseCode: getAPIresultCode(result),
    responseMessage: config.APImessages[getAPIresultCode(result)]
  })
  .then()
  .catch(function(e) {
    console.error(e)
  })
}

function logSuccess(smsID, result) {
  db(smsQueue)
  .where('id', '=', smsID)
  .update({
    status: 1
  })
  .then(() => {
    logAPIresponse(smsID, result)
    console.log("SMS sent and logged in DB")
  })
  .catch(function(e) {
    console.error(e)
  })
}

function logOnHold(smsID, result) {
  db(smsQueue)
  .where('id', '=', smsID)
  .update({
    status: 2
  })
  .then(() => {
    logAPIresponse(smsID, result)
    console.log("SMS sending failed and put onhold.", "response: ", result)
  })
  .catch(function(e) {
    console.error(e)
  })
}

// function logResult(smsID, result) {
//   var messages = {
//     0: "SMS sent and logged in DB",
//     1: "SMS sending failed and put onhold. Response: " + result
//   }
//   var responseCode = getAPIresultCode(result)
//   var statusCode = responseCode == 0 ? 1 : 2
//
//   db(smsQueue)
//   .where('id', '=', smsID)
//   .update({
//     status: statusCode
//   })
//   .then(() => {
//     logAPIresponse(smsID, result)
//     console.log(serverMessage[statusCode])
//   })
//   .catch(function(e) {
//     console.error(e)
//   })
// }

function retrySend(smsID, result) {
  db(smsAPILog)
  .where('smsID', '=', smsID)
  .then((query) => {
    if (query.length < retryCount) {
      logAPIresponse(smsID, result)
      console.log("SMS sending failed, retrying...")
    } else {
      logOnHold(smsID, result)
    }
  })
  .catch(function(e) {
    console.error(e)
  })
}
