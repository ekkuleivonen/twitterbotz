const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);
    return password_hash;
};

const passwordMatch = async (password, password_hash) => {
    const match = await bcrypt.compare(password, password_hash);
    return match;
};

module.exports = {
    hashPassword,
    passwordMatch,
};
