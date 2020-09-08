class HandlerError {
    constructor(code, response) {
        this.code = code || 500;
        this.response = response || "generic.internal";
    }
}

module.exports = HandlerError;