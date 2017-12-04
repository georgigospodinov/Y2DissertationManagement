/**
 * Represents a member of staff.
 *
 * @author 150009974
 * @version 1.2
 */

var user = require('./user');
var errors = require('./errors');
var validator = require('validator');

function Staff(userid, password, given, surname, jobTitle, email, telephone, roomNumber) {
    user.User.call(this, userid, password, "staff", given, surname);
    this.jobTitle = jobTitle;
    this.email = email;
    this.telephone = telephone;
    this.roomNumber = roomNumber;
    this.researchAreas = [];
}

Staff.prototype = user.User.prototype;
Staff.prototype.staffJSON = function () {
    var obj = this.partJSON();
    obj.profile = {
        job_title: this.jobTitle,
        email: this.email,
        telephone: this.telephone,
        roomnumber: this.roomNumber
    };

    if (this.researchAreas.length > 0) {
        obj.profile.research = this.researchAreas;
    }
    return obj;
};
Staff.prototype.addResearchArea = function (areaToAdd) {

    var indexOfArea = this.researchAreas.findIndex(function (currentArea) {
        return currentArea == areaToAdd;
    });

    if (indexOfArea != -1)
        throw new errors.ElementInUseError("Area already added!");

    this.researchAreas.push(areaToAdd);

};
Staff.prototype.removeResearchArea = function (areaToRemove) {

    var indexOfArea = this.researchAreas.findIndex(function (currentArea) {
        return currentArea == areaToRemove;
    });

    if (indexOfArea == -1)
        throw new errors.NoSuchElementError("No such area!");

    this.researchAreas.splice(indexOfArea, 1);

};

function isValidStaff(staff) {

    if (!user.isValidUser(staff))
        return false;

    if (staff.profile == undefined)
        return false;

    if (staff.profile.job_title == undefined || staff.profile.roomnumber == undefined)
        return false;

    if (staff.profile.email == undefined || staff.profile.telephone == undefined)
        return false;

    return validator.isEmail(staff.profile.email) &&
        validator.isMobilePhone(staff.profile.telephone, "en-GB");

}

exports.Staff = Staff;
exports.isValidStaff = isValidStaff;