
var app = require('../../app');
var validate = require("validate.js");
var sequence = require('../sequence');

class InvoiceEntry {

constructor( ) {}


static import(obj) {
        
        console.log('InvoiceEntries.import start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('InvoiceEntries');
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
            userid: {
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
            hourlyrate: {
                presence: true
            },
            amount: {
                presence: true
            },
            tsentryid: {
                presence: true
            }
        }

        return validate(obj, constraints);
    }


static getbyinvoiceid(invoiceid) {

    var collection = app.db.get('InvoiceEntries');
    return collection.find( { invoiceid });
}


static savelist(items) {
        
    console.log('InvoiceEntryies.savelist start: ', JSON.stringify(items));

    const p = new Promise(function(resolve, reject) {

            let item_list = [];
            
            //
            // Validate each item
            //
            for (var i=0; i<items.length; i++) {

                var item = items[i];
                let obj = {};
                obj.invoiceid = item.invoiceid;
                obj.userid = item.userid;
                obj.entrydate = item.entrydate;
                obj.starttime = item.starttime;
                obj.endtime = item.endtime;
                obj.description = item.description;
                obj.break = item.break;
                obj.hourlyrate = item.hourlyrate;
                obj.amount = item.amount;
                obj.tsentryid = item.tsentryid;

                const validation_result = InvoiceEntry.validate(obj);
                console.log('validation result:', validation_result);

                if (validation_result != undefined)
                {
                    reject( { is_error: true, is_valid: false, validation_result } );
                    return;
                }

                var collection = app.db.get('InvoiceEntries');

                sequence.Sequence.getNextId('invoiceentryid')
                .then((seq_rec) => {

                    console.log('invoiceentries.save getNextId response:', seq_rec)

                    // got the id!!!
                    obj.invoiceentryid = seq_rec.seq;

                    
                }).catch((err) => {

                    console.log('invoiceentryid.save sequence.getnextid:', err);
                    reject(err)
                    return;
                })

                item_list.push( obj );
            }
                
            var collection = app.db.get('InvoiceEntries');
            collection.insert(item_list).then((response)=> {

                console.log('invoiceentries.save insert response: ', response);
                resolve( { status: true, 
                            data: { invoiceentryid: response.invoiceentryid }, 
                            error: null });
            }).catch((err) => { 
                console.log(err);  
                reject( {status: false, error: err})
                return;
            });
        });
    
        return p;
    }

}


exports.InvoiceEntry = InvoiceEntry