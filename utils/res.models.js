module.exports = Object.freeze({
    DATA: {
        
    },
    //2XX
    OK: {
        status: 200, 
        msg: "ok",
        description: "The request has succeeded"
    },
    Created: {
        status: 201,
        msg: "Created",
        description: "Successful creation occurred"
    },
    //4XX
    BadRequest: {
        status: 400,
        msg: "Bad request",
        description: "The request could not be understood by the server due to malformed syntax"
    },
    Unauthorized: {
        status: 401,
        msg: "The request requires valid X-API-KEY authentication",
        description: "Missing or invalid authentication token."
    },
    Forbidden: {
        status: 403,
        msg: "Forbidden",
        description: "The server understood the request, but is refusing to fulfill it"
    },
    NotFound: {
        status: 404,
        msg: "Not Found",
        description: ""
    },
    //5XX
    InternalServerError: {
        status: 500,
        msg: "Internal server error",
        description: "The server encountered an unexpected condition which prevented it from fulfilling the request"
    }
})