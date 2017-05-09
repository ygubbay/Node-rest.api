const fs = require('fs');
var pdfMakePrinter = require('pdfmake/src/printer');
var fonts = {
        Roboto: {
            normal: 'fonts/Roboto-Medium.ttf',
            bold: 'fonts/Squarish Sans CT Regular SC.ttf',
            italics: 'fonts/Roboto-Bold.ttf',
            bolditalics: 'fonts/Roboto-BoldItalic.ttf'
        },
        Hebrew: {
            normal: 'fonts/Squarish Sans CT Regular.ttf',
            bold: 'fonts/Squarish Sans CT Regular SC.ttf',
            italics: 'fonts/Squarish Sans CT Regular.ttf',
            bolditalics: 'fonts/Squarish Sans CT Regular.ttf'
        },
        Nachlaot: {
            normal: 'fonts/Nachlaot.ttf',
            bold: 'fonts/Nachlaot.ttf',
            italics: 'fonts/Nachlaot.ttf',
            bolditalics: 'fonts/Nachlaot.ttf'
        }
};


function example1(res) {
    
    const invoice = {
        from_company: {
            name: 'Nu Solutions',
            number: '319210738',
            is_company: false
        },
        to: {
            name: 'Enerview',
            person_name: 'Alon Eisenberg'
        },
        logo_file: 'images/image.png',
        invoice_number: '10172',
        todos: [ { invoicedate: new Date(),
                    description: '123 PublicSite license agreement', 
                    duration: '02:14', 
                    amount: 405 },
                 { invoicedate: new Date(),
                    description: '123 PublicSite license agreement', 
                    duration: '02:14', 
                    amount: 405 },
                { invoicedate: new Date(),
                    description: '123 PublicSite license agreement', 
                    duration: '02:14', 
                    amount: 405 },
                { invoicedate: new Date(),
                    description: '123 PublicSite license agreement', 
                    duration: '02:14', 
                    amount: 405 }
                    ]
    }

    const from_company_type = (invoice.from_company.is_company ? 'חפ: ': 'עוסק מורשה').split("").reverse().join("");

var PdfPrinter = require('pdfmake/src/printer');
    var printer = new PdfPrinter(fonts);


    var table_todos = [];
    table_todos.push([ 'Date', 'Description', 'Duration', 'Total' ]);
    for (var i=0; i<invoice.todos.length; i++)
    {
        let todo = invoice.todos[i];
        table_todos.push([ { text: leftpad(todo.invoicedate.getDate(), 2, '0') + '-' + leftpad(todo.invoicedate.getMonth()+1, 2, '0'), 
                                fontSize: 10},
                            { text: todo.description, fontSize: 10 },
                            { text: todo.duration.toString(), fontSize: 10 },
                            { text: todo.amount.toString(), fontSize: 10 }]);
    }
                           

    var docDefinition = {
        content: [
            { columns: [ 
                { text: invoice.from_company.name, width: '75%',  },
                { text: 'חשבונית מס'.split('').reverse().join(''), width: '20%', font: 'Nachlaot', fontSize: 18 }  
                  ]              
            },
            { columns: [ 
                { text: 'עוסק מורשה:  '.split('').reverse().join(''), font: 'Nachlaot', fontSize: 16, width: '80%',  },
                { text: invoice.invoice_number, width: '20%', color: 'red' }  
                  ]              
            },
            
            { text: invoice.from_company.number, fontSize: 12 },
            { text: 'מקור'.split('').reverse().join(''), font: 'Nachlaot', fontSize: 24, color: 'red' },

            {  image: invoice.logo_file, width: 100, height: 100,  absolutePosition: {x:400, y:90} },
            {
                margin: [0, 100, 0, 0],
                columns: [
                    {
                    width: '15%',
                    text: 'Invoice to:'
                    },
                    {
                    width: '80%',
                    text: invoice.to.name
                    },
                    
                ]
            },
            {
                columns: [
                    {
                    width: '15%',
                    text: 'Contact:'
                    },
                    {
                    width: '80%',
                    text: invoice.to.person_name
                    },
                    
                ]
            },

            { table: {
                headerRows: 1,
                widths: [ 100, 250, 60, 60 ],
                body: table_todos                        
                },
              margin: [0, 15, 0, 0]
            }
            ]};

    var pdfDoc = printer.createPdfKitDocument(docDefinition);

    var ss = (new Date()).getSeconds();
    pdfDoc.pipe(fs.createWriteStream('pdf/4000' + ss + '.pdf'));

    pdfDoc.end();

    res.json({ finished: true})
}


function leftpad (str, len, ch) {
  str = String(str);

  var i = -1;

  if (!ch && ch !== 0) ch = ' ';

  len = len - str.length;

  while (++i < len) {
    str = ch + str;
  }

  return str;
}


exports.example1 = example1;