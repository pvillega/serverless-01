'use strict';

module.exports.hello = async (event) => {
  const done = (err, res) => {
    return {
      statusCode: err ? '400' : '200',
      body: err ? err.message : res,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  };

  switch (event.httpMethod) {
    case 'GET':
      console.log('GET method was called');
      done(null, 'GET method was called');
      break;
    default:
      console.log('Other http method was called - unsupported method');
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(
  //     {
  //       message: 'Go Serverless v1.0! Your function executed successfully!',
  //       input: event,
  //     },
  //     null,
  //     2
  //   ),
  // };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
