const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const getSignedUrlForView = (key) => {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5 // valid for 5 minutes
  });
};

module.exports = getSignedUrlForView;
