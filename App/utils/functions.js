const path = require("path");
const fs = require("fs");
const removeErrorFile = (filePath) => {
  console.log(filePath);
  fs.unlinkSync(filePath);
};
module.exports = { removeErrorFile };
