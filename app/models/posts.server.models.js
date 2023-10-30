const db = require("../../database")

const addNewPost = (post, done) => {
    const sql = "INSERT INTO posts (text, date_published, author_id) VALUES (?, ?, ?)";
    let values = [post.text, Date.now(), 1];

    db.run (sql, values, function(err){
        if(err) return done(err);
        return done(null, this.lastID)
    });
}

const getSinglePost = (post_id, done) => {
    const sql = "SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username FROM posts p, users u WHERE p.post_id=? AND p.author_id=u.user_id";

    // TODO: Fix after users implemented
    db.get(sql, [post_id], function(err, post_details){
       if(err) return done(err);
       if(!post_details) return done(404);

       const sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id=? AND l.user_id=u.user_id";
       const likes = [];
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
                   timestamp: post_details.timestamp,
                   text: post_details.text,
                   author: {
                       user_id: post_details.user_id,
                       first_name: post_details.first_name,
                       last_name: post_details.last_name,
                       username: post_details.username
                   },
                   likes: likes
               });
           }
       );
    });

}

const updatePost = (post_id, new_text, done) => {

    let sql = "UPDATE posts SET text = ? WHERE post_id=?";

    db.run(sql, [new_text, post_id], (err) => {
        return done(err);
    })

}

module.exports = {
    addNewPost: addNewPost,
    getSinglePost: getSinglePost,
    updatePost: updatePost,
}