var sparqler = require('sparqling-star');
var sparqler = new sparqler.Client();

var myquery = 'SELECT DISTINCT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10';
sparqler.send( myquery, function( error, data ) {
    console.log( data.results.bindings );
});
console.log('a');
console.log(myquery);
