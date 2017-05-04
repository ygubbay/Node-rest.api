
var app = require('../../app');
var validate = require("validate.js");
var sequence = require('../sequence');

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
            comment: {
                presence: true
            },
            invoicenumber: {
                presence: true
            },
        }

        return validate(obj, constraints);
    }


static save(obj) {
        
        console.log('Invoices.save start');


        const p = new Promise(function(resolve, reject) {

            const validation_result = Invoice.validate(obj);
            console.log('validation result:', validation_result);

            if (validation_result != undefined)
            {
                reject( { is_error: true, is_valid: false, validation_result } );
            }
            else {

                // default fields
                obj.invoicenumber = 10000;
                
                const is_new = (!obj.invoiceid || !(obj.invoiceid > 0));    

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
                            resolve( { status: true, error: null });
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