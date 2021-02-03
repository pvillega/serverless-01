'use strict';

const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

const resizer = require('./resizer');
const imageMetadataManager = require('./imageMetadataManager');

module.exports.executeStepFunction = async (event) => {
  const stateMachineName = 'ImageProcessingMachine'; // The name of the step function we defined in the serverless.yml

  console.log('Fetching the list of available workflows');

  stepfunctions
    .listStateMachines({})
    .promise()
    .then(listStateMachines => {
      console.log('Searching for the step function');

      for (var i = 0; i < listStateMachines.stateMachines.length; i++) {
        const item = listStateMachines.stateMachines[i];

        if (item.name.indexOf(stateMachineName) >= 0) {
          console.log('Found the step function');

          // The event data contains the information of the s3 bucket and the key of the object
          const eventData = event.Records[0];

          var params = {
            stateMachineArn: item.stateMachineArn,
            input: JSON.stringify({ objectKey: eventData.s3.object.key, bucketName: eventData.s3.bucket.name })
          };

          console.log('Start execution');
          stepfunctions.startExecution(params).promise().then(() => {
            return context.succeed('OK');
          });
        }
      }
    })
    .catch(error => {
      return context.fail(error);
    });
};


module.exports.resizer = async (event) => {
  console.log(event);

  const bucket = event.bucketName;
  const key = event.objectKey;
  console.log(`A file named ${key} was put in a bucket ${bucket}`);

  resizer
    .resize(bucket, key)
    .then(() => {
      console.log(`The thumbnail was created`);
      return { message: 'The thumbnail was created' };
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

module.exports.saveImageMetadata = async (event) => {
  console.log(event);

  const bucket = event.bucketName;
  const key = event.objectKey;

  console.log('saveImageMetadata was called');

  imageMetadataManager
    .saveImageMetadata(bucket, key, false)
    .then(() => {
      console.log('Save image metadata was completed');
      return null;
    })
    .catch(error => {
      console.log(error);
      return null;
    });
};

module.exports.blackAndWhiteCrop = async (event) => {
  console.log(event);

  const bucket = event.bucketName;
  const key = event.objectKey;

  resizer
    .blackAndWhiteCrop(bucket, key)
    .then(url => {
      console.log('The thumbnail was created');
      return { message: 'The thumbnail was created' };
    })
    .catch(error => {
      console.log(error);
      return { message: `There was an error: ${error}` };
    });
};

module.exports.thumbnails = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  console.log(bucket);
  console.log(key);

  imageMetadataManager
    .saveImageMetadata(bucket, key, true)
    .then(() => {
      console.log('Save thumbnail metadata was completed');
      return null;
    })
    .catch(error => {
      console.log(error);
      return null;
    });
};
