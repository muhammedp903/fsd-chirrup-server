const users = require("../models/user.server.models")
const Joi = require("joi");

const create_user = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string()
        .min(8).max(32)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/) // Regex for required characters in any order
        .required(),
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).json({error_message: "Bad request"});

    let user = Object.assign({}, req.body);

    users.addNewUser(user, (err, id) => {
        if (err === 400) return res.status(400).json({error_message: "The username is already taken"})
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        return res.status(201).send({user_id:id});
    });
};

const login = (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).json({error_message:"Bad request"});

    users.authenticateUser(req.body.username, req.body.password, (err, id) => {
        if (err === 404) return res.status(400).json({error_message:"Invalid username or password"});
        if (err) return res.sendStatus(500);

        users.getToken(id, (err, token) => {
            if (err) return res.sendStatus(500);

            if(token){
                return res.status(200).send({user_id: id, session_token: token});
            } else{
                users.setToken(id, (err, token) => {
                    if (err) return res.sendStatus(500);

                    return res.status(200).send({user_id: id, session_token: token});
                });
            }
        });
    });
};

const logout = (req, res) => {
    let token = req.get("X-Authorization");

    users.removeToken(token, (err) => {
        if (err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};

module.exports = {
    login,
    create_user,
    logout,
}