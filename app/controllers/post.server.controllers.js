const posts = require("../models/posts.server.models")
const Joi = require("joi")

const add_post = (req, res) => {
    const schema = Joi.object({
        text: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if(error) return res.sendStatus(400);

    let post = Object.assign({}, req.body);

    posts.addNewPost(post, (err, id) => {
        if (err) {
            return res.sendStatus(500);
        } else {
            return res.status(201).send({post_id: id});
        }
    })
};

const get_post = (req, res) => {
    let post_id = parseInt(req.params.post_id);

    posts.getSinglePost(post_id, (err, result) => {
        if(err === 404) return res.sendStatus(404);
        if(err) return res.sendStatus(500);

        return res.status(200).send(result)
    });
};

const update_post = (req, res) => {
    let post_id = parseInt(req.params.post_id);
    posts.getSinglePost(post_id, (err, post) => {
        if(err === 404) return res.sendStatus(404);
        if(err) return res.sendStatus(500);

        const schema = Joi.object({
            "text": Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        if (post.text === req.body.text){
            return res.sendStatus(200);
        }

        posts.updatePost(post_id, req.body.text, (err) => {
            if (err) return res.sendStatus(500);
            return res.sendStatus(200);
        })

    });
};

const delete_post = (req, res) => {
    return res.sendStatus(500);
};

const add_like = (req, res) => {
    return res.sendStatus(500);
};

const remove_like = (req, res) => {
    return res.sendStatus(500);
};

module.exports = {
    add_post:add_post,
    add_like:add_like,
    get_post:get_post,
    update_post:update_post,
    delete_post:delete_post,
    remove_like:remove_like
}