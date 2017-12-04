/***********************************************************************************
 *
 * Model for Web2
 *
 ***********************************************************************************/

(function () { // wrap into a function to scope content

    /***********************************************************************************
     * Module imports and exports - to work in browser and node.js
     ***********************************************************************************/
    var moduleExports = {
        errors: require('./classes/errors'),
        user: require('./classes/user'),
        staff: require('./classes/staff'),
        dissertation: require('./classes/dissertation'),
        student: require('./classes/student')
    };

    if (typeof __dirname == 'undefined') {
        window.hello = moduleExports;
        // remember to add the following to the page:
        // https://www.npmjs.com/package/validator
    }
    else module.exports = moduleExports;
})();
