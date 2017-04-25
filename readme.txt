Node REST Api

1. To start Node.js Application server (REST Api), 
run "node app.js"

2. To start Mongo database server, 
see mongo/start_server.bat

3. To start interactive mongo shell, 
see mongo/start_client.bat

4. Backup Mongo database (test db)
"\Program Files\MongoDB\Server\3.4\bin\mongodump" -d test -o c:\development\mongo_backup

5. Restore Mongo database (test db)
"\Program Files\MongoDB\Server\3.4\bin\mongorestore" -d db2 c:\development\mongo_backup\test

6. TODO - Daily backup, zip


Install 

1. To install Mongo as a service, 
see mongo/install_service.bat

2. Install Tedious - Node.js driver for Sql Server
npm install tedious --save
