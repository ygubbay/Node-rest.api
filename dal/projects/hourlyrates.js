
var app = require('../../app');


class HourlyRate {
    constructor(name ) {
        this.name = name;
    }
    static import(obj) {
        
        console.log('HourlyRates.import start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('HourlyRates');
            collection.insert(obj).then((response)=> {

                console.log(JSON.stringify({ status: true, error: null }));
                resolve( { status: true, error: null });
            }).catch((err) => { 
                console.log(err);  
                console.log(JSON.stringify({status: false, error: err}));
                reject( {status: false, error: err})});

        });
    
        return p;
    }

    static getAllRates(customerid) {
        var collection = app.db.get('HourlyRates');
        return collection.find({ customerid: customerid }, { sort: { name: 1 }} );
    }

    static getProjectRates(projectid) {
        console.log('getProjectRates: projectid', projectid);

        var collection = app.db.get('HourlyRates');
        return collection.find( { projectid: projectid, active: true }  )
    }

    static getProjectUserRate(projectid, userid) {

        console.log('getProjectUserRate: projectid', projectid, 'userid', userid);

        var collection = app.db.get('HourlyRates');
        return collection.find( { projectid: projectid, userid: userid, active: true }  )
    }



    static save(obj) {

        console.log('Project.save start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('projects');
            collection.insert(obj).then((response)=> {

                console.log(JSON.stringify({ status: true, error: null }));
                resolve( { status: true, error: null });
            }).catch((err) => { 
                console.log(err);  
                console.log(JSON.stringify({status: false, error: err}));
                reject( {status: false, error: err})});

        });
    
        return p;
    }
    static add(project_name) {

        const p = new Promise(function(resolve, reject) {

        //const invalidUser = { status: 401, msg: 'Invalid username or password'};
        var collection = app.db.get('projects');

        // should very project does not exist or have a duplicate key + err

        var project = {
            name: project_name
        }
        collection.insert(project).then((response) => {
            resolve( { status: 200, msg: 'OK'});

        }).catch((err) => { console.log(err); reject( err)});

    });
    return p;

    }

}


exports.HourlyRate = HourlyRate;