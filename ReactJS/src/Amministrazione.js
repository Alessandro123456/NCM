import React from 'react';
import './App.css';
import axios from 'axios';
import {
	Container, Button, Row, Col, Form, FormGroup, Label,
	Input, ListGroup, ListGroupItem, Nav, NavItem, NavLink
} from 'reactstrap';

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';


const columns_home = [{
	dataField: 'campo_idclient',
	text: 'ID UTENTE'
}, {
	dataField: 'nome',
	text: 'NOME UTENTE'
}, {
	dataField: 'cognome',
	text: 'COGNOME UTENTE'
}, {
	dataField: 'device_dispositivo',
	text: 'ID DISPOSITIVO'
}, {
	dataField: 'nome_dispositivo',
	text: 'NOME DISPOSITIVO'
}, {
	dataField: 'indirizzo_ip',
	text: 'INDIRIZZO IP DISPOSITIVO'
}, {
	dataField: 'interfaccia',
	text: 'INTERFACCIA DISPOSITIVO'
}, {
	dataField: 'username',
	text: 'USERNAME DISPOSITIVO'
}, {
	dataField: 'password',
	text: 'PASSWORD DISPOSITIVO'
}];

const columns_utente = [{
	dataField: 'id',
	text: 'ID UTENTE'
}, {
	dataField: 'nome',
	text: 'NOME UTENTE'
}, {
	dataField: 'cognome',
	text: 'COGNOME UTENTE'
}, {
	dataField: 'device_id',
	text: 'ID DISPOSITIVO'
}, {
	dataField: 'username',
	text: 'USERNAME'
}, {
	dataField: 'password',
	text: 'PASSWORD'
}, {
	dataField: 'campo_idclient',
	text: 'CAMPO_IDCLIENT'
}
];
const columns_device = [{
	dataField: 'device_dispositivo',
	text: 'ID DISPOSITIVO'
}, {
	dataField: 'nome_dispositivo',
	text: 'NOME DISPOSITIVO'
}, {
	dataField: 'indirizzo_ip',
	text: 'INDIRIZZO IP'
}, {
	dataField: 'interfaccia',
	text: 'INTERFACCIA'
}, {
	dataField: 'descrizione',
	text: 'DESCRIZIONE'
}
];
var data = null
var data_utente = null
var data_device = null
class Amministrazione extends React.Component {



	constructor(props) {
		super(props)

		this.state = {
			add_new_user: false,
			add_new_device: false,
			home: false,
			viewuser: false,
			viewdevice: false,
			dropdownOpen: false
		};

	}
	toggle = () => {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}


	//DIDMOUNT FUNCTION
	componentDidMount() {
		axios.get("http://localhost:8080/viewdatabase", this.authorizationHeader())
			.then(response => {
				console.log("response", response.data)
				data = response.data;
				this.setState({ add_new_device: false, add_new_user: false, home: true, viewdevice: false, viewuser: false })

			})



	}

	componentWillUnmount() {

	}
	authorizationHeader() {
		if (!this.props.keycloak) return {};
		return {
			headers: {
				"Authorization": "Bearer " + this.props.keycloak.token,
			}
		};
	}

	viewdevice() {
		axios.get("http://localhost:8080/viewdevice", this.authorizationHeader())
			.then(response => {
				console.log("response", response.data)
				data_device = response.data;
				this.setState({ add_new_device: false, add_new_user: false, home: false, viewdevice: true, viewuser: false })

			})

	}
	viewuser() {
		axios.get("http://localhost:8080/viewuser", this.authorizationHeader())
			.then(response => {
				console.log("response", response.data)
				data_utente = response.data;
				this.setState({ add_new_device: false, add_new_user: false, home: false, viewdevice: false, viewuser: true })

			})


	}

