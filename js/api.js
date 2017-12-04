/***********************************************************************************
 * RESTful API implementation for Web2
 ***********************************************************************************/

var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var dao = require('./data_access_operations.js');

(function () {

    module.exports = {
        runApp: runApp,
        configureApp: configureApp, // separates out from runApp for testing
    };

    /***********************************************************************************
     * Express Application
     ***********************************************************************************/

    /**
     * Run the app on the default port 8080. Makes use of configurApp to set up the
     * processing pipeline.
     */
    function runApp() {
        var app = express();
        configureApp(app);
        app.listen(8080);
    }

    /**
     * Configure the app processing pipeline. Call directly instead of runApp() for
     * testing with test doubles.
     */
    function configureApp(app) {

        app.use(bodyParser.json());
        app.use(express.static('static'));
        app.route('/dissertation')
            .get(function (request, response) {
                _wrapper(request, response, getDissertationAll);
            })
            .post(function (request, response) {
                _wrapper(request, response, postDissertation);
            })
            .delete(function (request, response) {
                _wrapper(request, response, deleteDissertationAll);
            });

        app.route('/dissertation/:id')
            .get(function (request, response) {
                _wrapper(request, response, getDissertationId);
            })
            .delete(function (request, response) {
                _wrapper(request, response, deleteDissertationId);
            })
            .put(function (request, response) {
                _wrapper(request, response, putDissertationId);
            });

        app.route('/user/:id')
            .put(function (request, response) {
                _wrapper(request, response, putUserIdCREATE, putUserIdUPDATE);
            })
            .get(function (request, response) {
                if (request.params.id == "staff")
                    _wrapper(request, response, getUserStaff);

                else _wrapper(request, response, getUserId);
            })
            .delete(function (request, response) {
                _wrapper(request, response, deleteUserId);
            });

        app.get('/user', function (request, response) {
            _wrapper(request, response, getUserAll);
        });

        app.route('/dissertation/:id/interest/:userid')
            .post(function (request, response) {
                _wrapper(request, response, postDissertationIdInterestUserid);
            })
            .delete(function (request, response) {
                _wrapper(request, response, deleteDissertationIdInterestUserid);
            });

        app.post('/dissertation/:id/allocation/:userid', function (request, response) {
            _wrapper(request, response, postDissertationIdAllocationUserid);
        });
        app.delete('/dissertation/allocation/:userid', function (request, response) {
            _wrapper(request, response, deleteDissertationIdAllocationUserid);
        });

        app.post('/supervise/dissertation/:id', function (request, response) {
            _wrapper(request, response, postSuperviseDissertationId);
        });
    }

    /**
     * Authentication function.
     */
    var auth = require('basic-auth');

    function basicAuth(req) {

        var user = auth(req);

        if (!user)
            return undefined;

        else try {
            var userFound = dao.retrieveUser(user.name, "admin");
            if (userFound.password != user.pass)
                return undefined;

            return userFound;
        }
        catch (err) {
            return undefined;
        }

    }

    /**
     * Code in every handler.
     */
    function _wrapper(request, response, actualHandler, backUpHandler) {

        var user = basicAuth(request);

        if (user == undefined) {
            response.writeHead(401);
            response.end('Authentication required!');
            return;
        }

        try {
            response.json(actualHandler(request, user.userid));
        }
        catch (err) {

            if (backUpHandler != undefined)
                return _wrapper(request, response, backUpHandler);

            var errorCode;
            if (err.name == "ValidationError")
                errorCode = 406;

            else if (err.name == "ElementInUseError")
                errorCode = 409;

            else if (err.name == "NoSuchElementError")
                errorCode = 404;

            else errorCode = 400;

            response.writeHead(errorCode);
            response.end(err.message);
        }
    }

    /***********************************************************************************
     * Handler Functions
     ***********************************************************************************/

    function getDissertationAll(request, clientId) {
        return dao.getAllDissertations(clientId);
    }

    function postDissertation(request, clientId) {
        return dao.createDissertation(request.body, clientId);
    }

    function getDissertationId(request, clientId) {
        return dao.getDissertation(request.params.id, clientId);
    }

    function putUserIdCREATE(request, clientId) {
        return dao.createUser(request.body, clientId);
    }

    function putUserIdUPDATE(request, clientId) {
        return dao.updateUser(request.body, request.params.id, clientId);
    }

    function getUserId(request, clientId) {
        return dao.retrieveUser(request.params.id, clientId);
    }

    function deleteDissertationId(request, clientId) {
        return dao.deleteDissertation(request.params.id, clientId);
    }

    function putDissertationId(request, clientId) {
        return dao.updateDissertation(request.body, request.params.id, clientId);
    }

    function getUserAll(request, clientId) {
        return dao.getAllUsers(clientId);
    }

    function getUserStaff(request, clientId) {
        return dao.getAllStaffMembers(clientId);
    }

    function deleteUserId(request, clientId) {
        return dao.deleteUser(request.params.id, clientId);
    }

    function postDissertationIdInterestUserid(request, clientId) {
        return dao.expressInterest(request.params.id, request.params.userid, clientId);
    }

    function deleteDissertationIdInterestUserid(request, clientId) {
        return dao.undoInterestExpression(request.params.id, request.params.userid, clientId);
    }

    function postDissertationIdAllocationUserid(request, clientId) {
        return dao.allocateDissertation(request.params.id, request.params.userid, clientId);
    }

    function deleteDissertationIdAllocationUserid(request, clientId) {
        return dao.unallocateDissertation(request.params.userid, clientId);
    }

    function postSuperviseDissertationId(request, clientId) {
        return dao.associateSupervisor(request.params.id, clientId);
    }

    function deleteDissertationAll(request, clientId) {
        return dao.deleteAllDissertations(clientId);
    }

})();
