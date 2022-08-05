
import aws from 'aws-sdk';
import fs from "fs"
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET } from "../../Config"

// @AWS-CONFIG
var credentials = {
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
};

aws.config.update({
  // @ts-ignore
  credentials: credentials,
  region: AWS_REGION
});

const s3 = new aws.S3();

/* 
* Note:- For better way we can add more folder in any specific user Account. Just support we have a record and we are creating Blog Project then we can create flow like that
const userData = {
  _id:"3144dd484d6a5d789d4as5d",
  name:"Test User",
  profile_imgImage:"profile_imgImage/filekey",
  BlogImage:"blogimage/filekey",
  FeaturedImages:"featuresimg/filekey",
  Document:"Doc/filekey"
}
So our data after insertion looklike this and we have to find all in specific user folder and we have create 
user_id/profile_imgImage/key
user_id/BlogImage/key
user_id/FeaturedImages/key
user_id/Document/key
so its better to find user record and better to remove if any record need to remove.
and when we are removing any user we have to remove whole folder of the user 
 */

const AWSUpload = {
  async uploadFile(folder, file) {

    // @ts-ignore
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
      Bucket: AWS_BUCKET + folder,
      Body: fileStream,
      // @ts-ignore
      Key: file.filename,
    };

    return s3.upload(uploadParams).promise();
  },

  // @Service: Read File In Bucket
  async getFile(fileKey) {
    const downloadParmas = {
      Key: fileKey,
      Bucket: AWS_BUCKET,
    };
    // @ts-ignore
    return s3.getObject(downloadParmas).createReadStream();
  },


  // @Service : GetSignedURL
  async getSignedUrl(fileKey) {
    // console.log(fileKey)
    const signedUrlExpireSeconds = 18000;
    try {
      const url = s3.getSignedUrl("getObject", {
        Bucket: AWS_BUCKET,
        Key: `profile/${fileKey}`,
        Expires: signedUrlExpireSeconds,
      });
      return url;
    } catch (headErr) {
      console.log(headErr);
      if (headErr.code === "NotFound") {
        return false;
      }
    }
  },

  // @Service: Remove Object/Folder Inside Bucket

  // async removeFolder(bucketName: any, folderName: any) {
  //     const listParams = {
  //         Bucket: bucketName,
  //         Prefix: `${folderName}/`,
  //     };
  //     console.log(bucketName, `${folderName}/`);
  //     const listedObjects = await s3.listObjectsV2(listParams).promise();

  //     // @ts-ignore
  //     if (listedObjects.Contents.length === 0) return;

  //     const deleteParams = {
  //         Bucket: bucketName,
  //         Delete: { Objects: [] },
  //     };

  //     // @ts-ignore
  //     listedObjects.Contents.forEach(({ Key }) => {
  //         // @ts-ignore
  //         deleteParams.Delete.Objects.push({ Key });
  //     });

  //     await s3.deleteObjects(deleteParams).promise();

  //     if (listedObjects.IsTruncated) await removeObj(bucketName, folderName);
  // },

  async removeObj(fileKey) {

    var params = { Bucket: AWS_BUCKET, Key: `${fileKey}` };
    // console.log(params)
    return s3.deleteObject(params, function (err, data) {
      if (err) {
        // console.log(data)
        console.log(err);
      }
      console.log("success");
    });
  },

  async fileSizeConversion(size) {
    if (size == 0) return "0 Bytes";
    var k = 1000,
      dm = 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },
}
// @Service: uploadfile


export default AWSUpload;