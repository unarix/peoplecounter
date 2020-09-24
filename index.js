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
    
    // De la llamada de la camara obtengo los datos que me importen
    var rule_name = body.rule_name;
    var event_time = body.event_time;
    
    console.log(rule_name, event_time);

    // Obtengo los últimos eventos 
    let rawdata = fs.readFileSync('counts.json');
    let eventos = JSON.parse(rawdata);

    // Creo el evento del webhook
    var a = new Object();
    a.salidas = 0;
    a.entradas = 0;
    if(rule_name.includes('Salida'))
        a.salidas = 1;
    else
        a.entradas = 1;
    a.hora = event_time;
    
    // Los cuento
    var contador = new Object();
    contador.salidas = 0;
    contador.entradas = 0;
    eventos.evento.forEach(element => {
        contador.salidas = contador.salidas + element.salidas;
        contador.entradas = contador.entradas + element.entradas;
    });

    // Si las salidas son menos que las entradas, y el hook es una salida, no la sumes a la lista!!!!! Básicamente se trata de un 'RESEGADO' por tanto lo ignoro
    if(contador.salidas >= contador.entradas && rule_name.includes('Salida'))
    {
        console.log("No cuento esta salida!");
    }
    else
    {
        eventos.evento.push(a); // Push al elemento nuevo en el objeto filtrado
    }

    //console.log(objeto.evento);

    //Guardo el nuevo objeto
    let data = JSON.stringify(eventos);
    fs.writeFileSync('counts.json', data);

    res.json({
        message: 'ok'
    });
});


// Esta llamada retorna las entradas y salidas del json
app.get('/', function (req, res) {

    // Cargo el json de las ultimas entradas
    let rawdata = fs.readFileSync('counts.json');
    let eventos = JSON.parse(rawdata);
    
    // creo una ventana de tiempo de 15 minutos.. soy un hacker!
    var date = new Date;
    desde = date.getTime() - (15 * 60000);
    hasta = date.getTime() + (15 * 60000);

    // obtengo la hora del ultimo ingreso o salida (ultimo evento).
    var last = new Date(Math.max.apply(null, eventos.evento.map(function(e) {
        return new Date(e.hora);
    })));

    // Si la ultima entrada o salida (ultimo evento) fue hace mas de X minutos, borra el contador.. ponelo en cero.
    if (last < desde){
        eventos = new Array();
        var a = new Object();
        a.salidas = 0;
        a.entradas = 0;
        a.hora = Date.now();
        eventos.push(a)
    
        let objeto = {
            evento: eventos
        };
    
        let data = JSON.stringify(objeto);
        fs.writeFileSync('counts.json', data);
        res.json(a);
    }
    else{
        // Creo el objeto para usarlo de contador
        var a = new Object();
        a.salidas = 0;
        a.entradas = 0;

        // por cada evento, conta las cantidades
        eventos.evento.forEach(element => {
            a.salidas = a.salidas + element.salidas;
            a.entradas = a.entradas + element.entradas;
        });

        //console.log(a);
        res.json(a);
    }
});

// Esta llamada resetea los contadores
app.get('/reset', function (req, res) {
    
    var eventos = new Array();
    var a = new Object();
    a.salidas = 0;
    a.entradas = 0;
    a.hora = Date.now();
    eventos.push(a)

    let objeto = {
        evento: eventos
    };

    let data = JSON.stringify(objeto);
    fs.writeFileSync('counts.json', data);
    res.json(objeto);
});

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('El tablero esta corriendo en http://%s:%s', host, port);
});