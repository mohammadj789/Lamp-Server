const path = require("path");
const fs = require("fs");
const removeErrorFile = (filePath) => {
  fs.unlinkSync(filePath);
};
module.exports = { removeErrorFile };
