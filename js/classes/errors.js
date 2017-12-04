/**
 * Exception classes.
 */

/**
 * Error thrown when validation of inputs fails.
 */
function ValidationError(msg, filename, linenumber) {
    var err = Error.call(this, msg, filename, linenumber);
    err.name = "ValidationError";
    return err;
}
ValidationError.prototype = Error.prototype;

/**
 * Error thrown when a specified element is missing.
 */
function NoSuchElementError(msg, filename, linenumber) {
    var err = Error.call(this, msg, filename, linenumber);
    err.name = "NoSuchElementError";
    return err;
}
NoSuchElementError.prototype = Error.prototype;

/**
 * Error thrown when a specified element is already in use.
 */
function ElementInUseError(msg, filename, linenumber) {
    var err = Error.call(this, msg, filename, linenumber);
    err.name = "ElementInUseError";
    return err;
}
ElementInUseError.prototype = Error.prototype;

exports.ValidationError = ValidationError;
exports.NoSuchElementError = NoSuchElementError;
exports.ElementInUseError = ElementInUseError;