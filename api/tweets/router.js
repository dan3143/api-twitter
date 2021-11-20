const express = require("express");
const {
  list,
  find,
  create,
  createComment,
  likes,
  destroyTweet,
  getExternalTweetsByUsername,
  deleteComment,
  searchTweets,
} = require("./controller");
const { logger } = require("../middleware/logger");
const { authenticator } = require("../middleware/authenticator");
const { validateTweet, validateComment } = require("../middleware/validator");
const {
  tweetsAuthorization,
  commentsAuthorization,
} = require("../middleware/authorization");

const router = express.Router();

router.use(logger);

router
  .route("/")
  .get(authenticator, list)
  .post(authenticator, validateTweet, create)
  .delete(authenticator, tweetsAuthorization, destroyTweet);

router.route("/search").get(searchTweets);

router
  .route("/comments")
  .post(authenticator, validateComment, createComment)
  .delete(authenticator, commentsAuthorization, deleteComment);

router.route("/likes").post(authenticator, likes);

router
  .route("/external/:username")
  .get(authenticator, getExternalTweetsByUsername);

router.route("/:id").get(find);

module.exports = router;
