const feed = require('../controllers/feed.server.controllers');

module.exports = function (app) {
    app.route("/feed")
        .get(feed.get_feed);
}
