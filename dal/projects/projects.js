
var app = require('../../app');


class Project {
    constructor(name ) {
        this.name = name;
    }
    

    static getAllProjects() {
        var collection = app.db.get('projects');
        return collection.find({}, {});
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

    static save() {
       
    }
}


exports.Project = Project;