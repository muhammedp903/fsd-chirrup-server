const users = require("./user.server.models");
const social = require("./social.server.models");
const db = require("../../database");

const getFeed = (userId, done) => {
    console.log(userId);
    let loggedIn = userId != null;
    let postIds = [];
    let postsFeed = [];

    if (loggedIn){
        console.log("Logged in");
        social.getSingleUser(userId, (err, currentUser) => {
            if (err) return done(err)
            currentUser.following.forEach((user) => {
                postIds.push(user.user_id);
            });
            postsFeed = postsFeed.concat(currentUser.posts);

            let promises = [];
            postIds.forEach((postId) => {
                promises.push(social.getPost(postId));
            });

            Promise.all(promises).then((posts) => {
                postsFeed = postsFeed.concat(posts);
                postsFeed.sort((a, b) => {
                    if (a.timestamp>b.timestamp) return 1;
                    return -1;
                })
                return done(null, postsFeed);
            })
                .catch((err) => {
                    return done(err);
                });
        });
    } else {
        console.log("Not logged in");
        getAllPostIds((err, rows) => {
            if (err) return done(err);

            rows.forEach((row) => {
                postIds.push(row.post_id);
            });

            let promises = [];
            postIds.forEach((postId) => {
                promises.push(social.getPost(postId));
            });

            Promise.all(promises).then((posts) => {
                postsFeed = postsFeed.concat(posts);
                postsFeed.sort((a, b) => {
                    if (a.timestamp>b.timestamp) return 1;
                    return -1;
                })
                return done(null, postsFeed);
            })
                .catch((err) => {
                    return done(err);
                });
        });
    }
};

const getAllPostIds = (done) => {
    const sql = "SELECT post_id FROM posts";
    db.all(sql, [], (err, rows) => {
        if (err) return done(err);

        return done(err, rows);
    });
};

module.exports = {
    getFeed
}