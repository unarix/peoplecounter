var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = 3000;

// Lanzo el chrome ni bien levanto la app
const ChromeLauncher = require('chrome-launcher');
ChromeLauncher.launch({
    startingUrl: 'http://localhost:3000/counter',
    chromeFlags: ['--kiosk']
}).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
});

// Continuo con la carga del resto
const fs = require('fs');
const path = require('path');
const router = express.Router();

app.use('/', router);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'express')));

router.get('/counter',function(req,res){
    res.sendFile(path.join(__dirname+'/express/counter.html'));
});
// Esta llamada recibe el webhook de la camara y lo guarda en json
app.post('/', function (req, res) {
    var body = req.body;
    console.log(body);
    var rule_name = body.rule_name;
    var event_time = body.event_time;

    console.log(rule_name, event_time);

    let rawdata = fs.readFileSync('counts.json');
    let a = JSON.parse(rawdata);

    if(rule_name.includes('Salida'))
        a.salidas = a.salidas + 1;
    else
        a.entradas = a.entradas + 1;

    console.log(a);

    let data = JSON.stringify(a);
    fs.writeFileSync('counts.json', data);

    res.json({
        message: 'ok'
    });
});

// Esta llamada retorna las entradas y salidas del json
app.get('/', function (req, res) {
    let rawdata = fs.readFileSync('counts.json');
    let a = JSON.parse(rawdata);
    res.json(a);
});

// Esta llamada resetea los contadores
app.get('/reset', function (req, res) {
    var a = new Object(); 
    a.salidas = 0;
    a.entradas = 0;
    let data = JSON.stringify(a);
    fs.writeFileSync('counts.json', data);
    res.json(a);
});

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('El tablero esta corriendo en http://%s:%s', host, port);
});