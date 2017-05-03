
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


    static getMonthly(yyyyMM) {

        var year = parseInt(yyyyMM.substr(0, 4));
        var month = parseInt(yyyyMM.substr(4, 2))-1;

        const fromDate = new Date(Date.UTC(year, month, 1));

        const toYear = month == 12 ? year + 1: year;
        const toMonth = month < 12 ? month + 1 : 1;
        const toDate = new Date(Date.UTC(toYear, toMonth, 1));

        var collection = app.db.get('TSEntries');

         return collection.aggregate(
        [{ $match: { $and: [{ entrydate: { $gte: fromDate  }},
                                         { entrydate: { $lt: toDate }}]}}, 
         { $lookup: { from: "projects", localField: "projectid", foreignField: "projectid", as: "projects"}}
         ,{ $project: { tsentryid: 1, projectid: 1, entrydate: 1, starttime: 1, endtime: 1, 
             description: 1, billable: 1, break: 1, userid: 1, isinvoiced: 1, 'projects.name': 1 }  }
         ]);

        
    }

    static getProjectMonthly(projectid, yyyyMM) {

        console.log('getProjectMonthly', projectid, yyyyMM);

        var year = parseInt(yyyyMM.substr(0, 4));
        var month = parseInt(yyyyMM.substr(4, 2))-1;

        const fromDate = new Date(Date.UTC(year, month, 1));

        const toYear = month == 12 ? year + 1: year;
        const toMonth = month < 12 ? month + 1 : 1;
        const toDate = new Date(Date.UTC(toYear, toMonth, 1));

        var collection = app.db.get('TSEntries');

         return collection.aggregate(
        [{ $match: { $and: [{ entrydate: { $gte: fromDate  }},
                                         { entrydate: { $lt: toDate }},
                                         { projectid: projectid }  ]}}, 
         { $lookup: { from: "projects", localField: "projectid", foreignField: "projectid", as: "projects"}}
         ,{ $project: { tsentryid: 1, projectid: 1, entrydate: 1, starttime: 1, endtime: 1, 
             description: 1, billable: 1, break: 1, userid: 1, isinvoiced: 1, 'projects.name': 1 }  }
         ]);

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


    static getDailyStats(yyyyMMdd) {

        const p = new Promise(function(resolve, reject) {

            var yr = parseInt(yyyyMMdd.substr(0, 4));
            var mm = parseInt(yyyyMMdd.substr(4, 2))-1;
            var dd = parseInt(yyyyMMdd.substr(6, 2));
            
            var selectedDay = new Date(Date.UTC(yr, mm, dd, 0, 0, 0, 0));
            console.log('todos.getDailyStats:', selectedDay.toUTCString());
            //
            // 1. Daily minutes
            //
            // get all todos for the selectedDay
            const collection = app.db.get('TSEntries');
            collection.find({ entrydate: selectedDay}).then((response) => {

                console.log('todos.DailyStats: daily todos - ', JSON.stringify(response.length));
                var daily_todos = response;
                var daily_minutes = 0;
                for (var i=0; i<daily_todos.length; i++)
                {
                    const todo = daily_todos[i];
                    console.log("todo: ", JSON.stringify(todo))
                    console.log("todo.starttime", todo.starttime);
                    console.log("todo.endtime", todo.endtime);
                    console.log("Todo.diffMinutes(todo.starttime, todo.endtime)", Todo.diffMinutes(todo.starttime, todo.endtime));
                    daily_minutes += Todo.diffMinutes(todo.starttime, todo.endtime) - todo.break;
                    if (daily_minutes == NaN)
                    {
                        reject({ is_error: true, message: 'invalid date in todo: ' +  JSON.stringify(todo) });
                        return;
                    }
                }

                
                //
                // 2. Weekly minutes
                //
                const selectedDayOfWeek = selectedDay.getDay();


                let firstDayOfWeek = new Date(selectedDay);
                firstDayOfWeek.setUTCDate(selectedDay.getUTCDate() - selectedDayOfWeek);

                let lastDayOfWeek = new Date(selectedDay);        
                lastDayOfWeek.setUTCDate(selectedDay.getUTCDate() + 7 - selectedDayOfWeek);

                console.log('todos.getDailyStats: week - ', firstDayOfWeek.toUTCString(), lastDayOfWeek.toUTCString());

                collection.find( { $and: [{ entrydate: {$gte: firstDayOfWeek}},
                                        { entrydate: {$lt: lastDayOfWeek}}
                                            ] }).then((weekly_response) => {

                    console.log('todos.DailyStats: weekly todos - ', JSON.stringify(weekly_response.length));
                    var weekly_todos = weekly_response;
                    var weekly_minutes = 0;

                    for (var i=0; i<weekly_todos.length; i++)
                    {
                        const tw = weekly_todos[i];

                        weekly_minutes += Todo.diffMinutes(tw.starttime, tw.endtime) - tw.break;
                        if (weekly_minutes == NaN)
                        {
                            reject({ is_error: true, message: 'invalid date in todo: ' +  JSON.stringify(tw) });
                            return;
                        }
                    }
                    
                    //
                    // 3. Montly minutes
                    //
                    const selectedMonth = selectedDay.getMonth();

                    let firstDayOfMonth = new Date(selectedDay);
                    firstDayOfMonth = new Date(Date.UTC(selectedDay.getFullYear(), selectedMonth, 1));

                    const nextMonth = selectedMonth == 11 ? 0: selectedMonth + 1;
                    const nextYear = selectedMonth == 11 ? selectedDay.getFullYear() + 1: selectedDay.getFullYear();

                    console.log('nextMonth: ', nextMonth, "nextYear: ", nextYear);
                    let firstDayNextMonth = new Date(Date.UTC(nextYear, nextMonth, 1));
                    firstDayNextMonth.setUTCDate(firstDayNextMonth.getUTCDate() - 1);
                    console.log('thisMonth: firstDayNextMonth', firstDayNextMonth)

                    collection.find( { $and: [{ entrydate: {$gte: firstDayOfMonth}},
                                        { entrydate: {$lte: firstDayNextMonth}}
                                            ] }).then((month_response) => {

                        console.log('todos.DailyStats: monthly todos - ', JSON.stringify(month_response.length));
                        var monthly_todos = month_response;
                        var monthly_minutes = 0;
                        for (var i=0; i<monthly_todos.length; i++)
                        {
                            const todo = monthly_todos[i];
                            monthly_minutes += Todo.diffMinutes(todo.starttime, todo.endtime) - todo.break;
                            if (monthly_minutes == NaN)
                            {
                                const err_msg = 'invalid date in todo: ' +  JSON.stringify(todo);
                                reject({ is_error: false, message: err_msg });
                                return;
                            }
                            console.log('monthly_minutes: ', monthly_minutes)
                        }

                        resolve( { is_error: false, daily_minutes, weekly_minutes, monthly_minutes } );
                    }).catch((monthly_err) => {
                        reject ({ is_error: true, message: "MonthlyFind: " + monthly_err })
                    })


                }).catch((weekly_err) => {
                    reject ({is_error: true, message: "WeeklyFind: " + weekly_err }) 
                })

  

            }).catch((daily_err) => {
                reject({is_error: true, message: "DailyFind: " + daily_err })
            })
        });

        return p;
    }


    static diffMinutes(timeStart, timeEnd) {

        console.log('diffMinutes: timeStart [', timeStart, '], [', timeEnd, ']');
        var msDiff = timeEnd - timeStart;

        var hr = msDiff / 3600000;
        var mn = hr > 0 ? (msDiff % ( hr * 3600000)): msDiff / 60000 ;
        console.log('diffMinutes: msDiff [', msDiff, ', [', hr, '], [', mn, ']');
        return (mn + (hr * 60));
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

                // date conversion
                obj.starttime = new Date(obj.starttime);
                obj.endtime = new Date(obj.endtime);

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