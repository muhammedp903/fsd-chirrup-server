const posts = require('../controllers/post.server.controllers')

module.exports = function (app) {

    app.route("/posts")
        .post(posts.add_post);

    app.route("/posts/:post_id")
        .get(posts.get_post)
        .post(posts.update_post)
        .delete(posts.delete_post);

    app.route("/posts/:post_id/like")
        .post(posts.add_like)
        .delete(posts.remove_like);

};