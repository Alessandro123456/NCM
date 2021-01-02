const pg = require('pg');
var driver, ssh;
var moment = require('moment'); // require


let DB_USER = 'postgres'
let DB_IP = 'localhost'
let DB_NAME = 'gematica_credenziali'
let DB_PWD = 'post'
let DB_PORT = '5432'

const conString = "postgres://" + DB_USER + ":" + DB_PWD + "@" + DB_IP + ":" + DB_PORT + "/" + DB_NAME;

const pool = new pg.Pool({ connectionString: conString })

driver = require("node-ssh");
ssh = new driver();
const sshConfig = {
  host: "",
  username: "",
  password: ""
};

module.exports = (ws, req) => {
  
  var prima_connessione = true;
  console.log("Socket inizializzata")

  router = req.params.device;
  const query = "SELECT d.indirizzo_ip,u.username,u.password,d.device_dispositivo,u.id FROM (device d JOIN utente u on d.device_dispositivo=u.device_id) " +
    "WHERE d.nome_dispositivo='" + router + "' and u.campo_idclient='" + req.params.numberclient + "'";

  console.log("Accesso al DB")
  pool.query(query, async (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log("Richiesta credenziali ottenuta")
      sshConfig.host = res.rows[0].indirizzo_ip;
      sshConfig.username = res.rows[0].username;
      sshConfig.password = res.rows[0].password;
      device_id = res.rows[0].device_dispositivo;

      utente_id = req.params.numberclient

      await ssh.connect(sshConfig);
      const shellStream = await ssh.requestShell();

      console.log("CONNESSO:", ssh.isConnected());

      var data = moment().format('MMMM Do YYYY, h:mm:ss a');
      if (ssh.isConnected() == true) {
        const insert = "INSERT INTO CONNESSIONE VALUES ('" + utente_id + "','" + device_id + "','" + data + "')";

        pool.query(insert, (err, res) => {
          if (err) {
            console.log(err.stack);
          } else {
            const d = JSON.stringify(res.rows);
          }
        });
      }

      //RICEZIONE DA CLIENT-->SERVER
      ws.on("message", msg => {

        const data = JSON.parse(msg);
        switch (data.method) {
          case "command":
            try {
              shellStream.write(data.command.trim() + "\n");
            } catch {
              console.log("Tentativo di scrivere sulla Web Socket dopo la chiusura col comando EXIT! ")
            }
            break;
          case "closed":
            ssh.dispose();
            ws.terminate();
            console.log("closed lato server", ssh.isConnected())
        }
      });

      //SERVER-->CLIENT
      if (ssh.isConnected() == true) {
        console.log("ssh", ssh.isConnected())
        // listener
        shellStream.on("data", data => {
          const d = JSON.stringify({
            jsonrpc: "2.0",
            data: data.toString()
          });


          if (prima_connessione == false) {
            const insert_comandi = "INSERT INTO comandi VALUES ('" + utente_id + "','" + device_id + "','" + d + "')";

            pool.query(insert_comandi, (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("insert avvenuta con successo")
                try {
                  ws.send(d);
                }
                catch{
                  console.log("si è verificato un crash sul ws.send closeall")
                  ssh.dispose();
                }
              }
            });
          }
          else {
            ws.send(d)
            prima_connessione = false;
          }

        });


        shellStream.stderr.on("data", data => {
          const d = JSON.stringify({
            jsonrpc: "1.0",
            data: data.toString()
          });
          try {
            ws.send(d);
          }
          catch{
            console.log("si è verificato un crash sul ws.send closeall")
            ssh.dispose();

          }

        });

      }
      //fine IFSSHCONNECTED
    }
  });

}