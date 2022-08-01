import consola from "consola";
class ErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg;
    }
    //   here we are creating static method because we dont need to create object to call a class it call automatically
    static alreadyExist(message) {
        consola.error(message);
        return new ErrorHandler(409, message);
    }
    static notFound(message = "404 Not Found") {
        consola.error(message);
        return new ErrorHandler(404, message);
    }
    static Restricted(message = "You Can't Change This Field") {
        consola.error(message);
        return new ErrorHandler(400, message);
    }
    static wrongCredentials(message = "username or password is wrong") {
        return new ErrorHandler(401, message);
    }
    // default message or value given to function
    static unAuthorized(message = "unAuthorized") {
        consola.error(message);
        return new ErrorHandler(401, message);
    }

    static fileFormat(message) {
        return new ErrorHandler(415, message)
    }

    static serverError(message = "Internal Server Error") {
        consola.error(message);
        return new ErrorHandler(500, message);
    }

}
export default ErrorHandler;