var express = require('express');
var router = express.Router();

var api_prefix = '/api';


var err_hdl = require('./error_handler');
var users = require('./dal/users/users');
var projects = require("./dal/projects/projects");

var customers = require("./dal/customers/customers");



var sql_client = require("./sql_server/sql_client");



router.get(api_prefix + '/hello', hello);


router.post(api_prefix + '/users/login', checkLogin);
router.get(api_prefix + '/users/add', userAdd);
router.get(api_prefix + '/users/all', usersAll);

router.post(api_prefix + '/projects', projectAdd);
router.get(api_prefix + '/projects', projectsAll);

router.get(api_prefix + '/customers', customersAll);

router.get(api_prefix + '/sql/customers/get', getCustomers);
router.get(api_prefix + '/sql/customers/import', importCustomers);



function getCustomers(req, res) {

    sql_client.GetCustomers().then((response) => {
        res.json(response);
    }).catch((err) => {
        res.json(err);
    })
    
}


function importCustomers(req, res) {
    sql_client.GetCustomers().then((response) => {

        console.log('importing', response.length, " rows");
        
            
            customers.Customer.save(response).then((save_response) => {
                
                
                console.log("Imported: ", response.length, " rows");
                res.json({ status: 'ok', rows: response.length});
                
            }).catch((err) => {
                console.log('SaveCustomerErr: ', err); res.json(err)
            });
        
        
    }).catch((err) => {
        res.json(err);
    })
}

function customersAll(req, res) {
    customers.Customer.getAllCustomers().then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
}

function checkLogin(req, res) {

    if (!err_hdl.checkRequiredParam(res, 'userAdd', 'Username', req.body.Username )) return;
    if (!err_hdl.checkRequiredParam(res, 'userAdd', 'Password', req.body.Password )) return;

    const params = { Username: req.body.Username, Password: req.body.Password };
    var response = users.User.checkLogin(params.Username, params.Password).then((response) => 
    {
        res.json(response);
    }).catch((err) => { res.json(err)});

    
}

function usersAll(req, res) {


    users.User.getAllUsers().then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
}


function userAdd(req, res) {

    if (!err_hdl.checkRequiredParam(res, 'userAdd', 'Username', req.body.Username )) return;
    if (!err_hdl.checkRequiredParam(res, 'userAdd', 'Password', req.body.Password )) return;

    
    res.end('user added successfully');
}




function hello(req, res) {
    res.end('Yes.  we say hello sometimes.');
}


// currently unsecured
function projectAdd(req, res) {

    if (!err_hdl.checkRequiredParam(res, 'projectAdd', 'Name', req.body.Name )) return;

    var project_name = req.body.Name;
    projects.Project.add(project_name).then(function(response) {
        res.end('project added');
    }).catch(function(err) {
        res.json(err);
    })
}


function projectsAll(req, res) {

    projects.Project.getAllProjects().then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
}
module.exports = router;