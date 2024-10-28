// src/utils/aws.js

import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION,
});

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET;

// Function to upload a file to S3
async function uploadImage(file, fileName) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: S3_BUCKET,
    Key: fileName, // Name of the file in S3
    Body: file,
    ACL: 'public-read', // Optional, makes the file publicly accessible
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export { uploadImage };
