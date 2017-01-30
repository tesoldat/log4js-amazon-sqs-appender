'use strict'

var AWS = require("aws-sdk");
var Log4Js = require('log4js');

function sqsAppender(config) {
  /*config = {
    apiVersion:       apiVersion,
    endpoint:         endpoint,
    accessKeyId:      accessKeyId,
    secretAccessKey:  secretAccessKey,
    region:           region,

    QueueUrl:         QueueUrl,
    successLogFlag:   flag
  }*/

  if (!config || !config.QueueUrl) {
    throw new Error('serUrl is missing. Cannot connect to amazon SQS.');
  }
  this.QueueUrl = config.QueueUrl;
  this.client = new AWS.SQS(config);
  this.logSuccess = config.successLogFlag;
  var layout = config.layout || Log4Js.layouts.messagePassThroughLayout;

  function send(msg) {
    var self = this;
    var params = {
      DelaySeconds: 10,
      MessageBody: msg,
      QueueUrl: self.QueueUrl
    };
    self.client.sendMessage(params, function(err, data) {
      if (err) {
        console.error(err, err.stack); // an error occurred
      } else if (this.logSuccess) {
        console.log(data); // successful response
      }
    });
  };

  return function(loggingEvent) {
    var result = layout(loggingEvent);

    // save in db
    send(result);
  };
}

function configure(config) {

  var layout;

  if (config.layout) {
    layout = Log4Js.layouts.layout(config.layout.type, config.layout);
  }
  return sqsAppender(config, layout);
}

module.exports.name = "log4js-amazon-sqs-appender";
module.exports.appender = sqsAppender;
module.exports.configure = configure;
