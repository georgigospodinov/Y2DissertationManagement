/**
 * Unit tests for model part of practical.
 */
var expect = require('chai').expect;
var model = require('../../js/model.js');

describe('User class tests:', function () {

    it('set user id', function () {
        var user = new model.user.User("uid", "pass", "role", "given", "surname");
        expect(user.userid).to.equal('uid');
        expect(user.password).to.equal('pass');
        expect(user.role).to.equal('role');
        expect(user.given).to.equal('given');
        expect(user.surname).to.equal('surname');
    });

    it('add dissertations to user', function () {
        var user = new model.user.User();
        var diss = new model.dissertation.Dissertation();

        user.addDissertation(diss);
        expect(user.dissertations[0]).to.equal(diss);
        expect(user.dissertations.length).to.equal(1);

        expect(function () {
            user.addDissertation(diss)
        }).to.throw(model.errors.ElementInUseError);
    });

    it('remove dissertations from user', function () {
        var user = new model.user.User();
        var diss = new model.dissertation.Dissertation();
        user.addDissertation(diss);
        expect(user.dissertations.length).to.equal(1);
        user.removeDissertation(diss);
        expect(function () {
            user.removeDissertation(diss);
        }).to.throw(model.errors.ValidationError);
        expect(user.dissertations.length).to.equal(0);
    });

    it('recognize invalid user', function () {

        var user = "not a user";
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User(undefined, "pass", "student", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("uid", undefined, "staff", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("uid", "pass", "role", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("uid", "pass", "role", undefined, "surname");
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("uid", "pass", "role", "given", undefined);
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("*", "pass", "student", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(false);

        user = new model.user.User("uid", "pass", "student", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(true);

        user = new model.user.User("uid", "pass", "staff", "given", "surname");
        expect(model.user.isValidUser(user)).to.equal(true);

    });

});

describe('Student class tests:', function () {

    it('assign dissertation to student', function () {

        var student = new model.student.Student();
        expect(function () {
            student.assignDissertation("not a dissertation");
        }).to.throw(model.errors.ValidationError);

        var diss = new model.dissertation.Dissertation();
        expect(function () {
            student.assignDissertation(diss);
        }).to.throw(model.errors.ValidationError);

        var staff = new model.staff.Staff("uid", "pass", "given", "surname", "jt", "email", "tel", "rn");
        diss.setSupervisor(staff);
        expect(function () {
            student.assignDissertation(diss);
        }).to.throw(model.errors.ValidationError);

        diss.addInterest(student);
        student.assignDissertation(diss);
        expect(student.assignedDissertation).to.equal(diss);

        expect(function () {
            student.assignDissertation(diss);
        }).to.throw(model.errors.ElementInUseError);

    });

    it('unassign dissertation from student', function () {

        var student = new model.student.Student();
        var diss = new model.dissertation.Dissertation();
        var staff = new model.staff.Staff("uid", "pass", "given", "surname", "jt", "email", "tel", "rn");
        diss.setSupervisor(staff);
        diss.addInterest(student);

        expect(function () {
            student.unassignDissertation();
        }).to.throw(model.errors.NoSuchElementError);

        student.assignDissertation(diss);
        expect(student.assignedDissertation).to.equal(diss);
        student.unassignDissertation();
        expect(student.assignedDissertation).to.equal(undefined);
        expect(function () {
            student.unassignDissertation();
        }).to.throw(model.errors.NoSuchElementError);


    });

});

describe('Staff class tests:', function () {

    it('add research areas to staff', function () {
        var staff = new model.staff.Staff();
        staff.addResearchArea("AI");
        expect(staff.researchAreas[0]).to.equal("AI");
        expect(function () {
            staff.addResearchArea("AI");
        }).to.throw(model.errors.NoSuchElementError);
        staff.addResearchArea("Software Engineering");
        expect(staff.researchAreas.length).to.equal(2);
    });

    it('remove research area from staff', function () {
        var staff = new model.staff.Staff();

        staff.addResearchArea("AI");
        expect(function () {
            staff.removeResearchArea("something-else")
        }).to.throw(model.errors.NoSuchElementError);

        staff.removeResearchArea("AI");
        expect(staff.researchAreas.length).to.equal(0);
        expect(function () {
            staff.removeResearchArea("AI")
        }).to.throw(model.errors.NoSuchElementError);

    });

    it('recognize invalid staff', function () {

        var user = new model.user.User("uid", "pass", "staff", "given", "surname");
        expect(model.staff.isValidStaff(user)).to.equal(false);

        user = {
            userid: "uid",
            password: "pass",
            role: "staff",
            given: "given",
            surname: "surname",
            profile: {
                job_title: "Lecturer"
            }
        };
        expect(model.staff.isValidStaff(user)).to.equal(false);

        user = {
            userid: "uid",
            password: "pass",
            role: "staff",
            given: "given",
            surname: "surname",
            profile: {
                job_title: "Lecturer",
                room_number: "JC0.00"
            }
        };
        expect(model.staff.isValidStaff(user)).to.equal(false);

        user = {
            userid: "uid",
            password: "pass",
            role: "staff",
            given: "given",
            surname: "surname",
            profile: {
                job_title: "Lecturer",
                room_number: "JC0.00",
                email:"not an email"
            }
        };
        expect(model.staff.isValidStaff(user)).to.equal(false);

        user = {
            userid: "uid",
            password: "pass",
            role: "staff",
            given: "given",
            surname: "surname",
            profile: {
                job_title: "Lecturer",
                room_number: "JC0.00",
                email:"uid@mail.com",
                telephone:"not a phone number"
            }
        };
        expect(model.staff.isValidStaff(user)).to.equal(false);

        user = {
            userid: "uid",
            password: "pass",
            role: "staff",
            given: "given",
            surname: "surname",
            profile: {
                job_title: "Lecturer",
                roomnumber: "JC0.00",
                email: "example@mail.com",
                telephone:"+447741258963"
            }
        };
        expect(model.staff.isValidStaff(user)).to.equal(true);
    });

});

describe('Dissertation class tests:', function () {

    it('add interest to the dissertation', function () {

        var diss = new model.dissertation.Dissertation();
        var user = new model.student.Student();
        diss.addInterest(user);
        expect(diss.interestedStudents.length).to.equal(1);
        expect(diss.interestedStudents[0]).to.equal(user);

        expect(function () {
            diss.addInterest(user);
        }).to.throw(model.errors.ElementInUseError);

        expect(user.dissertations[0]).to.equal(diss);
        expect(user.dissertations.length).to.equal(1);
    });

    it('remove interest from the dissertation', function () {

        var diss = new model.dissertation.Dissertation();
        var student = new model.student.Student();

        expect(function () {
            diss.removeInterest(student);
        }).to.throw(model.errors.NoSuchElementError);

        diss.addInterest(student);
        expect(diss.interestedStudents.length).to.equal(1);

        expect(function () {
            diss.removeInterest("not a student");
        }).to.throw(model.errors.ValidationError);

        diss.removeInterest(student);
        expect(diss.interestedStudents.length).to.equal(0);
        expect(student.dissertations.length).to.equal(0);

    });

    it('set supervisor to dissertation', function () {

        var staff = new model.staff.Staff("uid", "pass", "given", "surname", "jt", "email", "tel", "rn");
        var diss = new model.dissertation.Dissertation("dissID");

        diss.setSupervisor(staff);
        expect(diss.supervisor).to.equal(staff);
        expect(staff.dissertations[0]).to.equal(diss);

        var staff2 = new model.staff.Staff();
        diss.setSupervisor(staff2);
        expect(diss.supervisor).to.equal(staff2);
        expect(staff.dissertations.length).to.equal(0);

    });

    it('recognize invalid dissertation', function () {

        var diss = "not a dissertation";
        var staff = new model.staff.Staff("uid", "pass", "given", "surname", "jt", "email", "tel", "rn");
        expect(model.dissertation.isValidDissertation(diss)).to.equal(false);

        diss = new model.dissertation.Dissertation(undefined, "title", "desc", staff);
        expect(model.dissertation.isValidDissertation(diss)).to.equal(false);

        diss = new model.dissertation.Dissertation("id", undefined, "desc", staff);
        expect(model.dissertation.isValidDissertation(diss)).to.equal(false);

        diss = new model.dissertation.Dissertation("id", "title", "desc", staff);
        expect(model.dissertation.isValidDissertation(diss)).to.equal(true);

    });

});