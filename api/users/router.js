const express = require("express");
const {
  list,
  create,
  update,
  login,
  logout,
  remove,
  find,
  tweetsOfUser,
} = require("./controller");
const { logger } = require("../middleware/logger");
const { validateUser, validateLogin } = require("../middleware/validator");
const { authenticator } = require("../middleware/authenticator");
const { usersAuthorization } = require("../middleware/authorization");

const router = express.Router();

router.use(logger);

router
  .route("/")
  .get(authenticator, list)
  .delete(authenticator, usersAuthorization, remove)
  .post(validateUser, create);

router.route("/login").post(validateLogin, login);

router.route("/logout").get(logout);

router
  .route("/:id")
  .get(find)
  .put(authenticator, usersAuthorization, validateUser, update);

router.route("/:username/tweets").get(tweetsOfUser);

module.exports = router;
