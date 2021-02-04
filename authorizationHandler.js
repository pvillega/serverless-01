'use strict';

const authorizer = require('./authorizer');

module.exports.generateToken = async (event) => {
  try {
    authorizer
      .generateToken(JSON.parse(event.body || {}))
      .then(token => {
        sendResponse(200, { token });
      })
      .catch(error => {
        sendResponse(401, { error: error.message });
      });
  } catch (error) {
    sendResponse(401, { error: error.message });
  }
};

module.exports.authorize = async (event) => {
  try {
    authorizer
      .generatePolicy(event.authorizationToken, event.methodArn)
      .then(policy => {
        return policy;
      })
      .catch(error => {
        return error.message;
      });
  } catch (error) {
    return error.message;
  }
};

module.exports.createApplication = async (event) => {
  authorizer
    .createApplication(JSON.parse(event.body))
    .then(() => {
      sendResponse(200, { message: 'Application created' });
    })
    .catch(error => {
      sendResponse(500, { message: 'There was a problem creating the application' });
    });
};

function sendResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
  return response;
}
