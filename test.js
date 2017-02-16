const config = require('./config')
const db = config.db
const smsQueue = config.tables.sms_queue
const smsAPILog = config.tables.sms_api_log

function testDatabaseConnect(callback) {
  var errors = 0
  console.log("Testing database connection.")
  db(smsQueue)
  .where("status", 2)
  .then((onhold) => {
    console.log("SMS request on hold: ", onhold.length)
  })
  .catch(function(e) {
    errors += 1
    console.error(e)
  })

  db(smsAPILog)
  .where("responseCode", 0)
  .then((APIresponse) => {
    console.log("Successful API request logged in database: ", APIresponse.length)
  })
  .catch(function(e) {
    errors += 1
    console.error(e)
  })
  .then(() => {
    if (errors != 0) {
      console.log("Database check failed with", errors, "errors")
      process.exit()
    } else {
      console.log("Database connection success.")
      callback()
    }
  })
}

module.exports = { testDatabaseConnect: testDatabaseConnect }
