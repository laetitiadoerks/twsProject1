const parser = require('fast-xml-parser');
const fs = require('fs');
const {v4: uuid} = require('uuid');

//connection a graphdb -> serveur
const GraphDB = require('graphdb-js');

let graphdb = new GraphDB({
    hostname: "localhost",
    repository: "tws_laetitia_valentin"
});

//definition des préfix -> pas utilisé
const schemeHeader = "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n" +
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n\n" +
    "@prefix : <http://cui.unige.ch/> . \n\n"

//connection dbpedia
var sparqler = require('sparqling-star');
var sparqler = new sparqler.Client();


/**
 * Query a DBpedia
 *
 */

 /*
 *TODO: faire la requete dbpedia pour chaqune des tracks
 */

// query sur les alentours des tracks
var resultsDBpedia ='';
var myquery = 'SELECT DISTINCT * WHERE { ?s geo:lat ?la . ?s geo:long ?lo . FILTER(?la>45.7970 AND ?la<45.8096 AND ?lo>6.3874 AND ?lo<6.4250) . }';
sparqler.send( myquery, function( error, data ) {
    // console.log( data.results.bindings[0].s.value );
    // console.log(typeof(data.results.bindings[0]));
    resultsDBpedia = data.results.bindings[0].s.value;
});
console.log('dbpedia query');
console.log(myquery);






/**
 * Query a GraphDB
 *
 */

const prefix = "prefix xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
            "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n" +
            "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
            "prefix cui: <http://cui.unige.ch/> \n"
            // console.log(prefix);


// query pour récupérer tous les POIs
const allPOIs = prefix + "select * where { ?s a cui:POI. }";

graphdb.Query.query(allPOIs, (err, data) => {
    // console.log(data);
    // console.log(err);
});

// query pour récuperer tous les POIs et leurs noms
const allPOIsName = prefix + "select * where {?s a cui:POI. ?s :name ?o .}";

graphdb.Query.query(allPOIsName, (err, data) => {

    // console.log(data);
    // console.log(err);
});



// query pour récupérer tous les trackname

const allTrackName = prefix +
    "select ?trk where {" +
	"?s a cui:trk." +
    "?s cui:name ?trk." +
    "}";

const resAllTrackName = [];
vari = '';

async function getAllTrackName() {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";

    await graphdb.Query.query(allTrackName, (err, data) => {
                // console.log(data[125]);
                const i = JSON.parse(data);
                // const obj = JSON.parse(data)
                // console.log(obj.poi);
                // resAllTrackName += data;
                // console.log(typeof(i));
                // console.log(i.results.bindings[1].trk.value);
                i.results.bindings.forEach((name, a) => {
                    // console.log(i.results.bindings[a].trk.value);
                    vari = i.results.bindings[a].trk.value;
                    resAllTrackName.push(vari);

                });

                // console.log(data);
            });
            // console.log(resAllPOIsByTrack);
            // return resAllTrackName;
};
getAllTrackName().then();



// query pour récuperer tous les pois par track


var resAllPOIsByTrack = [];
var tracksInfoArray = [];
var vara ='';
var tempo ='';

/*
*TODO: le faire pour la liste des trackname
*enlever lon et lat de la query
*/


async function getAllPOIsByTrack(trackname) {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";
    // var trackname2 = 'Refuge Maison Vieille - Refuge Bertone';
    resAllPOIsByTrack = [];
    vara ='';
    tempo ='';

    // "select ?namepoi ?lat ?lon where {" +
    var allPOIsByTrack = prefix +
        "select ?namepoi where {" +
    	"?s a cui:trk." +
        "?s cui:name \"" + trackname + "\"." +
        "?poi a cui:POI." +
        "?t a cui:trkpt." +
        "?t cui:hasClosePOI ?poi." +
        "?s cui:trackpoints ?t." +
        "?poi cui:lat ?lat." +
        "?poi cui:lon ?lon." +
        "?poi cui:name ?namepoi" +
        "}";
        // console.log(allPOIsByTrack);
        // setTimeout(function(){
        //     console.log('wait for 2000');
        //
        // }, 2000);
        // await

    await graphdb.Query.query(allPOIsByTrack, (err, data) => {
         // console.log('salut');
         // console.log(allPOIsByTrack);
         // console.log('data');
         //        console.log(data);
        var obj = JSON.parse(data)
        //console.log(typeof(obj));
        console.log(trackname);
        //console.log(obj);
        //console.log(obj.results.bindings);
        obj.results.bindings.forEach((name, a) => {

           vara = obj.results.bindings[a].namepoi.value;
           // console.log('vara');
           // console.log(vara);
           resAllPOIsByTrack.push(vara);
           // console.log('iiii');
           // console.log(resAllPOIsByTrack);
           //console.log(trackname);
        });
        tracksInfoArray.push([trackname, resAllPOIsByTrack]);
        resAllPOIsByTrack = [];
    });
            //TODO: faire tableau de poi pour une track

};

setTimeout(function(){
    resAllTrackName.forEach(trackname => {
        // console.log(resAllTrackName.indexOf(trackname));
        // console.log(trackname);
        getAllPOIsByTrack(trackname).then();
    });

}, 2000);

setTimeout(function () {
    console.log(tracksInfoArray);
}, 4100);

// getAllPOIsByTrack(resAllTrackName[0]).then()


/**
 * Affichage sur page HTML
 *
 */
const http = require('http');
const server = http.createServer();
server.listen(4000, 'localhost');

server.on('request', (request, response) => {
  const content_type = 'text/html; charset=utf-8';
  response.setHeader('Content-Type', content_type); // (1)

  response.write('<h1>Guide touristique des alentours des Montagnes autour du Mont Blanc</h1>');

  tracksInfoArray.forEach(tracksInfo => {
      response.write('<h2>Itinéraire:' + tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][0] + '</h2>');
      response.write('<p>');
      response.write(tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][1].reduce((a,b)=>a+' <br> '+b,''));
      response.write('<br>');
      response.write('<a href=\"' + resultsDBpedia + '\">' + resultsDBpedia + '</a>');
      response.write('</p>');
  });



  // response.write('<h2>Second itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[1] + '</h3>');
  // response.write('<p>');
  // response.write(tracksInfoArray[1].reduce((a,b)=>a+' <br> '+b,''));
  // response.write('<br>');
  // response.write('<a href=\"' + resultsDBpedia + '\">' + resultsDBpedia + '</a>');
  // response.write('</p>');


  // response.write('<h2>Troisième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[2] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Qutrième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[3] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Cinquième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[4] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Sixième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[5] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Septième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[6] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Huitième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[7] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');


  response.end();
});
