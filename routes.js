var express = require('express');
var router = express.Router();

var api_prefix = '/api';


var err_hdl = require('./error_handler');
var users = require('./dal/users/users');



router.get(api_prefix + '/hello', hello);


router.post(api_prefix + '/users/login', checkLogin);
router.get(api_prefix + '/users/add', userAdd);
router.get(api_prefix + '/users/all', usersAll);


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

module.exports = router;