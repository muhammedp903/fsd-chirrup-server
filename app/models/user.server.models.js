const db = require("../../database")
const crypto = require("crypto");

const getHash = function (password, salt){
    return crypto.pbkdf2Sync(password, salt, 100000, 256, "sha256").toString("hex");
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = "INSERT INTO users (first_name, last_name, username, password, salt) VALUES (?,?,?,?,?)";
    let values = [user.first_name, user.last_name, user.username, hash, salt.toString("hex")];

    db.run(sql, values, function(err){
        if (err) {
            if (err.errno === 19) return done(400); // Constraint error (19): this username already exists
            return done(err);
        }

        return done(err, this.lastID);
    });
};

const authenticateUser = (username, password, done) => {
    const sql = "SELECT user_id, password, salt FROM users WHERE username=?";

    db.get(sql, [username], (err, row) => {
        if (err) return done(err);
        if (!row) return done(404);

        if (row.salt === null) row.salt = "";

        let salt = Buffer.from(row.salt, "hex");

        if (row.password === getHash(password, salt)){
            return done(false, row.user_id);
        } else{
            return done(404);
        }
    });
};

const getToken = (id, done) => {
    const sql = "SELECT session_token FROM USERS WHERE user_id=?";

    db.get(sql, [id], (err, row) => {
        if(err) return done(err);
        if (!row) return done();

        return done(err, row.session_token);
    });
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString("hex");

    const sql = "UPDATE users SET session_token=? WHERE user_id=?";

    db.run(sql, [token, id], (err) => {
        return done(err, token);
    });
};

const removeToken = (token, done) => {
    const sql = "UPDATE users SET session_token=null WHERE session_token=?";

    db.run(sql, [token], (err) => {
        return done(err);
    });
};

const getIdFromToken = (token, done) => {
    const sql = "SELECT user_id FROM users WHERE session_token=?";

    db.get(sql, [token], (err, row) => {
        if(!row) return done(404);
        if (err) return done(err);
        return done(err, row.user_id);
    });
};

module.exports = {
    addNewUser,
    authenticateUser,
    getToken,
    setToken,
    removeToken,
    getIdFromToken,
};