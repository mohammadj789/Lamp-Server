const { Router } = require("express");
const {
  AuthController,
} = require("../http/controller/auth.controller");

const { checkAuth } = require("../http/middleware/checkAuth");

const router = Router();

/**
 * @swagger
 *  components:
 *    schemas:
 *      signUp:
 *        type: object
 *        required:
 *          - name
 *          - email
 *          - password
 *        properties:
 *          name:
 *            type: string
 *            description: full name of user
 *          email:
 *            type: string
 *            description: email of user
 *          password:
 *            type: string
 *            description: password of user
 */
/**
 * @swagger
 *  components:
 *    schemas:
 *      login:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            description: email of user
 *          password:
 *            type: string
 *            description: password of user
 */
/**
 * @swagger
 *  components:
 *    schemas:
 *      reset:
 *        type: object
 *        required:
 *          - currentpass
 *          - newpass
 *          - repeatnewpass
 *        properties:
 *          currentpass:
 *            type: string
 *            description: current Password
 *          newpass:
 *            type: string
 *            description: new Password
 *          repeatnewpass:
 *            type: string
 *            description: repeat new password
 */
/**
 * @swagger
 *  /auth/signup:
 *    post:
 *      tags: [Auth]
 *      summary: create account
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/signUp'
 *      responses:
 *        201:
 *          description: created
 *        400:
 *          description: bad request
 *        500:
 *          description: InternalServerError
 */
router.post("/signup", AuthController.signup);
/**
 * @swagger
 *  /auth/login:
 *    post:
 *      tags: [Auth]
 *      summary: login to an account
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/login'
 *      responses:
 *        200:
 *          description: authenticated successfully
 *        401:
 *          description: wrong credentials
 */

router.post("/login", AuthController.login);
/**
 * @swagger
 *  /auth/resetpass:
 *    post:
 *      tags: [Auth]
 *      summary: reset your account password
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/reset'
 *      responses:
 *        200:
 *          description: password reseted successfully
 *        401:
 *          description: unauthorized
 *        500:
 *          description: internalservererror
 *
 */

router.post("/resetpass", checkAuth, AuthController.frogetPass);
module.exports = { AuthRoutes: router };
