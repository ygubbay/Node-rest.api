const fs = require('fs');
var pdfMakePrinter = require('pdfmake/src/printer');
var fonts = {
        Arial: {
            normal: 'fonts/arialuni.ttf',
            bold: 'fonts/arialuni.ttf',
            italics: 'fonts/arialuni.ttf',
            bolditalics: 'fonts/arialuni.ttf'
        },
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


function example1(res, print_inv) {
    

    const from_company_type = (print_inv.from_company.is_company ? 'חפ: ': 'עוסק מורשה').split("").reverse().join("");

    var PdfPrinter = require('pdfmake/src/printer');
    var printer = new PdfPrinter(fonts);
    const left_margin = 30;
    const footer_top = 760;

    var table_todos = [];
    table_todos.push([ 'Date', 'Description', 'Duration', 'Total' ]);
    for (var i=0; i<print_inv.todos.length; i++)
    {
        let todo = print_inv.todos[i];
        todo.invoicedate = new Date(todo.invoicedate);
        table_todos.push([ { text: leftpad(todo.invoicedate.getDate(), 2, '0') + '-' + leftpad(todo.invoicedate.getMonth()+1, 2, '0'), 
                                fontSize: 10},
                            { text: todo.description, fontSize: 10 },
                            { text: todo.duration.toString(), fontSize: 10 },
                            { text: formatCurrency(todo.amount), fontSize: 10 }]);
    }

    var total_rows = [];
    //total_rows.push( [ { text: 'Net total', fontSize: 10 }, { text: formatCurrency(print_inv.total.net), fontSize: 10 } ])
    //total_rows.push( [ { text: 'Vat total', fontSize: 10 }, { text: formatCurrency(print_inv.total.tax), fontSize: 10 } ])
    //total_rows.push( [ { text: 'print_inv total', fontSize: 10 }, { text: formatCurrency(print_inv.total.grand), fontSize: 10 } ])

    total_rows.push( [ { text: 'Net total', fontSize: 10 }, { text: print_inv.total.net.formatMoney(2, '.', ','), fontSize: 10 } ])
    total_rows.push( [ { text: 'Vat total', fontSize: 10 }, { text: print_inv.total.tax.formatMoney(2, '.', ','), fontSize: 10 } ])
    total_rows.push( [ { text: 'Total', fontSize: 10 }, { text: print_inv.total.grand.formatMoney(2, '.', ','), fontSize: 10 } ])
    
                           

    var docDefinition = {

        pageMargins: [ 40, 60, 40, 20 ],
        content: [
            { columns: [ 
                { text: print_inv.from_company.name, width: '75%',  },
                { text: 'חשבונית מס'.split('').reverse().join(''), width: '20%', font: 'Nachlaot', fontSize: 18 }  
                  ]              
            },
            { columns: [ 
                { text: 'עוסק מורשה:  '.split('').reverse().join(''), font: 'Nachlaot', fontSize: 18, width: '80%',  },
                { text: print_inv.invoice_number, width: '20%', color: 'red' }  
                  ]              
            },
            
            { text: print_inv.from_company.number, fontSize: 10 },
            { text: 'מקור'.split('').reverse().join(''), font: 'Nachlaot', fontSize: 24, color: 'green' },

            {  image: print_inv.logo_file, width: 100, height: 100,  absolutePosition: {x:400, y:100} },
            {
                margin: [0, 100, 0, 0],
                columns: [
                    {
                    width: '15%',
                    text: 'Invoice date:'
                    },
                    {
                    width: '80%',
                    text: new Date().toDateString()
                    },
                    
                ]
            },
            {
                                columns: [
                    {
                    width: '15%',
                    text: 'Invoice to:'
                    },
                    {
                    width: '80%',
                    text: print_inv.to.name
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
                    text: print_inv.to.person_name
                },
                    
                ]
            },

            // invoice todos
            { table: {
                headerRows: 1,
                widths: [ 100, 250, 60, 60 ],
                body: table_todos                        
                },
              margin: [0, 15, 0, 0]
            },

            // totals table
            {
                table: {
                    headerRows: 1,
                    widths: [ 60, 60 ],
                    body: total_rows
                },
                margin: [368, 10, 0, 0]
            },

            // footer 
            { columns: [
                { width: 250, 
                    text: 'Nu Solutions', fontSize: 12 },
                {
                    width: 300, 
                    text: '', fontSize: 8  }
                ], absolutePosition: { x: left_margin, y: footer_top }
            },
            {
                columns: [
                { width: 250, 
                    text: 'PO Box 705', fontSize: 8 },
                {
                    width: 50, 
                    text: 'Tel: ', fontSize: 8 },
                {  width: 200,
                   text: print_inv.from_company.phone_number, fontSize: 8  }
                ], absolutePosition: { x: left_margin, y: footer_top + 15 }
            },
            {
                columns: [
                { width: 250, 
                    text: 'Tsufim', fontSize: 8 },
                {
                    width: 50, 
                    text: 'Fax: ', fontSize: 8  },
                {
                    width: 200,
                    text: print_inv.from_company.fax_number, 
                    fontSize: 8
                }
                ], absolutePosition: { x: left_margin, y:  footer_top + 25 }
            },
            {
                columns: [
                { width: 250, 
                    text: 'Israel', fontSize: 8 },
                {
                    width: 50, 
                    text: 'Email: ',
                    fontSize: 8 },
                { width: 200,
                  text: print_inv.from_company.email, fontSize: 8  }
                ], absolutePosition: { x: left_margin, y: footer_top + 35 }
            },
            {
                columns: [
                { width: 250, 
                    text: '', fontSize: 8 },
                {
                    width: 50, 
                    text: 'Website: ',
                    fontSize: 8 },
                { width: 200,
                  text: print_inv.from_company.website, fontSize: 8  }
                ], absolutePosition: { x: left_margin, y: footer_top + 45 }
            }
        ]
        };
        

    var pdfDoc = printer.createPdfKitDocument(docDefinition);

    var ss = (new Date()).getSeconds();
    pdfDoc.pipe(fs.createWriteStream('pdf/4000' + ss + '.pdf'));

    pdfDoc.end();

    res.json({ finished: true})
}


function formatCurrency(amount) {
    return '₪' + amount.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "₪1,");
}

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };


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