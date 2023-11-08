const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createHttpError = require("http-errors");
const createRoute = (req, type, imgFolder) => {
  const date = new Date();
  const day = date.getDay() + "";
  const month = date.getMonth() + "";
  const year = date.getFullYear() + "";
  req.filepathaddress = req?.filepathaddress
    ? [...req?.filepathaddress].push(
        path.join("static", type, imgFolder, year, month, day)
      )
    : [path.join("static", type, imgFolder, year, month, day)];
  return path.join(
    __dirname,
    "..",
    "..",
    "..",
    "static",
    type,
    imgFolder,
    year,
    month,
    day
  );
};
const storage = (type, imgFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      if (file?.originalname) {
        const path = createRoute(req, type, imgFolder);
        fs.mkdirSync(path, { recursive: true });
        return cb(null, path);
      }

      cb(null, null);
    },
    filename: async (req, file, cb) => {
      if (file?.originalname) {
        const ext = path.extname(file.originalname);
        const fileName =
          Date.now() * Math.round((Math.random() + 2) * 13) + ext;
        return cb(null, fileName);
      }
      cb(null, null);
    },
  });
const fileFilter = (format) => (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (!format.test(ext))
    return cb(
      createHttpError.BadRequest("this file type is not supported")
    );
  cb(null, true);
};

const multerUpload = (type, imgFolder, max, format) => {
  return multer({
    storage: storage(type, imgFolder),
    fileFilter: fileFilter(format),
    limits: { fileSize: max * 1024 * 1024 },
  });
};
module.exports = { multerUpload };
