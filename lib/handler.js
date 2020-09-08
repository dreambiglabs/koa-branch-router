const HandlerError = require('./handler-error');
const tree = require('./tree');

class Handler {
    constructor(func, options) {
        this.type = tree.TYPE.HANDLER;
        const defaultFunc = async ctx => {}
        this.func = func || defaultFunc;
        this.options = options || {};
    }

    handle() {
        return async ctx => {
            const vars = {}
            if (this.options.body) {
                const { error: bodyError, value: bodyValue } = this.options.body.validate(ctx.request.body, {abortEarly: false});
                vars.body = bodyValue
                if (bodyError) {
                    ctx.status = 409;
                    ctx.body = {
                        errors: bodyError.details.reduce(function(map, obj) {
                            map[obj.context.key] = obj.type
                            return map;
                        }, {})
                    }
                    return
                }
            }
            const responseObject = await this.func(ctx, vars)

            if (responseObject instanceof this.options.response) {
                ctx.status = 200;
                ctx.body = responseObject
                return
            }
            if(responseObject instanceof HandlerError) {
                ctx.status = responseObject.code;
                ctx.body = {
                    errors: responseObject.response
                }
                return
            }

            ctx.status = 500;
            ctx.body = {
                errors: {
                    global: "generic.internal"
                }
            }


        }
    }
}

module.exports = Handler;