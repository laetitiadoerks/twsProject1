const parser = require('fast-xml-parser');
const fs = require('fs');
const {v4: uuid} = require('uuid');

const schemeHeader = "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n" +
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n\n" +
    "@prefix : <http://cui.unige.ch/> . \n\n"

var sparqler = require('sparqling-star');
var sparqler = new sparqler.Client();

// var myquery = 'SELECT DISTINCT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10';
var myquery = 'SELECT DISTINCT * WHERE { ?s geo:lat ?la . ?s geo:long ?lo . FILTER(?la>48.85 AND ?la<48.86 AND ?lo>2.351 AND ?lo<2.352) . } LIMIT 100';
sparqler.send( myquery, function( error, data ) {
    console.log( data.results.bindings );
});
console.log('a');
console.log(myquery);

// QUERY DES POIs
// PREFIX : <http://cui.unige.ch/>
// prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//
// prefix cui: <http://cui.unige.ch/>
//
// select * where {
// 	?s a cui:POI.
// }

// QUERY DES NAME DE POIs
// PREFIX : <http://cui.unige.ch/>
// prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//
// prefix cui: <http://cui.unige.ch/>
//
// select * where {
// 	?s a cui:POI.
//     ?s :name ?o .
// }
