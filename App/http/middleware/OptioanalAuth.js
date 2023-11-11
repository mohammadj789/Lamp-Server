const JWT = require("jsonwebtoken");
const { UserModel } = require("../../models/user");

const OptioanalAuth = async (req, res, next) => {
  const authoeizationHeader = req?.headers?.authorization;
  if (authoeizationHeader) {
    const [bearer, token] = authoeizationHeader?.split(" ");
    const id = token
      ? JWT.verify(token, process?.env?.JTWTOKEN)
      : null;
    const user = id ? await UserModel.findById(id) : null;
    if (user) {
      req.user = user;
      next();
    }
  } else next();
};
module.exports = { OptioanalAuth };
