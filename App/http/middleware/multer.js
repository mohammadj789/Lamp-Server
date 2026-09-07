// const multer = require("multer");
// const path = require("path");
// const {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } = require("@aws-sdk/client-s3");
// const createHttpError = require("http-errors");

// const s3 = new S3Client({
//   region: "auto",
//   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID,
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
//   },
// });

// const buildAbsoluteUrl = (key) =>
//   `${process.env.R2_PUBLIC_URL}/${key}`;

// const createKey = (req, type, imgFolder, ext) => {
//   const date = new Date();
//   const day = date.getDate() + "";
//   const month = date.getMonth() + "";
//   const year = date.getFullYear() + "";

//   const fileName =
//     Date.now() * Math.round((Math.random() + 2) * 13) + ext;
//   const key = [type, imgFolder, year, month, day, fileName].join("/");

//   const url = buildAbsoluteUrl(key);
//   req.filepathaddress = req.filepathaddress
//     ? [...req.filepathaddress, url]
//     : [url];

//   return key;
// };

// const fileFilter = (format) => (req, file, cb) => {
//   const ext = path.extname(file.originalname);
//   if (!format.test(ext))
//     return cb(
//       createHttpError.BadRequest("this file type is not supported"),
//     );
//   cb(null, true);
// };

// // multer now just buffers the file in memory — nothing is written to disk
// // or uploaded anywhere yet. That happens in uploadToR2 below.
// const multerUpload = (max, format) => {
//   return multer({
//     storage: multer.memoryStorage(),
//     fileFilter: fileFilter(format),
//     limits: { fileSize: max * 1024 * 1024 },
//   });
// };

// // Runs after multerUpload().single("field"). Pushes req.file.buffer to R2
// // and attaches key/location back onto req.file so controllers can use them.
// const uploadToR2 = (type, imgFolder) => async (req, res, next) => {
//   try {
//     if (!req.file) return next();

//     const ext = path.extname(req.file.originalname);
//     const key = createKey(req, type, imgFolder, ext);

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.R2_BUCKET_NAME,
//         Key: key,
//         Body: req.file.buffer,
//         ContentType: req.file.mimetype,
//       }),
//     );

//     req.file.key = key;
//     req.file.location = buildAbsoluteUrl(key);
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Call this in your error-handling cleanup instead of removeErrorFile(req.file.path)
// const removeR2Object = async (key) => {
//   if (!key) return;
//   try {
//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: process.env.R2_BUCKET_NAME,
//         Key: key,
//       }),
//     );
//   } catch (err) {
//     console.error("Failed to clean up R2 object:", key, err);
//   }
// };

// module.exports = { multerUpload, uploadToR2, removeR2Object };

const multer = require("multer");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const createHttpError = require("http-errors");

// ArvanCloud Object Storage (AOS) is S3-compatible.
// Endpoint is region-specific, e.g.:
//   https://s3.ir-thr-at1.arvanstorage.ir  (Simin / Tehran)
//   https://s3.ir-tbz-sh1.arvanstorage.ir  (Shahriar / Tabriz)
// Set AOS_ENDPOINT to whichever region your bucket lives in.
const s3 = new S3Client({
  region: process.env.AOS_REGION || "default", // ArvanCloud doesn't use real AWS regions
  endpoint: process.env.AOS_ENDPOINT, // e.g. https://s3.ir-thr-at1.arvanstorage.ir
  forcePathStyle: true, // REQUIRED: ArvanCloud uses path-style (endpoint/bucket/key), not virtual-hosted-style
  credentials: {
    accessKeyId: process.env.AOS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AOS_SECRET_ACCESS_KEY,
  },
});

// If you have a bucket-level CDN domain configured in ArvanCloud, use that here.
// Otherwise fall back to endpoint + bucket + key (path-style public URL).
const buildAbsoluteUrl = (key) => {
  if (process.env.AOS_PUBLIC_URL) {
    return `${process.env.AOS_PUBLIC_URL}/${key}`;
  }
  return `${process.env.AOS_ENDPOINT}/${process.env.AOS_BUCKET_NAME}/${key}`;
};

const createKey = (req, type, imgFolder, ext) => {
  const date = new Date();
  const day = date.getDate() + "";
  const month = date.getMonth() + "";
  const year = date.getFullYear() + "";

  const fileName =
    Date.now() * Math.round((Math.random() + 2) * 13) + ext;
  const key = [type, imgFolder, year, month, day, fileName].join("/");

  const url = buildAbsoluteUrl(key);
  req.filepathaddress = req.filepathaddress
    ? [...req.filepathaddress, url]
    : [url];

  return key;
};

const fileFilter = (format) => (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (!format.test(ext))
    return cb(
      createHttpError.BadRequest("this file type is not supported"),
    );
  cb(null, true);
};

// multer just buffers the file in memory — nothing is written to disk
// or uploaded anywhere yet. That happens in uploadToAOS below.
const multerUpload = (max, format) => {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter(format),
    limits: { fileSize: max * 1024 * 1024 },
  });
};

// Runs after multerUpload().single("field"). Pushes req.file.buffer to
// ArvanCloud Object Storage and attaches key/location back onto req.file
// so controllers can use them.
const uploadToR2 = (type, imgFolder) => async (req, res, next) => {
  try {
    if (!req.file) return next();

    const ext = path.extname(req.file.originalname);
    const key = createKey(req, type, imgFolder, ext);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AOS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "public-read",
      }),
    );

    req.file.key = key;
    req.file.location = buildAbsoluteUrl(key);
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Call this in your error-handling cleanup instead of removeErrorFile(req.file.path)
const removeAOSObject = async (key) => {
  if (!key) return;
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AOS_BUCKET_NAME,
        Key: key,
      }),
    );
  } catch (err) {
    console.error("Failed to clean up ArvanCloud object:", key, err);
  }
};

module.exports = { multerUpload, uploadToR2, removeAOSObject };
