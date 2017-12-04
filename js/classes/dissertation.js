/**
 * Represents a dissertation.
 *
 * @author 150009974
 * @version 1.0
 */
var staff = require("./staff");
var user = require("./user");
var errors = require('./errors');

function Dissertation(id, title, description, proposer) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.proposer = proposer;
    this.interestedStudents = [];
    this.assignee = undefined;
    this.supervisor = undefined;
}

Dissertation.prototype = {
    dissJSON: function () {
        var obj = {
            id: this.id,
            title: this.title,
            description: this.description,
            proposer: this.proposer.userid,
            proposer_role: this.proposer.role,
        };

        if (this.supervisor != undefined)
            obj.supervisor = this.supervisor.userid;

        if (this.assignee != undefined)
            obj.assigned = "already assigned";

        else if (this.interestedStudents.length > 0) {

            obj.interests = [];
            for ( var i in this.interestedStudents)
                obj.interests[i] = this.interestedStudents[i].userid;

        }

        return obj;
    },
    addInterest: function (student) {

        var indexOfStudent = this.interestedStudents.findIndex(function (currentStudent) {
            return currentStudent.userid == student.userid;
        });

        if (indexOfStudent != -1)
            throw new errors.ElementInUseError("Student interest is already noted!");

        this.interestedStudents.push(student);
        student.addDissertation(this);

    },
    removeInterest: function (student) {

        if (student.role != "student")
            throw new errors.ValidationError("Argument is not a student!");

        var indexOfStudent = this.interestedStudents.findIndex(function (currentStudent) {
            return currentStudent.userid == student.userid;
        });

        if (indexOfStudent == -1)
            throw new errors.NoSuchElementError("Student is already not showing interest in this dissertation!");

        student.removeDissertation(this);
        this.interestedStudents.splice(indexOfStudent, 1);

    },
    setSupervisor: function (supervisor) {

        if (this.supervisor != undefined)
            this.supervisor.removeDissertation(this);

        this.supervisor = supervisor;
        supervisor.addDissertation(this);

    }
};

function isValidDissertation(dissertation) {

    if (!(dissertation instanceof Object))
        return false;

    if (dissertation.id == undefined || dissertation.title == undefined)
        return false;

    return dissertation.description != undefined;

}

exports.Dissertation = Dissertation;
exports.isValidDissertation = isValidDissertation;

