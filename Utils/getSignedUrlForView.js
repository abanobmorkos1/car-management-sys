const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const getSignedUrlForView = (key) => {
  const isVideo = key.endsWith('.mp4');

  return s3.getSignedUrlPromise('getObject', {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 60 * 60 * 24, // 24 hours
    ...(isVideo && { ResponseContentType: 'video/mp4' }) // Force correct content-type for videos
  });
};

module.exports = getSignedUrlForView;
