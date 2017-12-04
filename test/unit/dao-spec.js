/**
 * Unit tests for DAO layer part.
 */
var expect = require('chai').expect;
var dao = require('../../js/data_access_operations.js');
var model = require('../../js/model.js');

function _clearDAO() {
    // Clear any leftover objects from other test functions.
    dao.deleteAllUsers("admin");
    dao.deleteAllDissertations("admin");
}

describe('Operations with dissertations tests:', function () {

    it('GET get all dissertations', function () {

        _clearDAO();

        var student = new model.student.Student("student1", "pass", "given", "surname");
        dao.createUser(student.studentJSON(), "admin");

        var staff = new model.staff.Staff("abc", "pass", "g", "s", "jt", "abc@email.com", "+447464721642", "rn");
        dao.createUser(staff.staffJSON(), "admin");

        var diss0 = new model.dissertation.Dissertation("id10", "title", "desc", student);
        dao.createDissertation(diss0, student.userid);

        var diss1 = {
            id: 123,
            title: "Software Distribution",
            description: {
                outline: "outline",
                aims: ["first", "second"]
            }
        };
        dao.createDissertation(diss1, staff.userid);
        diss1.proposer = staff.userid;
        diss1.proposer_role = "staff";
        diss1.supervisor = staff.userid;

        var allDiss = dao.getAllDissertations(student.userid);
        expect(allDiss.length).to.equal(2);
        expect(JSON.stringify(allDiss[0])).to.equal(JSON.stringify(diss0.dissJSON()));
        expect(JSON.stringify(allDiss[1])).to.equal(JSON.stringify(diss1));

        var student2 = new model.student.Student("student2", "pass", "given", "surname");
        dao.createUser(student2.studentJSON(), "admin");
        allDiss = dao.getAllDissertations(student2.userid);
        expect(allDiss.length).to.equal(1);
        expect(JSON.stringify(allDiss[0])).to.equal(JSON.stringify(diss1));

        diss0 = diss0.dissJSON();
        diss0.interests = [student.userid];
        diss1.interests = [student.userid];
        dao.expressInterest(diss1.id, student.userid, student.userid);

        allDiss = dao.getAllDissertations(staff.userid);
        expect(allDiss.length).to.equal(2);
        expect(JSON.stringify(allDiss[0])).to.equal(JSON.stringify(diss0));
        expect(JSON.stringify(allDiss[1])).to.equal(JSON.stringify(diss1));

    });

    it('GET get specific dissertation', function () {

        _clearDAO();

        var student = new model.student.Student("student1", "pass", "given", "surname");
        dao.createUser(student.studentJSON(), "admin");

        var diss = new model.dissertation.Dissertation("id10", "title", "desc", student);
        dao.createDissertation(diss.dissJSON(), student.userid);

        expect(JSON.stringify(dao.getDissertation(diss.id, student.userid)))
            .to.equal(JSON.stringify(diss.dissJSON()));

        expect(function () {
            dao.getDissertation("random id", student.userid)
        }).to.throw(model.errors.NoSuchElementError);

        var staff = new model.staff.Staff("abc", "pass", "g", "s", "jt", "abc@email.com", "+447464721642", "rn");
        diss.setSupervisor(staff);
        dao.createUser(staff.staffJSON(), "admin");
        dao.associateSupervisor(diss.id, staff.userid, staff.userid);

        expect(JSON.stringify(dao.getDissertation(diss.id, student.userid)))
            .to.equal(JSON.stringify(diss.dissJSON()));

        diss.addInterest(student);
        expect(JSON.stringify(dao.getDissertation(diss.id, staff.userid)))
            .to.equal(JSON.stringify(diss.dissJSON()));

    });

    it('POST create new dissertation', function () {

        _clearDAO();

        var proposer = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        dao.createUser(proposer.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", proposer);
        dao.createDissertation(diss.dissJSON(), proposer.userid);
        diss.setSupervisor(proposer);

        expect(JSON.stringify(dao.getDissertation("diss1", proposer.userid)))
            .to.equal(JSON.stringify(diss.dissJSON()));

        var student1 = new model.student.Student("js01", "pass", "John", "Smith");
        var student2 = new model.student.Student("js02", "pass", "John", "Smith");
        dao.createUser(student1.studentJSON(), "admin");
        dao.createUser(student2.studentJSON(), "admin");
        diss = {
            id: 123,
            title: "Software Distribution",
            description: {
                outline: "outline",
                aims: ["first", "second"]
            }
        };
        dao.createDissertation(diss, student1.userid);
        expect(function () {
            dao.createDissertation(diss, student2.userid);
        }).to.throw(model.errors.ElementInUseError);

        diss.proposer = student1.userid;
        diss.proposer_role = "student";

        expect(JSON.stringify(dao.getDissertation("123", student1.userid)))
            .to.equal(JSON.stringify(diss));

        diss.interests = [student1.userid];

        expect(JSON.stringify(dao.getDissertation("123", proposer.userid)))
            .to.equal(JSON.stringify(diss));

        expect(function () {
            dao.createDissertation(diss, student2.userid);
        }).to.throw(model.errors.ElementInUseError);

        diss = {
            id: 456,
            title: "Software Distribution",
            description: {
                outline: "outline",
                aims: ["first", "second"]
            }
        };
        expect(function () {
            dao.createDissertation(diss, "admin");
        }).to.throw(model.errors.ValidationError);

    });

    it('DELETE delete dissertation', function () {

        _clearDAO();

        var proposer = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        dao.createUser(proposer.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", proposer);
        dao.createDissertation(diss.dissJSON(), proposer.userid);
        diss.setSupervisor(proposer);

        var notproposer = new model.student.Student("stu1", "p", "given", "surname");
        dao.createUser(notproposer.studentJSON(), "admin");

        expect(function () {
            dao.deleteDissertation(diss.id, notproposer.userid);
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.deleteDissertation("bad id", proposer.userid);
        }).to.throw(model.errors.NoSuchElementError);

        dao.deleteDissertation(diss.id, proposer.userid);
    });

    it('PUT update existing dissertation', function () {

        _clearDAO();

        var proposer = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        dao.createUser(proposer.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", proposer);
        dao.createDissertation(diss.dissJSON(), proposer.userid);
        diss.setSupervisor(proposer);

        var updatedDiss = {
            title: "New Title"
        };
        expect(function () {
            dao.updateDissertation(updatedDiss, "bad id", proposer.userid);
        }).to.throw(model.errors.NoSuchElementError);

        expect(function () {
            dao.updateDissertation(updatedDiss, diss.id, "not the proposer");
        }).to.throw(model.errors.ValidationError);

        dao.updateDissertation(updatedDiss, diss.id, proposer.userid);
        expect(dao.getDissertation(diss.id, proposer.userid).title).to.equal(updatedDiss.title);

    });

    it('POST show interest', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        var student = new model.student.Student("js01", "pass", "John", "Smith");
        dao.createUser(student.studentJSON(), "admin");
        dao.createUser(staff.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss.dissJSON(), staff.userid);
        diss.setSupervisor(staff);

        expect(function () {
            dao.expressInterest("bad id", student.userid, student.userid);
        }).to.throw(model.errors.NoSuchElementError);

        expect(function () {
            dao.expressInterest(diss.id, staff.userid, staff.userid);
        }).to.throw(model.errors.ValidationError);

        dao.expressInterest(diss.id, student.userid, student.userid);
        var interests = dao.getDissertation(diss.id, staff.userid).interests;
        expect(interests.length).to.equal(1);
        expect(interests[0]).to.equal(student.userid);

        expect(function () {
            dao.expressInterest(diss.id, student.userid, student.userid);
        }).to.throw(model.errors.ElementInUseError);

    });

    it('POST assign dissertation', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        var student = new model.student.Student("js01", "pass", "John", "Smith");
        dao.createUser(student.studentJSON(), "admin");
        dao.createUser(staff.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss.dissJSON(), staff.userid);
        diss.setSupervisor(staff);

        expect(function () {
            dao.allocateDissertation(diss.id, student.userid, staff.userid);
        }).to.throw(model.errors.ValidationError);

        dao.expressInterest(diss.id, student.userid, student.userid);

        expect(function () {
            dao.allocateDissertation(diss.id, student.userid, student.userid);
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.allocateDissertation("not a dissertation", student.userid, staff.userid);
        }).to.throw(model.errors.NoSuchElementError);

        dao.allocateDissertation(diss.id, student.userid, staff.userid);
        expect(dao.getDissertation(diss.id, staff.userid).assigned).to.equal("already assigned");
        expect(dao.retrieveUser(student.userid, staff.userid).assigned_dissertation).to.equal(diss.id);

        expect(function () {
            dao.allocateDissertation(diss.id, student.userid, staff.userid);
        }).to.throw(model.errors.ElementInUseError);

    });

});

describe('Operations with users tests:', function () {

    it('PUT create a new user', function () {

        _clearDAO();

        var userToCreate = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "Beta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(userToCreate, "admin");
        expect(JSON.stringify(dao.retrieveUser("abc", "admin"))).to.equal(JSON.stringify(userToCreate));

        dao.deleteUser("abc", "admin");
        userToCreate = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "Beta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0",
                research: ["software engineering", "AI"]
            }
        };
        dao.createUser(userToCreate, "admin");
        expect(JSON.stringify(dao.retrieveUser("abc", "admin"))).to.equal(JSON.stringify(userToCreate));

        expect(function () {
            dao.createUser(userToCreate, "admin");
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.createUser("not a valid user", "admin");
        }).to.throw(model.errors.ValidationError);

        var invalidStaff = {
            userid: "asdf",
            password: "pass",
            role: "staff",
            given: "Alfred",
            surname: "Pennyworth"
        };
        expect(function () {
            dao.createUser(invalidStaff, "admin");
        }).to.throw(model.errors.ValidationError);

        var staffWithRepeatEmailAndPhone = {
            userid: "newuid",
            password: "pass",
            role: "staff",
            given: "Gamma",
            surname: "Delta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        expect(function () {
            dao.createUser(staffWithRepeatEmailAndPhone, "admin");
        }).to.throw(model.errors.ElementInUseError);

        dao.deleteUser("abc", "admin");
        // Admin-only:
        expect(function () {
            dao.createUser(userToCreate, "not admin");
        }).to.throw(model.errors.ValidationError);

    });

    it('DELETE delete user', function () {

        _clearDAO();

        var usr = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "Beta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(usr, "admin");
        expect(JSON.stringify(dao.retrieveUser("abc", "admin"))).to.equal(JSON.stringify(usr));

        expect(function () {
            dao.deleteUser("abc", "not admin");
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.deleteUser("missing id", "admin");
        }).to.throw(model.errors.NoSuchElementError);

        dao.deleteUser("abc", "admin");

        expect(function () {
            dao.retrieveUser("abc");
        }).to.throw(model.errors.NoSuchElementError);

    });

    it('PUT update existing user', function () {

        _clearDAO();

        var usr = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "Beta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(usr, "admin");
        expect(JSON.stringify(dao.retrieveUser(usr.userid, "admin"))).to.equal(JSON.stringify(usr));

        usr.password = "new_password";
        expect(JSON.stringify(dao.retrieveUser(usr.userid, "admin"))).to.not.equal(JSON.stringify(usr));

        expect(function () {
            dao.updateUser(usr, usr.userid);
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.updateUser(usr, "not the real id", "admin");
        }).to.throw(model.errors.NoSuchElementError);

        expect(function () {
            dao.updateUser("not a valid user json", usr.userid, "admin");
        }).to.throw(model.errors.ValidationError);

        dao.updateUser({userid: usr.userid, password: usr.password}, usr.userid, "admin");
        expect(JSON.stringify(dao.retrieveUser(usr.userid, "admin"))).to.equal(JSON.stringify(usr));

    });

    it('GET get all users', function () {

        _clearDAO();

        var usrs = dao.getAllUsers();

        expect(usrs.length).to.equal(0);

        var usr0 = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "A",
            profile: {
                job_title: "lecturer",
                email: "alpha@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(usr0, "admin");

        var usr1 = {
            userid: "def",
            password: "pass",
            role: "student",
            given: "Beta",
            surname: "B"
        };
        dao.createUser(usr1, "admin");

        usrs = dao.getAllUsers("admin");
        expect(usrs.length).to.equal(2);
        expect(JSON.stringify(usrs[0])).to.equal(JSON.stringify(usr0));
        expect(JSON.stringify(usrs[1])).to.equal(JSON.stringify(usr1));

        delete usr0.password;
        delete usr1.password;
        usrs = dao.getAllUsers();
        expect(JSON.stringify(usrs[0])).to.equal(JSON.stringify(usr0));
        expect(JSON.stringify(usrs[1])).to.equal(JSON.stringify(usr1));

    });

    it('GET get specific user', function () {

        _clearDAO();

        var usr = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "Beta",
            profile: {
                job_title: "lecturer",
                email: "abc@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(usr, "admin");
        expect(JSON.stringify(dao.retrieveUser("abc", "admin"))).to.equal(JSON.stringify(usr));

        delete usr.password;
        expect(JSON.stringify(dao.retrieveUser("abc"))).to.equal(JSON.stringify(usr));

        expect(function () {
            dao.retrieveUser("missing id", "admin");
        }).to.throw(model.errors.NoSuchElementError);

    });

    it('GET get all staff members', function () {

        _clearDAO();

        expect(dao.getAllStaffMembers().length).to.equal(0);

        var student = new model.student.Student("student1", "pass", "Given", "Surname");
        dao.createUser(student.studentJSON(), "admin");

        expect(dao.getAllStaffMembers().length).to.equal(0);
        expect(dao.getAllUsers().length).to.equal(1);

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "staff@email.com", "+447945682156", "RN");
        dao.createUser(staff.staffJSON(), "admin");
        expect(dao.getAllUsers().length).to.equal(2);

        var staffMembers = dao.getAllStaffMembers("admin");
        expect(staffMembers.length).to.equal(1);
        expect(JSON.stringify(staffMembers[0])).to.equal(JSON.stringify(staff.staffJSON()));

        delete staff.password;
        staffMembers = dao.getAllStaffMembers();
        expect(JSON.stringify(staffMembers[0])).to.equal(JSON.stringify(staff.staffJSON()));

    });

});

