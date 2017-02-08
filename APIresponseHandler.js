const config = require('./config')
const db = config.db

function APIresultCode(body) {
  // returns error code or 0 if no error. Example: body = "ERR -25" => 25
  var pattern = /(-\d+)/
  return pattern.test(body) ? - Number(pattern.exec(body)[0]) : 0
}

function logAPIresponse(id, result) {
  db('system_sms_api_response_log')
  .insert({
    smsID: id,
    APIresponse: result,
    responseCode: APIresultCode(result),
    responseMessage: config.APImessages[APIresultCode(result)]
  })
  .then()
}

function handleAPIresponse(id, result) {
  var responseCode = APIresultCode(result)

  switch(responseCode) {
    case 0:
      logSuccess(smsID) // @TODO: Success msg to user
      break
    case 5:
      // logOnHold(smsID, result)
      SMSretrySend(smsID, result)
      // @TODO: Top-up msg to Admin
      break
    case 10:
      SMSretrySend(smsID, result)
      // @TODO: Check Setup details msg to Admin
      break
    case 15:
      SMSretrySend(smsID, result)
      // @TODO: Check destination msg to user
      break
    case 20:
      SMSretrySend(smsID, result)
      // @TODO: Retry and send System ERR msg to user after ?10 retry
      break
    case 25:
      SMSretrySend(smsID, result)
      // @TODO: Check parameters
      break
    default:
        console.log("unexpected result Please contact Administrator")
  }
}

function logSuccess(smsID) {
  db(config.tables.sms_queue)
  .where('id', '=', smsID)
  .update({
    delivered: 1
  })
  .then(() => {
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
    console.log("SMS sending failed and put onhold", "err: ", result);
  })
}

function SMSretrySend(smsID, result) {
  db(config.tables.sms_api_log)
  .where('smsID', '=', smsID)
  .then((query) => {
    if (query.length < 3) {
      console.log("SMS sending failed, retrying");
    } else {
      logOnHold(smsID, result)
    }
  })
}

module.exports = {
  handleAPIresponse: handleAPIresponse,
  logAPIresponse: logAPIresponse
}
