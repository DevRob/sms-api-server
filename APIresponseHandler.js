const config = require('./config')
const db = config.db
var retryCount = config.serverConfig.reSendCap

function getAPIresultCode(body) {
  // returns error code or 0 if no error. Example: body = "ERR -25" => 25
  var pattern = /(-\d+)/
  return pattern.test(body) ? - Number(pattern.exec(body)[0]) : 0
}

function logAPIresponse(id, result) {
  db(config.tables.sms_api_log)
  .insert({
    smsID: id,
    APIresponse: result,
    responseCode: getAPIresultCode(result),
    responseMessage: config.APImessages[getAPIresultCode(result)]
  })
  .then()
}

function handleAPIresponse(id, result) {
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
  }
}

function logSuccess(smsID, result) {
  db(config.tables.sms_queue)
  .where('id', '=', smsID)
  .update({
    delivered: 1
  })
  .then(() => {
    logAPIresponse(smsID, result)
    console.log("SMS sent and logged in DB");
  })
}

function logOnHold(smsID, result) {
  db(config.tables.sms_queue)
  .where('id', '=', smsID)
  .update({
    delivered: 2
  })
  .then(() => {
    logAPIresponse(smsID, result)
    console.log("SMS sending failed and put onhold.", "response: ", result);
  })
}

function retrySend(smsID, result) {
  db(config.tables.sms_api_log)
  .where('smsID', '=', smsID)
  .then((query) => {
    if (query.length < retryCount) {
      logAPIresponse(smsID, result)
      console.log("SMS sending failed, retrying...");
    } else {
      logOnHold(smsID, result)
    }
  })
}

module.exports = {
  handleAPIresponse: handleAPIresponse
}