describe('Additional operations tests:', function () {

    it('DELETE delete all users', function () {

        _clearDAO();
        expect(dao.getAllUsers().length).to.equal(0);

        var usr0 = {
            userid: "abc",
            password: "pass",
            role: "staff",
            given: "Alpha",
            surname: "A",
            profile: {
                job_title: "lecturer",
                email: "alpha@email.com",
                telephone: "+447123456789",
                roomnumber: "JC0.0"
            }
        };
        dao.createUser(usr0, "admin");

        var usr1 = {
            userid: "def",
            password: "pass",
            role: "student",
            given: "Beta",
            surname: "B"
        };
        dao.createUser(usr1, "admin");

        expect(dao.getAllUsers().length).to.equal(2);

        expect(function () {
            dao.deleteAllUsers("not admin");
        }).to.throw(model.errors.ValidationError);

        dao.deleteAllUsers("admin");
        expect(dao.getAllUsers().length).to.equal(0);

    });

    it('DELETE delete all dissertations', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        var student = new model.student.Student("js01", "pass", "John", "Smith");
        dao.createUser(student.studentJSON(), "admin");
        dao.createUser(staff.staffJSON(), "admin");

        var diss0 = new model.dissertation.Dissertation("diss0", "title", "desc", student);
        dao.createDissertation(diss0.dissJSON(), student.userid);

        var diss1 = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss1.dissJSON(), staff.userid);

        expect(dao.getAllDissertations(student.userid).length).to.equal(2);

        expect(function () {
            dao.deleteAllDissertations("not admin");
        }).to.throw(model.errors.ValidationError);

        dao.deleteAllDissertations("admin");
        expect(dao.getAllDissertations(student.userid).length).to.equal(0);

    });

    it('DELETE undo interest', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        var student = new model.student.Student("js01", "pass", "John", "Smith");
        dao.createUser(student.studentJSON(), "admin");
        dao.createUser(staff.staffJSON(), "admin");

        var diss1 = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss1.dissJSON(), staff.userid);
        diss1.setSupervisor(staff);
        dao.expressInterest(diss1.id, student.userid, student.userid);

        expect(dao.getDissertation(diss1.id, staff.userid).interests.length).to.equal(1);

        expect(function () {
            dao.undoInterestExpression(diss1.id, staff.userid, staff.userid);
        }).to.throw(model.errors.ValidationError);

        var diss2 = new model.dissertation.Dissertation("diss2", "title", "desc", staff);
        dao.createDissertation(diss2.dissJSON(), staff.userid);

        expect(function () {
            dao.undoInterestExpression(diss2.id, student.userid, student.userid);
        }).to.throw(model.errors.ValidationError);

        dao.undoInterestExpression(diss1.id, student.userid, student.userid);
        expect(dao.getDissertation(diss1.id, staff.userid).interests).to.equal(undefined);

    });

    it('DELETE undo dissertation assignment', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        var student = new model.student.Student("js01", "pass", "John", "Smith");
        dao.createUser(student.studentJSON(), "admin");
        dao.createUser(staff.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss.dissJSON(), staff.userid);
        diss.setSupervisor(staff);
        dao.expressInterest(diss.id, student.userid, student.userid);
        dao.allocateDissertation(diss.id, student.userid, staff.userid);

        expect(function () {
            dao.unallocateDissertation(student.userid, student.userid);
        }).to.throw(model.errors.ValidationError);

        expect(function () {
            dao.unallocateDissertation("bad userid", staff.userid);
        }).to.throw(model.errors.NoSuchElementError);

        dao.unallocateDissertation(student.userid, staff.userid);
        expect(dao.getDissertation(diss.id, staff.userid).assigned).to.equal(undefined);

    });

    it('POST associate supervisor', function () {

        _clearDAO();

        var staff = new model.staff.Staff("staff1", "pass", "G", "S", "JT", "example@mail.com", "+447464721642", "JC0.0");
        dao.createUser(staff.staffJSON(), "admin");
        var staff2 = new model.staff.Staff("staff2", "p", "G", "S", "JT", "staff2@mail.com", "+447452865954", "rn");
        dao.createUser(staff2.staffJSON(), "admin");

        var diss = new model.dissertation.Dissertation("diss1", "title", "desc", staff);
        dao.createDissertation(diss.dissJSON(), staff.userid);
        diss.setSupervisor(staff);

        expect(function () {
            dao.associateSupervisor("invalid diss id", staff2.userid);
        }).to.throw(model.errors.NoSuchElementError);

        dao.associateSupervisor(diss.id, staff2.userid);
        expect(dao.getDissertation(diss.id, staff.userid).supervisor).to.equal(staff2.userid);

    })

});