const stringToArray = (fields) => {
  return (req, res, next) => {
    if (req.body[fields]) {
      const fieldValue = req.body[fields];
      if ((typeof fieldValue)?.toLowerCase() === "string") {
        if (fieldValue.includes("#"))
          req.body[fields] = fieldValue
            .split("#")
            .map((item) => item.trim());
        else if (fieldValue.includes(","))
          req.body[fields] = fieldValue
            .split(",")
            .map((item) => item.trim());
        else req.body[fields] = [fieldValue];
      } else if (Array.isArray(fieldValue))
        req.body[fields] = fieldValue.map((item) => item.trim());
    } else req.body[fields] = [];
    next();
  };
};
module.exports = { stringToArray };
