const social = require("./social.server.models");
const db = require("../../database");

const getFeed = (userId, done) => {
    let loggedIn = userId != null;
    let postIds = [];
    let postsFeed = [];

    if (loggedIn){
        social.getSingleUser(userId, (err, currentUser) => {
            if (err) return done(err);

            postsFeed = postsFeed.concat(currentUser.posts); // Add the current users posts

            let userIds = [];
            currentUser.following.forEach((user) => {
                userIds.push(user.user_id); // Make a list of users that the current user follows
            });

            let promises = [];
            userIds.forEach((userId) => {
                promises.push(getPostsList(userId)); // Get the post IDs of all the posts from each followed user
            });
            Promise.all(promises).then((postsToGet) => {
                postIds = postsToGet.flat().map((element) => element.post_id); // Flatten the list of lists and convert the json to just ids

                let promises = [];
                postIds.forEach((postId) => {
                    promises.push(social.getPost(postId)); // Get each post
                });

                Promise.all(promises).then((posts) => {
                    postsFeed = postsFeed.concat(posts);

                    postsFeed.sort((a, b) => {
                        if (a.timestamp<b.timestamp) return 1; // Sort all the posts by timestamp
                        return -1;
                    })
                    return done(null, postsFeed);
                })
                    .catch((err) => {
                        console.log(err);
                        return done(err);
                    });
            })
                .catch((err) => {
                    console.log(err);
                    return done(err);
                });
        });
    } else {
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
                    if (a.timestamp<b.timestamp) return 1;
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

const getPostsList = (userId) => {
    const sql = "SELECT post_id FROM posts WHERE author_id=?";

    return new Promise((resolve, reject) => {
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);

            return resolve(rows);
        });
    });

};

module.exports = {
    getFeed
}