const createHttpError = require("http-errors");
const JWT = require("jsonwebtoken");
const { UserModel } = require("../../models/user");

const checkAuth = async (req, res, next) => {
  try {
    const error = createHttpError.Unauthorized("please login again");
    const authoeizationHeader = req?.headers?.authorization;
    if (!authoeizationHeader) throw error;

    const [bearer, token] = authoeizationHeader?.split(" ");
    if (!bearer || !token || bearer?.toLowerCase() !== "bearer")
      throw error;

    const id = JWT.verify(token, process?.env?.JTWTOKEN);
    if (!id) throw error;

    const user = await UserModel.findById(id);
    if (!user) throw error;

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = { checkAuth };