	add_new_device_tab() {
		console.log("device");
		this.setState({ add_new_device: true, add_new_user: false, home: false, viewdevice: false, viewuser: false })
	}
	add_new_user_tab() {
		this.setState({ add_new_device: false, add_new_user: true, home: false, viewdevice: false, viewuser: false })
	}
	home() {
		console.log("home")
		axios.get("http://localhost:8080/viewdatabase", this.authorizationHeader())
			.then(response => {
				console.log("response", response.data)
				data = response.data;
				this.setState({ add_new_device: false, add_new_user: false, home: true, viewdevice: false, viewuser: false })

			})


	}
	add_new_user() {
		axios.post("http://localhost:8080/adduser", {
			iduser: document.getElementById("iduser").value,
			campo_idclient: document.getElementById("campo_idclient").value,
			nomeutente: document.getElementById("nomeutente").value,
			cognomeutente: document.getElementById("cognomeutente").value,
			deviceid: document.getElementById("deviceid").value,
			usernamedevice: document.getElementById("usernamedevice").value,
			passworddevice: document.getElementById("passworddevice").value
		}, this.authorizationHeader())
			.then(response => {
				this.viewuser()
				alert("utente Inserito")

			})

	}
	add_new_device() {
		console.log("docuemnt", document.getElementById("id").value)
		console.log("document", document.getElementById("id").value)
		axios.post("http://localhost:8080/adddevice", {
			id: document.getElementById("id").value,
			nomedisp: document.getElementById("nomedisp").value,
			indirizzoip: document.getElementById("indirizzoip").value,
			interfaccia: document.getElementById("interface").value,
			descrizione: document.getElementById("descrizione").value
		}, this.authorizationHeader())
			.then(response => {
				alert("inserimento avvenuto con successo")
				this.viewdevice();

			})
	}
	delectedSelectedDevice() {
		var i = 0;
		console.log(this.node.selectionContext.selected.length)
		for (i = 0; i < this.node.selectionContext.selected.length; i++) {
			axios.post("http://localhost:8080/deletedevice", {
				id: this.node.selectionContext.selected[i],

			}, this.authorizationHeader())
				.then(response => {
					alert("eleminato device", this.node.selectionContext.selected[i])
					this.viewdevice();
				})
		}
	}

	deleteSelectedUser() {
		console.log("data", data_utente)
		console.log(this.node.selectionContext.selected)
		for (let i = 0; i < this.node.selectionContext.selected.length; i++) {
			axios.post("http://localhost:8080/deleteuser", {
				id: this.node.selectionContext.selected[i],

			}, this.authorizationHeader())
				.then(response => {
					alert("eleminato user", this.node.selectionContext.selected[i])
					this.viewuser();
				})
		}

	}





