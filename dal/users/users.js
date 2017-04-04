
var app = require('../../app');


class User {
    constructor(username, password, first_name, last_name ) {
        this.username = username;
        this.password = password;
        this.first_name = first_name;
        this.last_name = last_name;
    }
    

    static getAllUsers() {
        var collection = app.db.get('users');
        return collection.find({}, {});
    }

    static checkLogin(username, password) {

        console.log('checkLogin: ', username)
        console.log('password is: ', password);

        const p = new Promise(function(resolve, reject) {

        const invalidUser = { status: 401, msg: 'Invalid username or password'};
        var collection = app.db.get('users');
        var login_user;
        collection.findOne({ username: username }).then((response) => {

            login_user = response;
            if (login_user) 
            {
                console.log('user found: ', login_user.username);
                console.log(response);
                if (login_user.password === password) {
                    resolve( { status: 200, msg: 'OK'});
                }
                else {
                    resolve( invalidUser );
                }

            }
            else {
                console.log('username not found: ', username);
                resolve( invalidUser );
            }


        }).catch((err) => { console.log(err); reject( invalidUser)});

    });
    return p;

    }

    static save() {
       
    }
}


exports.User = User;