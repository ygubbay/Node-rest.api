

var app = require('../../app');


class SecurityToken {

    constructor(username) {

        this.username = username;
    }

    expiry_minutes = 120;

    calculateExpiry() {

        var d1 = new Date();
        var d2 = new Date(d1);

        d2.setMinutes( d1.getMinutes() + expiry_minutes);
        return d2;
    }

    // add SecurityToken
    add(user) {

        const p = new Promise(function(resolve, reject) {

        var collection = app.db.get('tokens');

        // if exists, remove it, then update
        collection.findOne({ username: user.username }).then((response) => {

            if (response)
            {
                // update
                collection.update({ username: user.username }, { expiry_date: calculateExpiry()})
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
            }
            else {
                collection.insert( new SecurityToken(user.username) )                
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });

            }
        
         })

        return p;
    }

    // remove SecurityToken
    remove(token) {

    }

    // check valid = GetSecurityToken
    get(token) {
        var collection = app.db.get('tokens');
        return collection.findOne({ token });
    }
}