	render() {
		const { add_new_user, add_new_device, home, viewdevice, viewuser } = this.state;
		if (this.props.keycloak) {
			if (this.props.authenticated)
				return (

					<div>

						<h1 style={{ padding: "0.6cm" }}> Admin Page  </h1>

						<Row id="1" style={{ color: "#62615f" }}>

							<Col sm="2" >

								<Container fluid style={{ textAlign: 'center', marginBottom: '0.75cm', marginTop: '0.75cm' }}>
									<ListGroup>
										<ListGroupItem tag="a" href="#" onClick={() => this.home()}>Home</ListGroupItem>
										<ListGroupItem tag="a" href="#" onClick={() => this.viewuser()}>View all users</ListGroupItem>
										<ListGroupItem tag="a" href="#" onClick={() => this.viewdevice()}>View all device</ListGroupItem>
										<ListGroupItem tag="a" href="#" onClick={() => this.props.keycloak.logout()}>Logout</ListGroupItem>
									</ListGroup>
								</Container>
							</Col>



							<Col sm="10" style={{}}>


								<Container fluid style={{ textAlign: 'center', marginBottom: '0.75cm', marginTop: '0.75cm' }}>

									{add_new_user &&
										<div>
											<Form>
												<FormGroup>
													<Label for="iduser">Campo ID CLIENT</Label>
													<Input type="number" name="iduser" id="iduser" placeholder="iduser" />
												</FormGroup>
												<FormGroup>
													<Label for="campo_idclient">Campo ID CLIENT</Label>
													<Input type="number" name="campo_idclient" id="campo_idclient" placeholder="number grather than 0" />
												</FormGroup>
												<FormGroup>
													<Label for="nomeutente">NOME UTENTE</Label>
													<Input type="text" name="nomeutente" id="nomeutente" placeholder="nomeutente" />
												</FormGroup>
												<FormGroup>
													<Label for="cognomeutente">COGNOME UTENTE</Label>
													<Input type="text" name="cognomeutente" id="cognomeutente" placeholder="cognomeutente" />
												</FormGroup>
												<FormGroup>
													<Label for="deviceid">DEVICE ID</Label>
													<Input type="number" name="deviceid" id="deviceid" placeholder="deviceid" />
												</FormGroup>
												<FormGroup>
													<Label for="usernamedevice">USERNAME DEVICE</Label>
													<Input type="text" name="usernamedevice" id="usernamedevice" placeholder="usernamedevice" />
												</FormGroup>
												<FormGroup>
													<Label for="passworddevice">PASSOWORD DEVICE</Label>
													<Input type="text" name="passworddevice" id="passworddevice" placeholder="passworddevice" />
												</FormGroup>

											</Form>
											<Button onClick={() => this.add_new_user()}>Submit</Button></div>
									}
									{add_new_device &&
										<div>
											<Form>
												<FormGroup>
													<Label for="id">ID Dispositivo</Label>
													<Input type="number" name="id" id="id" placeholder="number grather than 0" />
												</FormGroup>
												<FormGroup>
													<Label for="nomedisp">Nome Dispositivo</Label>
													<Input type="text" name="nomedisp" id="nomedisp" placeholder="Nome dispositivo" />
												</FormGroup>
												<FormGroup>
													<Label for="indirizzoip">Indirizzo IP</Label>
													<Input type="text" name="indirizzoip" id="indirizzoip" placeholder="indirizzoip" />
												</FormGroup>
												<FormGroup>
													<Label for="interface">Interfaccia</Label>
													<Input type="text" name="interface" id="interface" placeholder="Interfaccia" />
												</FormGroup>
												<FormGroup>
													<Label for="descrizione">Descrizione</Label>
													<Input type="textarea" name="descrizione" id="descrizione" placeholder="descrizione" />
												</FormGroup>

											</Form>
											<Button onClick={() => this.add_new_device()}>Submit</Button>

										</div>

									}
									{home &&
										<Container>
											<BootstrapTable keyField='id_home' data={data} columns={columns_home} pagination={paginationFactory()} bordered={false} striped />
										</Container>
									}
									{viewdevice &&
										<div>
											<Nav>
												<NavItem>
													<NavLink href="#" onClick={() => this.add_new_device_tab()}>Add Device</NavLink>
												</NavItem>
												<NavItem>
													<NavLink href="#" onClick={() => this.delectedSelectedDevice()}>Delete Selected Device</NavLink>
												</NavItem>
											</Nav>
											<Container>
												<BootstrapTable ref={n => this.node = n} keyField='device_dispositivo' data={data_device} columns={columns_device} pagination={paginationFactory()} selectRow={{ mode: 'checkbox', clickToSelect: true }} bordered={false} striped />
											</Container>
										</div>
									}
									{viewuser &&
										<div>
											<Nav>
												<NavItem>
													<NavLink href="#" onClick={() => this.add_new_user_tab()}>Add User</NavLink>
												</NavItem>
												<NavItem>
													<NavLink href="#" onClick={() => this.deleteSelectedUser()}>Delete Selected User</NavLink>
												</NavItem>
											</Nav>

											<Container>

												<BootstrapTable ref={n => this.node = n} keyField='id' data={data_utente} columns={columns_utente} pagination={paginationFactory()} selectRow={{ mode: 'checkbox', clickToSelect: true }} bordered={false} striped />
											</Container>
										</div>
									}


								</Container>


							</Col>

						</Row>

						<Row>
							<Container>

							</Container>
						</Row>



					</div>
				);
			else return (<div>Unable to authenticate!</div>)
		}
		return (
			<div>Initializing Keycloak...</div>
		);
	}
}

export default Amministrazione;