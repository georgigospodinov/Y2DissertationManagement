/**
 * Represents a user of the system.
 *
 * @author 150009974
 * @version 1.0
 */

var errors = require('./errors');

function User(userid, password, role, given, surname) {
    this.userid = userid;
    this.password = password;
    this.role = role;
    this.given = given;
    this.surname = surname;

    /*
     * Staff members supervise dissertations.
     * Students show interests in dissertations.
     */
    this.dissertations = [];
}

User.prototype = {
    partJSON: function () {
        var obj = {
            userid: this.userid,
            password: this.password,
            role: this.role,
            given: this.given,
            surname: this.surname
        };

        if (this.dissertations.length > 0) {

            obj.dissertations = [];
            for (var i in this.dissertations)
                obj.dissertations[i] = this.dissertations[i].id;

        }

        return obj;
    },
    addDissertation: function (dissertation) {

        var indexOfDissertation = this.dissertations.findIndex(function (currentDiss) {
            return currentDiss.id == dissertation.id;
        });

        if (indexOfDissertation == -1)
            this.dissertations.push(dissertation);

        else throw new errors.ElementInUseError("Dissertation already added!");
    },
    removeDissertation: function (dissertation) {

        var indexOfDissertation = this.dissertations.findIndex(function (currentDiss) {
            return currentDiss.id == dissertation.id;
        });

        if (indexOfDissertation == -1)
            throw new errors.NoSuchElementError("Dissertation not found!");

        this.dissertations.splice(indexOfDissertation, 1);
    }
};

function isValidUser(user) {

    if (!(user instanceof Object))
        return false;

    if (user.userid == undefined || user.password == undefined)
        return false;

    if (user.userid == "*") // user/* is reserved to address all users
        return false;

    if (user.given == undefined || user.surname == undefined)
        return false;

    if (user.role == undefined)
        return false;

    return user.role == "staff" || user.role == "student";
}

exports.User = User;
exports.isValidUser = isValidUser;