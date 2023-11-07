const db = require("../../database");
const postsModels = require("./posts.server.models");

const getSingleUser = (user_id, done) => {
    const sql = "SELECT user_id, first_name, last_name, username FROM users WHERE user_id=?";

    getUserDetails(user_id, (err, user_details) => {
        if (err) return done(err);
        if(!user_details) return done(404);

        getUserFollowers(user_id, (err, followers) => {
            if (err) return done(err);

            getUserFollowing(user_id, (err, following) => {
                if (err) return done(err);

                getUserPosts(user_id, (err, posts) => {
                    if (err) return done(err);

                    let user = {
                        user_id: user_id,
                        first_name: user_details.first_name,
                        last_name: user_details.last_name,
                        username: user_details.username,

                        followers: followers,

                        following: following,

                        posts: posts,
                    };

                    return done(err, user);
                });
            });
        });
    });
};

const getUserDetails = (user_id, done) => {
    const sql = "SELECT user_id, first_name, last_name, username FROM users WHERE user_id=?";

    db.get(sql, [user_id], (err, user_details) => {
        if (err) return done(err);
        console.log(user_details);
        if (!user_details) return done(404);
        console.log("not 404");

        return done(err, user_details);
    });
};

const getUserFollowers = (user_id, done) => {
    const sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, followers f WHERE f.user_id=? and u.user_id=f.follower_id";
    let followers = [];

    db.each(
        sql,
        [user_id],
        (err, row) => {
            if (err) return done(err);

            followers.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            });
        },
        (err) => {
            if(err) return done(err);
            return done(null, followers);
        }
    );
};

const getUserFollowing = (user_id, done) => {
    const sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, followers f WHERE f.user_id=u.user_id and f.follower_id=?";
    let following = [];

    db.each(
        sql,
        [user_id],
        (err, row) => {
            if (err) return done(err);

            following.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            });
        },
        (err) => {
            if(err) return done(err);
            return done(null, following);
        }
    );
};

// TODO:
const getUserPosts = (user_id, done) => {
    const sql = "SELECT post_id FROM posts WHERE author_id=?"; // Get the ids for all the user's posts

    let posts = [];
    db.each(
        sql,
        [user_id],
        (err, row) => {
            if (err) return done(err);

            const sql = "SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username FROM posts p, users u WHERE p.post_id=? AND p.author_id=u.user_id";
            // Get the details and likes for each post
            db.get(sql, [row.post_id], function(err, post_details){
                if(err) return done(err);
                if(!post_details) return done(404);

                const sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id=? AND l.user_id=u.user_id";
                let likes = [];
                db.each(
                    sql,
                    [row.post_id],
                    (err, row) => {
                        if (err) return done(err);

                        likes.push({
                            user_id: row.user_id,
                            first_name: row.first_name,
                            last_name: row.last_name,
                            username: row.username
                        })
                    },
                    (err, num_rows) => {
                        if(err) return done(err);

                        posts.push({
                            post_id: post_details.post_id,
                            timestamp: post_details.date_published,
                            text: post_details.text,
                            author: {
                                user_id: post_details.user_id,
                                first_name: post_details.first_name,
                                last_name: post_details.last_name,
                                username: post_details.username
                            },
                            likes: likes
                        });
                    },
                );
            });
            },
        (err, count) => {
            if (err) return done(err);
            // if (count === 0) return done(err, []); // The user has no posts, return empty list
            return done(err, posts)
        });
};

const followUser = (follow_id, id, done) => {
    const sql = "INSERT INTO followers VALUES(?,?)";

    db.run(sql, [follow_id, id], (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) return done(403); // Constraint error (19): this person has already been followed by the user
            return done(err);
        }
        return done(err);
    });
};

const unfollowUser = (unfollow_id, id, done) => {
    const sql = "DELETE FROM followers WHERE user_id=? AND follower_id=?";
    const values = [unfollow_id, id];

    db.run(sql, values, function(err) {
        if (this.changes === 0) return done(403); // The user hasn't followed the person, so nothing was deleted
        return done(err);
    });
};

// TODO: complete this function
const searchUsers = (query, done) => {
    const sql = "SELECT first_name, last_name, username FROM users WHERE username = ?";
    let results = [];

    db.each(
        sql,
        [query],
        (err, row) => {
            if (err) return done(err);
            results.push({
                first_name: row.first_name,
            });
        },
        (err, count) => {
            if (err) return done(err);
            console.log(results, count);
            return done(err, results);
        }
    );
};

module.exports = {
    getSingleUser: getSingleUser,
    getUserDetails,
    followUser,
    unfollowUser,
    searchUsers
}