const db = require("../../database");
const users = require("../models/user.server.models")

const addNewPost = (post, done) => {
    users.getIdFromToken(post.token, (err, id) => {
        if(err) return done(err);

        const sql = "INSERT INTO posts (text, date_published, author_id) VALUES (?, ?, ?)";
        let values = [post.text, Date.now(), id];

        db.run (sql, values, function(err){
            if(err) return done(err);
            return done(null, this.lastID);
        });
    });
};

const getSinglePost = (post_id, done) => {
    const sql = "SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username FROM posts p, users u WHERE p.post_id=? AND p.author_id=u.user_id";

    db.get(sql, [post_id], function(err, post_details){
       if(err) return done(err);
       if(!post_details) return done(404);

       const sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id=? AND l.user_id=u.user_id";
       let likes = [];
       db.each(
           sql,
           [post_id],
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

               return done(null, {
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
};

const updatePost = (post_id, new_text, done) => {
    const sql = "UPDATE posts SET text = ? WHERE post_id=?";

    db.run(sql, [new_text, post_id], (err) => {
        return done(err);
    });

};

const deletePost = (post_id, done) => {
    const sqlPosts = "DELETE FROM posts WHERE post_id=?";

    db.run(sqlPosts, [post_id], (err) => {
        if (err) return done(err);

        const sqlLikes = "DELETE FROM likes WHERE post_id=?";
        db.run(sqlLikes, [post_id], (err) => {
            return done(err);
        });
    });
};

const addLike = (post_id, id, done) => {
    const sql = "INSERT INTO likes VALUES (?,?)";
    const values = [post_id, id];

    db.run(sql, values, (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) return done(403); // Constraint error (19): this post has already been liked by the user
            return done(err);
        }
        return done(err);
    });
};

const removeLike = (post_id, id, done) => {
    const sql = "DELETE FROM likes WHERE post_id=? AND user_id=?";
    const values = [post_id, id];

    db.run(sql, values, function(err) {
        if (this.changes === 0) return done(403); // The user hasn't liked the post, so nothing was deleted
        return done(err);
    });
};

module.exports = {
    addNewPost: addNewPost,
    getSinglePost: getSinglePost,
    updatePost: updatePost,
    deletePost: deletePost,
    addLike: addLike,
    removeLike: removeLike,
}