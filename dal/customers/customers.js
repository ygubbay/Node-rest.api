
var app = require('../../app');


class Customer {
    constructor(customerid, name, datecreated, firstname, lastname, subscriptiontypeid, affiliateid, subscriptionid, countryname, address1, address2, city, email, fax, phone, website, logofile, invoiceculturename, invoiceindex, currencyid ) {

        
        this.customerid = customerid;
        this.name = name;
        this.datecreated = datecreated;
        this.firstname = firstname; 
        this.lastname = lastname; 
        this.subscriptiontypeid = subscriptiontypeid;
        this.affiliateid = affiliateid;
        this.subscriptionid = subscriptionid;
        this.countryname = countryname; 
        this.address1 = address1;
        this.address2 = address2; 
        this.city = city; 
        this.email = email; 
        this.fax = fax;
        this.phone = phone;
        this.website = website;
        this.logofile = logofile;
        this.invoiceculturename = invoiceculturename;
        this.invoiceindex = invoiceindex;
        this.currencyid = currencyid;

    }
    

    static CustomerFromObj(obj) {
        return new Customer(obj.customerid, obj.name, obj.datecreated, obj.firstname, obj.lastname, obj.subscriptiontypeid, 
                            obj.affiliateid, obj.subscriptionid, obj.countryname, obj.address1, obj.address2, 
                            obj.city, obj.email, obj.fax, obj.phone, obj.website, 
                            obj.logofile, obj.invoiceculturename, obj.invoiceindex, obj.currencyid);
    }


    static getAllCustomers() {
        var collection = app.db.get('Customers');
        return collection.find({}, {});
    }

    static save(obj) {

        console.log('Customer.save start');
        const p = new Promise(function(resolve, reject) {

            var collection = app.db.get('Customers');
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


exports.Customer = Customer;