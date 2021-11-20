const Tweet = require("./model");
const { locale } = require("../../locale");
const { getTweetsByUsername } = require("../services/twitterService");

const list = (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  Tweet.find({}, ["content", "comments", "likes", "user", "createdAt"])
    .populate("user", ["name", "username", "email"])
    .populate("comments.user", ["name", "username", "email"])
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1 })
    .then(async (tweets) => {
      const total = await Tweet.estimatedDocumentCount();
      const totalPages = Math.round(total / limit);
      const hasMore = page < totalPages;

      res.status(200).json({
        hasMore,
        totalPages,
        total,
        data: tweets,
        currentPage: page,
      });
    });
};

const find = async (req, res) => {
  const { id } = req.params;
  const tweet = await Tweet.findOne({ _id: id }, [
    "content",
    "comments",
    "likes",
    "user",
    "createdAt",
  ])
    .populate("user", ["name", "username", "email"])
    .populate("comments.user", ["name", "username", "email"]);
  if (tweet) {
    res.status(200).json({ data: tweet });
  } else {
    res
      .status(404)
      .json({ message: locale.translate("errors.tweet.tweetNotExists") });
  }
};

const searchTweets = async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  if (q) {
    Tweet.find({ content: { $regex: q, $options: "i" } }, [
      "content",
      "comments",
      "likes",
      "user",
      "createdAt",
    ])
      .populate("user", ["name", "username", "email"])
      .populate("comments.user", ["name", "username", "email"])
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })
      .then(async (tweets) => {
        const total = await Tweet.estimatedDocumentCount();
        const totalPages = Math.round(total / limit);
        const hasMore = page < totalPages;

        res.status(200).json({
          hasMore,
          totalPages,
          total,
          data: tweets,
          currentPage: page,
        });
      });
  } else {
    res.status(404).json({ message: "No search query provided" });
  }
};

const deleteComment = async (req, res) => {
  const { tweetId, commentId } = req.body;
  const result = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $pull: {
        comments: { _id: commentId },
      },
    },
    { new: true }
  );
  if (result) {
    res.status(200).json({ message: "ok" });
  } else {
    res.status(500).json({ message: "error" });
  }
};

const create = (req, res) => {
  const { content, userId } = req.body;

  const tweet = {
    content,
    user: userId,
  };

  const newTweet = new Tweet(tweet);
  newTweet
    .save()
    .then((tweetCreated) => {
      console.log(tweetCreated);
      Tweet.populate(
        tweetCreated,
        { path: "user", select: "username name email" },
        (err, tweet) => {
          if (err)
            return res
              .status(500)
              .json({ message: "error while populating tweet" });
          return res.status(200).json({ data: tweet });
        }
      );
    })
    .catch((err) =>
      res.status(500).json({ message: "error while creating tweet" })
    );
};

const createComment = (req, res) => {
  const { comment, tweetId, userId } = req.body;

  const comments = {
    comment,
    user: userId,
  };

  Tweet.updateOne({ _id: tweetId }, { $addToSet: { comments } })
    .then(() => {
      res.status(200).json({ message: "ok" });
    })
    .catch((error) => {
      res.status(500).json({ message: "not updated" });
    });
};

const likes = (req, res) => {
  const { like, tweetId } = req.body;

  Tweet.updateOne({ _id: tweetId }, { $inc: { likes: like === 1 ? 1 : -1 } })
    .then(() => {
      res.status(200).json({ message: "ok" });
    })
    .catch((error) => {
      res.status(500).json({ message: "not updated" });
    });
};

const destroyTweet = async (req, res) => {
  const { tweetId, userId } = req.body;

  await Tweet.findOneAndDelete(
    {
      $and: [{ _id: { $eq: tweetId } }, { user: { $eq: userId } }],
    },
    (err, docs) => {
      if (err) {
        res.status(500).json({
          message: `${locale.translate("errors.tweet.onDelete")}`,
        });
      } else if (docs) {
        res.status(200).json({
          message: `${locale.translate("success.tweet.onDelete")}`,
          id: docs._id,
        });
      } else {
        res.status(404).json({
          message: `${locale.translate("errors.tweet.tweetNotExists")}`,
        });
      }
    }
  );
};

const getExternalTweetsByUsername = async (req, res) => {
  const { username } = req.params;
  const tweetsResponse = await getTweetsByUsername(username);
  const tweets = tweetsResponse.map(({ text, created_at }) => {
    return {
      text,
      created_at,
    };
  });
  res.status(200).json(tweets);
};

module.exports = {
  list,
  find,
  create,
  createComment,
  likes,
  destroyTweet,
  getExternalTweetsByUsername,
  deleteComment,
  searchTweets,
};
