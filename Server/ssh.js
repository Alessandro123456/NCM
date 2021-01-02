var Clientssh = require('ssh2').Client;
var express = require("express");
var app = express();
const pg = require('pg');
var cors = require('cors')
var bodyParser = require("body-parser");
var expressWs = require('express-ws')(app);
var fs = require('fs')
var WsController = require("./WebConsole");

//keycloak
const Keycloak = require('keycloak-connect');
var keycloakConfig ={
  "realm": "NCM",
  "auth-server-url": "http://localhost:8081/auth/",
  "ssl-required": "external",
  "resource": "node-js-server",
  "verify-token-audience": true,
  "credentials": {
    "secret": "c7436c90-a23b-48b6-8ed2-f56e7ea0b65c"
  },
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  "policy-enforcer": {}
}
var keycloak = new Keycloak({},keycloakConfig);
app.use( keycloak.middleware( ));
//finekeycloakconfiguration

//credenziali DB
let DB_USER = 'postgres'
let DB_IP = 'localhost'
let DB_NAME = 'gematica_credenziali'
let DB_PWD = 'post'
let DB_PORT = '5432'

app.use(bodyParser.urlencoded({ extended: false }));
const conString = "postgres://" + DB_USER + ":" + DB_PWD + "@" + DB_IP + ":" + DB_PORT + "/" + DB_NAME;
const pool = new pg.Pool({ connectionString: conString })
//fine DB

app.use(express.json())

//riuse
app.use(cors());

/*
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', "*")
  next();
  });
  */

 app.ws('/client:numberclient/:device',WsController);

//--------------------------------PART MAINTANCE---------------------------------------------------------------


app.get("/viewdatabase",keycloak.protect("MAINTENANCE"),function(req,result){
  result.setHeader('Content-Type', 'text/html');
  const query = "SELECT  u.campo_idclient,u.nome,u.cognome,d.device_dispositivo,d.nome_dispositivo,d.indirizzo_ip,d.interfaccia,u.username,u.password FROM ((device d JOIN utente u on u.device_id=d.device_dispositivo) );"
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.get("/viewuser",keycloak.protect("MAINTENANCE"),function(req,result){
  result.setHeader('Content-Type', 'text/html');
  const query = "SELECT id, nome, device_id, cognome, username, password, campo_idclient FROM public.utente;"
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.get("/viewdevice",keycloak.protect("MAINTENANCE"),function(req,result){
  result.setHeader('Content-Type', 'text/html');
  const query = "SELECT device_dispositivo, nome_dispositivo, indirizzo_ip, interfaccia, descrizione FROM public.device;"
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.post("/adddevice",keycloak.protect('MAINTENANCE'),function (req, result) {
  let data = req.body
  console.log("add_device" ,data)
  console.log("data.nome",data.nomedisp)
  const query = "INSERT INTO public.device(device_dispositivo, nome_dispositivo, indirizzo_ip, interfaccia, descrizione) VALUES ('"+data.id+"','"+ data.nomedisp+"','"+ data.indirizzoip+"','" + data.interfaccia+"','"+ data.descrizione+"');";
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.post("/adduser",keycloak.protect('MAINTENANCE'),function (req, result) {
  let data = req.body
  const query = "INSERT INTO public.utente(id, nome, device_id, cognome, username, password, campo_idclient) VALUES ('"+data.iduser+"','"+ data.nomeutente+"','"+ data.deviceid+"','" + data.cognomeutente+"','"+ data.usurnamedevice+"','"+data.passworddevice+"','"+data.campo_idclient+"');"
  console.log("add_user" ,data)
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.post("/deleteuser",keycloak.protect('MAINTENANCE'),function (req, result) {
  let data = req.body
  const query = "DELETE FROM public.utente WHERE id = '"+data.id+"';"
  console.log("deleteuser" ,data)
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})
app.post("/deletedevice",keycloak.protect('MAINTENANCE'),function (req, result) {
  let data = req.body
  const query = "DELETE FROM public.device WHERE device_dispositivo='"+data.id+"';"
  console.log("delitedevice" ,data)
  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
})


//--------------------------------PART OPERATOR--------------------------------------------------------------
//GET HISTORY
app.get("/client:numberclient/:device",keycloak.protect('OPERATOR'),function (req, result) {
  result.setHeader('Content-Type', 'text/html');
  router = req.params.device;

  const query = "SELECT ora_connessione FROM ((connessione c JOIN utente u on c.utente_id=u.id) " +
    "JOIN device d on d.device_dispositivo=c.device_id) WHERE u.campo_idclient='" + req.params.numberclient + "' and d.nome_dispositivo='" 
    + router + "' order by id_seriale desc";

  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
});

//GET COMANDI
app.get("/client:numberclient/:device/comandi", keycloak.protect('OPERATOR'),function (req, result) {
  console.log("GET_COMANDI")
  result.setHeader('Content-Type', 'text/html');
  router = req.params.device;

  const query = "SELECT comando FROM ((comandi c JOIN utente u on c.utente_id=u.id) " +
    "JOIN device d on d.device_dispositivo=c.device_id) WHERE u.campo_idclient='" + req.params.numberclient +
    "' and d.nome_dispositivo='" + router + "' ORDER BY c.id_tabella asc";

  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log("Invio dei comandi: ", res.rows)
      result.send(res.rows)
    }
  });
});


//delete lista comandi
app.get("/client:numberclient/delete/:device",keycloak.protect('OPERATOR'), function (req, result) {
  console.log("DELETE")
  result.setHeader('Content-Type', 'text/html');
  router = req.params.device;
  client = req.params.numberclient;
  console.log("client", client)

  const query = "delete from comandi where comandi.device_id IN (select device_dispositivo FROM device d " +
    "INNER JOIN comandi c on c.device_id = d.device_dispositivo INNER JOIN utente u on u.device_id = c.device_id WHERE u.campo_idclient='" + client +
    "' and d.nome_dispositivo='" + router + "')";

  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log("risposta")
      result.send(res)
    }
  });
});


//GET DISPOSITIVI
app.get("/client:numberclient",keycloak.protect('OPERATOR'),function (req, result) {
  console.log("GET")
  result.setHeader('Content-Type', 'text/html');
  const query = "SELECT d.nome_dispositivo, d.descrizione, d.interfaccia FROM (device d JOIN utente u on d.device_dispositivo=u.device_id) "+
  "WHERE u.campo_idclient='" + req.params.numberclient + "'";
  //CONNESSIONE AL DATABASE

  pool.query(query, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      const d = JSON.stringify(res.rows);
      result.send(d);
    }
  });
});

app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.send('La pagina non esiste amico!');
});



app.listen(8080,()=>{
  console.log("YOU ARE UP (HTTP) ON 8080 ");
});



