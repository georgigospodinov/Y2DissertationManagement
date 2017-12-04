/**
 * Represents a student.
 *
 * @author 150009974
 * @version 1.0
 */
var user = require('./user');
var errors = require('./errors');

function Student(userid, password, given, surname) {
    user.User.call(this, userid, password, "student", given, surname);
}

Student.prototype = user.User.prototype;
Student.prototype.studentJSON = function () {
    var obj = this.partJSON();

    if ("assignedDissertation" in this) {
        delete obj.dissertations;
        obj.assigned_dissertation = this.assignedDissertation.id;
    }

    return obj;
};
Student.prototype.assignDissertation = function (dissertation) {

    if (!("supervisor" in dissertation))
        throw new errors.ValidationError("The dissertation has no supervisor!");

    if (dissertation.assignee != undefined)
        throw new errors.ElementInUseError("The dissertation is already assigned!");

    var idToSearch = this.userid;
    var indexOfStudent = dissertation.interestedStudents.findIndex(function (currentStudent) {
        return idToSearch == currentStudent.userid;
    });

    if (indexOfStudent == -1)
        throw new errors.ValidationError("This student has not shown interest in the dissertation!");

    this.assignedDissertation = dissertation;
    dissertation.assignee = this;

};
Student.prototype.unassignDissertation = function () {

    if (!("assignedDissertation" in this))
        throw new errors.NoSuchElementError("This student has no dissertation assigned!");

    this.assignedDissertation.assignee = undefined;
    var dissReference = this.assignedDissertation;
    delete this.assignedDissertation;

    return dissReference;
};

exports.Student = Student;