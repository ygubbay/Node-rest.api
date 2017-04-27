
var app = require('../../app');
var validate = require("validate.js");
var sequence = require('../sequence');


class Todo {
    constructor( ) {
        
    }


    static getAll() {
        var collection = app.db.get('TSEntries');
        return collection.find({}, {});
    }



    static getTodosByDay(yyyyMMdd) {

        console.log('todos:getTodosByDay', yyyyMMdd)
        var yr = parseInt(yyyyMMdd.substr(0, 4));
        var mm = parseInt(yyyyMMdd.substr(4, 2))-1;
        var dd = parseInt(yyyyMMdd.substr(6, 2));
         
        var entrydate = new Date(Date.UTC(yr, mm, dd, 0, 0, 0, 0));
        console.log('todos:getTodosByDay', entrydate);
        var collection = app.db.get('TSEntries');
        //return collection.find({ entrydate: entrydate }, { sort: { starttime: 1 }} );
        return collection.aggregate( 
        [{ $match: { entrydate: entrydate}}, 
         { $lookup: { from: "projects", localField: "projectid", foreignField: "projectid", as: "projects"}}
         ,{ $project: { tsentryid: 1, projectid: 1, entrydate: 1, starttime: 1, endtime: 1, 
             description: 1, billable: 1, break: 1, userid: 1, isinvoiced: 1, 'projects.name': 1 }  }
         ])
    }


    // inserts todo object with an id (save method - would update, here we add)
    static import(obj) {
        
        console.log('TSEntries.import start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('TSEntries');
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

    static validate(obj) {

        var constraints = {
            tsentryid: {
                presence: true
            },
            projectid: {
                presence: true
            },
            entrydate: {
                presence: true
            },
            starttime: {
                presence: true
            },
            endtime: {
                presence: true
            },
            description: {
                presence: true
            },
            break: {
                presence: true
            },
            userid: {
                presence: true
            },
            
        }

        return validate(obj, constraints);
    }


    static delete(tsentryid) {

        console.log('TSEntries.delete start:', tsentryid);
        const collection = app.db.get('TSEntries');
        return collection.remove({ tsentryid: tsentryid });
    }


    static getDailyStats(selectedDay) {

        //
        // 1. Daily minutes
        //
        // get all todos for the selectedDay

        //  sum of each item minutes = DATEDIFF(minute, starttime, endtime) - [break])

        // 2. Weekly minutes
        // select all entries from last sunday to end of the Week
        //  sum of each item minutes = DATEDIFF(minute, starttime, endtime) - [break])

        // 3. Montly minutes
        // select all entries from 1st of the month until end of the month
        //  sum of each item minutes = DATEDIFF(minute, starttime, endtime) - [break])
    }


    static save(obj) {
        
        console.log('TSEntries.save start');


        const p = new Promise(function(resolve, reject) {

            const validation_result = Todo.validate(obj);
            console.log('validation result:', validation_result);

            if (validation_result != undefined)
            {
                reject( { is_error: true, is_valid: false, validation_result } );
            }
            else {

                // default fields
                if (obj.isinvoiced == undefined)
                    obj.isinvoiced = false;
                
                if (obj.billable == undefined)
                    obj.billable = true;

                // auto correction
                var entrydate = new Date(obj.entrydate);
                entrydate.setUTCHours(0, 0, 0, 0);
                obj.entrydate = entrydate;

                const is_new = (!obj.tsentryid || !(obj.tsentryid > 0));    

                var collection = app.db.get('TSEntries');
                console.log('save mode:', (is_new ? 'new': ('update - ' + JSON.stringify({tsentryid: obj.tsentryid}))));
                                

                if (is_new) {
                    sequence.Sequence.getNextId('tsentryid')
                    .then((seq_rec) => {

                        console.log('todos.save getNextId response:', seq_rec)

                        // got the id!!!
                        obj.tsentryid = seq_rec.seq;

                        collection.insert(obj).then((response)=> {

                            console.log('todos.save insert response: ', response);
                            resolve( { status: true, error: null });
                        }).catch((err) => { 
                            console.log(err);  
                            reject( {status: false, error: err})
                        });
                    }).catch((err) => {

                        console.log('todos.save sequence.getnextid:', err);
                        reject(err)
                    })
                }
                else {
                
                    collection.update({tsentryid: obj.tsentryid}, obj).then((response)=> {

                        console.log('save response: ', response);
                        resolve( { status: true, error: null });
                    }).catch((err) => { 
                        console.log(err);  
                        reject( {status: false, error: err})
                    });
                }
            }

        });
    
        return p;
    }

    
 
}


exports.Todo = Todo;