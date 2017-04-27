
var app = require('../../app');


class Project {
    constructor(name ) {
        this.name = name;
    }
    

    static getAllProjects(customerid) {
        var collection = app.db.get('projects');
        return collection.find({ customerid: customerid }, { sort: { name: 1 }} );
    }


    static getActiveProjects(customerid) {
        var collection = app.db.get('projects');
        return collection.find({ customerid: customerid, isactive: true }, { sort: { name: 1 }} );
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


exports.Project = Project;