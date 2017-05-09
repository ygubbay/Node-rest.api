
var app = require('../../app');
var validate = require("validate.js");
var sequence = require('../sequence');
var inv_entry = require('./invoiceentries');
var _ = require('lodash');
var rates = require('../projects/hourlyrates');



class Invoice {

constructor( ) {}


static import(obj) {
        
        console.log('Invoices.import start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('Invoices');
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
            invoiceid: {
                presence: true
            },
            projectid: {
                presence: true
            },
            invoicedate: {
                presence: true
            },
            invoicestatusid: {
                presence: true
            },
            paymentdate: {
                presence: true
            },
            amount: {
                presence: true
            },
            datecreated: {
                presence: true
            },
            singleuser_yn: {
                presence: true
            },
            monthlyinvoice_yn: {
                presence: true
            },
            mo_periodyear: {
                presence: true
            },
            mo_periodmonth: {
                presence: true
            },
            salestax: {
                presence: true
            },
            taxtotal: {
                presence: true
            },
            amounttotal: {
                presence: true
            },
            //comment: {
            //    presence: true
            //},
            invoicenumber: {
                presence: true
            },
        }

        return validate(obj, constraints);
    }


static getbyinvoiceid(invoiceid) {

    var collection = app.db.get('Invoices');
    //return collection.find( { invoiceid });

    return collection.aggregate( [{ $match: { invoiceid: invoiceid }},

                                   { $lookup: { from: "projects",  localField: "projectid", foreignField: "projectid", as: "projects" }}, 
                                   
                                   { $lookup: { from: "InvoiceStatuses",  localField: "invoicestatusid", foreignField: "invoicestatusid", as: "InvoiceStatuses" }}, 
                                   { $project: { 
                                    invoiceid: 1, invoicedate: 1, mo_periodyear: 1, mo_periodmonth: 1,
                                    invoicestatusid: 1, amount: 1, datecreated: 1, singleuser_yn: 1, monthlyinvoice_yn: 1, 
                                    paymentdate: 1, salestax: 1, amounttotal: 1, comment: 1, invoicenumber: 1,
                                    projectid: 1, 'projects.name': 1, 'InvoiceStatuses.name': 1 } }

    ])
}


static getpaged(pageindex, pagesize) {

    const start_point = (pageindex-1) * pagesize;

    var collection = app.db.get('Invoices');

    //return collection.find( {}, { sort: { invoiceid: -1 }, skip: start_point, limit: pagesize } );

    return collection.aggregate( [ { $match: { }},
                                   { $sort: { invoiceid: -1 } },
                                   { $skip : start_point },
                                   { $limit: pagesize },

                                   { $lookup: { from: "projects",  localField: "projectid", foreignField: "projectid", as: "projects" }}, 
                                   
                                   { $lookup: { from: "InvoiceStatuses",  localField: "invoicestatusid", foreignField: "invoicestatusid", as: "InvoiceStatuses" }}, 
                                   { $project: { 
                                    invoiceid: 1, invoicedate: 1, mo_periodyear: 1, mo_periodmonth: 1,
                                    invoicestatusid: 1, amount: 1, datecreated: 1, singleuser_yn: 1, monthlyinvoice_yn: 1, 
                                    paymentdate: 1, salestax: 1, amounttotal: 1, comment: 1, invoicenumber: 1,
                                    projectid: 1, 'projects.name': 1, 'InvoiceStatuses.name': 1 } },
                                    
                                     ]  );

 
}


static save(save_invoice) {

    const p = new Promise(function(resolve, reject) {

        Invoice.save_header(save_invoice.header).then((response) =>
        {

            // Header saved
            console.log('Invoice header saved:', JSON.stringify(response), '\n');
            
            // Get HourlyRates in the project
            rates.HourlyRate.getProjectRates(save_invoice.header.projectid).then((rates) =>
            {
 

                const invoiceid = response.data.invoiceid;


                var todos = [];
                console.log('invoiceid', invoiceid, ', rates:', rates);
                _.forEach(save_invoice.todos, function (value, index) 
                { 
                    
                    value.invoiceid = invoiceid; 

                    let current_rate = undefined;
                    _.forEach(rates, function(rate) {
                        if (rate.userid == value.userid)
                        {
                            current_rate = rate.amount;
                        }
                    })  
                    if (!current_rate)
                    {
                        console.log('No rate was found for invoice item ' + JSON.stringify(value), '\nrates:', rates);
                        reject('No rate was found for invoice item ' + JSON.stringify(value));
                        return;
                    }
                    value.hourlyrate = current_rate;
                    value.amount = current_rate * (((new Date(value.endtime))-(new Date(value.starttime)))/60000 - value.break) / 60;
                    todos.push(value);
                });
                

                inv_entry.InvoiceEntry.savelist(todos).then((todos_saved) =>
                {
                    console.log('invoice entries saved\n')

                    resolve(response);
                }).catch((err) => {
                    console.log('invoice entries save error')
                    const err_msg = (typeof(err) == 'object') ? JSON.stringify(err): err;

                    reject('Invoice.Save: ' + err_msg);      
                    return;
                })
            }).catch((err) => {
                reject(err);
                return;
            })

            
            
            

        }).catch((err) => {
            reject('Invoice.Save: ' + err);      
        })

        
    });

    return p;

}

static save_header(save_invoice) {
        
        console.log('Invoices.save start');

        //projectid, invoicedate, paymentdate, 

        const p = new Promise(function(resolve, reject) {

            let obj = {};

            obj.invoiceid = save_invoice.invoiceid ? parseInt(save_invoice.invoiceid): 0;
            obj.projectid = parseInt(save_invoice.projectid);
            obj.invoicedate = save_invoice.invoice_date;
            obj.mo_periodyear = save_invoice.invoice_year;
            obj.mo_periodmonth = save_invoice.invoice_month;
            

            // default fields
            obj.invoicestatusid = 1;   // status=Not Ready
            obj.amount = 0;
            
            var now = new Date(); 
            obj.datecreated = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

            obj.singleuser_yn = true;
            obj.monthlyinvoice_yn = true;

            // Add 2 weeks
            var payDate = new Date(obj.invoicedate);
            var numberOfDaysToAdd = 14;
            payDate.setDate(payDate.getDate() + numberOfDaysToAdd);
            obj.paymentdate = payDate;
            //
            // TODO: Need to get taxrate from Project data
            //
            obj.salestax = 17;

            obj.taxtotal = 0;
            obj.amounttotal = 0;
            obj.comment = '';
            obj.invoicenumber = 10000;

            const validation_result = Invoice.validate(obj);
            console.log('validation result:', validation_result);

            if (validation_result != undefined)
            {
                reject( { is_error: true, is_valid: false, validation_result } );
                return;
            }
            else {

                const is_new = (obj.invoiceid == 0);    

                var collection = app.db.get('Invoices');
                console.log('save mode:', (is_new ? 'new': ('update - ' + JSON.stringify({invoiceid: obj.invoiceid}))));
                                

                if (is_new) {
                    sequence.Sequence.getNextId('invoiceid')
                    .then((seq_rec) => {

                        console.log('invoices.save getNextId response:', seq_rec)

                        // got the id!!!
                        obj.invoiceid = seq_rec.seq;

                        collection.insert(obj).then((response)=> {

                            console.log('invoices.save insert response: ', response);
                            resolve( { status: true, 
                                        data: { invoiceid: response.invoiceid }, 
                                        error: null });
                        }).catch((err) => { 
                            console.log(err);  
                            reject( {status: false, error: err})
                        });
                    }).catch((err) => {

                        console.log('invoices.save sequence.getnextid:', err);
                        reject(err)
                    })
                }
                else {
                
                    collection.update({invoiceid: obj.invoiceid}, obj).then((response)=> {

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


exports.Invoice = Invoice