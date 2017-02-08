const knex = require('knex')

config = {
  db : knex({
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "node",
      password: "node" ,
      database: "horizon_ezliving_po"
    }
  }),

  tables : {
    sms_queue: "system_sms_log",
    sms_api_log: "system_sms_api_response_log"
  },

  clxAPIconfig : {
    baseurl: "http://sms1.mblox.com:9001/HTTPSMS?S=H",
    username: "goodsidebu1",
    password: "12345" // pwd: tAgCob2i
  },

  serverConfig : {
    frequency: 5000, // Check DataBase for newly queued SMS. (in milisec)
    reSendCap: 5 // Limits the system to retry sending the same SMS to the number of times specified here.
  },

  APImessages : {
    0: "Success",
    5: "Insufficient credit",
    10: "Invalid username or password",
    15: "Invalid destination or destination not covered",
    20: "System error, please retry",
    25: "Bad request; check parameters",
    30: "Throughput exceeded"
  }
}

module.exports = config
