const Tweet = require("../tweets/model");

const verifyIfUserIsOwnsTweet = async (userId, tweetId) => {
  const validateUser = await Tweet.find({
    $and: [{ _id: { $eq: tweetId } }, { user: { $eq: userId } }],
  });

  if (validateUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

const verifyIfUserOwnsComment = async (userId, commentId) => {
  const validateUser = await Tweet.find({
    $and: [
      { "comments._id": { $eq: commentId } },
      { "comments.user": { $eq: userId } },
    ],
  });

  return validateUser.length > 0;
};

module.exports = { verifyIfUserIsOwnsTweet, verifyIfUserOwnsComment };
