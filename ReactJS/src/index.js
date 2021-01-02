import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Amministrazione from './Amministrazione';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import Keycloak from 'keycloak-js';


var keycloak = Keycloak('/keycloak.json'); //creazion instanza keycloak
var authenticated_var = null 
var attribute = null
var name = null
var admin=null
var operator=true

/*
keycloak.init({ onLoad: 'login-required' })
    .success(authenticated => {    
        authenticated_var=authenticated         
       // renderReactDom() // Avvia il rendering di <App>
    })
    .error((error) => {               
        alert('Error: Login Issue');
    })
*/
keycloak.onReady = function () {
      // L'OGGETTO KEYCLOAK È PRONTO
      // prendiamo i dati dell'utente di profilo che ci servono per  i menu all'interno dei componenti figli
      keycloak.loadUserProfile().success(details => {
          console.log("details",details)
          console.log("campo_id_client",details.attributes.campo_idclient[0])
          attribute=details.attributes;
          name = details.firstName;
          admin = keycloak.hasResourceRole("MAINTENANCE");
          operator = keycloak.hasResourceRole("OPERATOR");
          console.log("admin",admin)
          //renderReactDom();
      }

      )
  }
/*
  keycloak.onTokenExpired = function () {   
    keycloak.authenticated = false;
    renderReactDom();     
}
*/
//function renderReactDom() {
ReactDOM.render(
    <div>
{admin &&
    <Amministrazione keycloak={keycloak} authenticated={authenticated_var}/>
}

{operator &&
      // <App keycloak={keycloak} authenticated={authenticated_var} campo_idclient={attribute.campo_idclient[0]} name = {name}/>
       <App keycloak={keycloak} authenticated={true} campo_idclient={1} name = {"Alessandro"}/>
}
    </div>,
    document.getElementById('root')
);
//}
serviceWorker.unregister();
