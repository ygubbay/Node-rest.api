
var Connection = require('tedious').Connection;  
    var config = {  
        userName: 'sa',  
        password: 'Spawick',  
        server: 'localhost',  
        // When you connect to Azure SQL Database, you need these next options.  
        options: {database: 'Timesheeter'}  
    };  
    
    
    var connection = new Connection(config);

    connection.on('connect', (err) => {

        if (!err) {
                    console.log("Connected: ");  
                    
                }
                else 
                {
                    console.log("Connection error: " + err);
                    
                }
    });
    
    function connectToSql() {
        
        console.log('Connecting...');
        const p = new Promise(function(resolve, reject) {


            
            connection.on('connect', function(err) {  
                
                if (!err) {
                    console.log("Connected: ");  
                    resolve(connection);
                }
                else 
                {
                    console.log("Connection error: " + err);
                    reject(err);
                }
                
            });

            connection.on('infoMessage', infoError);
            connection.on('errorMessage', infoError);
            connection.on('debug', function(text) {
                console.log(text);
            })  

        });

        console.log('connectToSql promise returned');
        return p;

        
    }


    function infoError(err) {
        console.log(err);
    }

    var Request = require('tedious').Request;  
    var TYPES = require('tedious').TYPES;  

    function getCustomers() {  
        console.log('getCustomers');
        console.log('------------');
        const p = new Promise(function(resolve, reject) {

            request = new Request("SELECT customerid, name, datecreated, firstname, lastname, subscriptiontypeid, affiliateid, subscriptionid, countryname, address1, address2, city, email, fax, phone, website, logofile, invoiceculturename, invoiceindex, currencyid   from Customers", function(err) {  
            if (err) {  
                console.log(err);}  
                reject(err);
            });  
            var result = "";  
            
            var rows_obj = [];

            request.on('row', function(columns) {  

                var result_obj = {};    

                
                columns.forEach(function(column) {  
                

                    if (column.metadata.type.type == 'DATETIME') {
                        result_obj[column.metadata.colName] = new Date(column.value);
                    } 
                    else {
                        result_obj[column.metadata.colName] = column.value;
                    }
                    
                });  
                console.log('result_obj: ' + JSON.stringify(result_obj));
                rows_obj.push(result_obj);
            });  

            request.on('doneProc', function(rowCount, more) {  
                console.log('request.done:');  
                resolve(rows_obj);
            });  
            connection.execSql(request);  
                
        });

        return p;
    }  


    function getTSEntries() {

        return getSqlData('TSEntries', `SELECT tsentryid, projectid, entrydate,starttime ,
        endtime  ,description,billable,[break],userid,isinvoiced  FROM TSEntries`);
    }


   function getInvoices() {

        return getSqlData('Invoices', `SELECT [invoiceid]
                            ,[projectid]
                            ,[invoicedate]
                            ,[invoicestatusid]
                            ,[paymentdate]
                            ,[amount]
                            ,[datecreated]
                            ,[singleuser_yn]
                            ,[monthlyinvoice_yn]
                            ,[mo_periodyear]
                            ,[mo_periodmonth]
                            ,[salestax]
                            ,[taxtotal]
                            ,[amounttotal]
                            ,[comment]
                            ,[invoicenumber] FROM [Invoices]`);
    }


    function getProjects() {
        return getSqlData('Projects', `SELECT [projectid]
                            ,[name]
                            ,[startdate]
                            ,[enddate]
                            ,[custcompanyname]
                            ,[custcontactname]
                            ,[custcontactemail]
                            ,[custcontactphone]
                            ,[invoicefolder]
                            ,[customerid]
                            ,[monthlyinvoiceyn]
                            ,[paymenttermsnumber]
                            ,[paymenttermsmonthyn]
                            ,[salestax]
                            ,[culturekey]
                            ,[isactive]
                            ,[invoicefileprefix] from Projects`);
    }

    function getSqlData(table_name, sql) {  
        console.log(table_name);
        console.log('------------');
        const p = new Promise(function(resolve, reject) {

            request = new Request(sql, function(err) {  
            if (err) {  
                console.log(err);}  
                reject(err);
            });  
            var result = "";  
            
            var rows_obj = [];

            request.on('row', function(columns) {  

                var result_obj = {};    

                
                columns.forEach(function(column) {  
                

                    if (column.metadata.type.type == 'DATETIME') {
                        result_obj[column.metadata.colName] = new Date(column.value);
                    } 
                    else {
                        result_obj[column.metadata.colName] = column.value;
                    }
                    
                });  
                console.log('result_obj: ' + JSON.stringify(result_obj));
                rows_obj.push(result_obj);
            });  

            request.on('doneProc', function(rowCount, more) {  
                console.log('request.done:');  
                resolve(rows_obj);
            });  
            connection.execSql(request);  
                
        });

        return p;
    }  


    exports.ConnectToSql = connectToSql;
    exports.GetCustomers = getCustomers;
    exports.GetTSEntries = getTSEntries;
    exports.GetProjects = getProjects;
    exports.GetInvoices = getInvoices;