const social = require("../models/social.server.models");
const users = require("../models/user.server.models");
const feed = require("../models/feed.server.models");
const e = require("express");

const get_feed = (req, res) => {
    let token = req.get("X-Authorization");

    users.getIdFromToken(token, (err, id) => {
        if (err === 404){
            id = null;
        }else if(err) {
            return res.sendStatus(500);
        }

        feed.getFeed(id, (err, feed) => {
            if(err) return res.sendStatus(500);

            return res.status(200).send(feed);
        });
    });

};

module.exports = {
    get_feed
}