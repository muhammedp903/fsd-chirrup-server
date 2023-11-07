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

                // getUserPosts(user_id, (err, posts) => {
                //     if (err) return done(err);
                //
                //     let user = {
                //         user_id: user_id,
                //         first_name: user_details.first_name,
                //         last_name: user_details.last_name,
                //         username: user_details.username,
                //
                //         followers: followers,
                //
                //         following: following,
                //
                //         posts: posts,
                //     };
                //
                //     return done(err, user);
                // });
                });
        });
    });
};

const getUserDetails = (user_id, done) => {
    const sql = "SELECT user_id, first_name, last_name, username FROM users WHERE user_id=?";

    db.get(sql, [user_id], (err, user_details) => {
        if (err) return done(err);
        if (!user_details) return done(404);

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

const getPostsList = (userId, done) => {
    const sql = "SELECT post_id FROM posts WHERE author_id=?";

    db.all(sql, [userId], (err, rows) => {
        if (err) return done(err);

        return done(err, rows);
    });
};

// TODO:
const getUserPosts = async function (ids) {

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

const searchUsers = (query, done) => {
    const sql = "SELECT user_id, first_name, last_name, username FROM users WHERE username LIKE :q OR first_name LIKE :q OR last_name LIKE :q";
    let results = [];

    db.each(
        sql,
        ['%' + query + '%'],
        (err, row) => {
            if (err) return done(err);
            results.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            });
        },
        (err) => {
            if (err) return done(err);
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