var app = require('../app');


class Sequence {

    static getNextId(name) {

         var collection = app.db.get('counters');
        return collection.findOneAndUpdate(
                { name: name },
                { $inc: { seq: 1 } }
                
        );

        
    }

}

exports.Sequence = Sequence;