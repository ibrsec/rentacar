"use strict";


module.exports = (email) => {
    return /.+@.+\..+/.test(email);
}