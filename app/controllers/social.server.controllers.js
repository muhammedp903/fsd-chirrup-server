const social = require("../models/social.server.models");
const Joi = require("joi");
const posts = require("../models/posts.server.models");
const users = require("../models/user.server.models");

const get_user = (req, res) => {
    let user_id = parseInt(req.params.user_id);

    social.getSingleUser(user_id, (err, user) => {
        if (err === 404) return res.sendStatus(404);
        if (err) return res.sendStatus(500);

        return res.status(200).send(user);
    });
};

const follow_user = (req, res) => {
    let user_id = parseInt(req.params.user_id);
    let token = req.get("X-Authorization");

    social.getUserDetails(user_id, (err) => {
        if(err === 404) return res.sendStatus(404);
        if(err) return res.sendStatus(500);

        users.getIdFromToken(token, (err, id) => {
            if (err) return res.sendStatus(500);

            social.followUser(user_id, id, (err) => {
                if(err === 403) return res.sendStatus(403);
                if (err) return res.sendStatus(500);
                return res.sendStatus(200);
            });
        });
    });
};

const unfollow_user = (req, res) => {
    let user_id = parseInt(req.params.user_id);
    let token = req.get("X-Authorization");

    social.getUserDetails(user_id, (err) => {
        if(err === 404) return res.sendStatus(404);
        if(err) return res.sendStatus(500);

        users.getIdFromToken(token, (err, id) => {
            if (err) return res.sendStatus(500);

            social.unfollowUser(user_id, id, (err) => {
                if(err === 403) return res.sendStatus(403);
                if (err) return res.sendStatus(500);
                return res.sendStatus(200);
            });
        });
    });
};

const search = (req, res) => {
    let queryParameter = req.query.q;
    if (!queryParameter) queryParameter = ""; // Returns all the users if no query parameter is included in the request

    social.searchUsers(queryParameter, (err, results) => {
        if (err) return res.sendStatus(500);

        return res.status(200).send(results);
    });
};

module.exports = {
    get_user,
    follow_user,
    unfollow_user,
    search
}