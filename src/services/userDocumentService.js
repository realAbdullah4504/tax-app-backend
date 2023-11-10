const UserDocuments = require('../models/userDocumentsModel');
const AWS = require('aws-sdk');
const {
  BUCKET_NAME,
  DIRECTORY_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
} = require('../../config/vars');
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});
const s3 = new AWS.S3();

const userDocumentService = {

  async userUploadDocument(req, res) {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadPromises = files.map((file, index) => {
      const params = {
        Bucket: `${BUCKET_NAME}/${DIRECTORY_NAME}${req?.user?._id}`,
        Key: file.originalname,
        Body: file.buffer,
      };
      const payload = {
        name: file.originalname,
        description: req.body.description[index],
      };

      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      })
        .then(() => {
          // Add file details to the user's documents
          return UserDocuments.findOneAndUpdate(
            { userId: req.user._id },
            { $addToSet: { filesDetail: payload } },
            { new: true, upsert: true }
          );
        })
        .catch((err) => {
          console.error(err);
          return null; // You can handle errors as needed
        });
    });

    Promise.all(uploadPromises)
      .then(() => {
        res.status(200).json({ stateCode: 200, message: 'Files uploaded successfully' });
      })
      .catch((err) => {
        res.status(500).json({ stateCode: 500, message: 'Error uploading files' });
      });
  },
  async getUserFileByName(res, filename) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${DIRECTORY_NAME}/` + filename,
      };
      s3.getObject(params)
        .createReadStream()
        .on('error', (err) => {
          console.error('Error downloading file from S3:', err);
          res.status(500).send('Error downloading file');
        })
        .pipe(res);
    } catch (error) {
      throw error;
    }
  },
  async getUserFiles(userId) {
    try {
      const userDocuments = await UserDocuments.findOne({ userId });
      if (!userDocuments) {
        return res.status(404).json({ error: 'User file not found' });
      }
      // Get the list of filenames from the user's document
      // const fileNames = userFile.fileName;
      // const objectKeys = fileNames.map((item) => `${prefix}${item?.name}`);
      // console.log(objectKeys);

      // const params = {
      //   Bucket: bucketName,
      //   Prefix: prefix,
      // };

      // s3.listObjects(params, function (err, data) {
      //   if (err) {
      //     return res
      //       .status(500)
      //       .json({ error: "Error listing objects in S3 bucket" });
      //   } else {
      //     console.log(data.Contents);
      //     const objectURLs = data.Contents.filter((obj) =>
      //       objectKeys.includes(obj.Key)
      //     ).map((obj) => {
      //       const s3URL = `https://${bucketName}.s3.amazonaws.com/${obj.Key}`;
      //       return s3URL;
      //     });
      //     // res.status(200).json({ userId: req.user._id, objectURLs });
      //   }
      // });
      return userDocuments?.filesDetail || [];
    } catch (error) {
      throw error;
    }
  },
  async deleteFile(res, objectKey, userId) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${DIRECTORY_NAME}${userId}/${objectKey}`,
      };
      s3.deleteObject(params, async(err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error deleting file');
        }
        res.status(200).json({ stateCode: 200, message: 'File deleted successfully' });
      });
    } catch (error) {
      throw error;
    }
  },
};

module.exports = userDocumentService;
