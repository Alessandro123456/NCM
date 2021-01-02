import React from 'react';
import { TablePagination } from 'react-pagination-table';
import './App.css';
import axios from 'axios';
import Shell from "./Shell.js";
import Window from "./Windows.js";
import { Jumbotron, Container, Button, Table, TabContent, TabPane, Nav, NavItem, NavLink, Card, CardHeader, CardFooter, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { Collapse, CardBody } from 'reactstrap';

const columns = [{
	dataField: 'key',
	text: '#'
  }, {
	dataField: 'ora_connessione',
	text: 'Connection time'
  }];

  console.log("")

class DeviceList extends React.Component {

	

	constructor(props) {
		super(props)

		this.state = {
			scelta: null,
			collapse: {},
			activetab: '1',
			device: []
		};

		this.connect = this.connect.bind(this);
		this.toggle_tab = this.toggle_tab.bind(this);
		this.toggle_collapse = this.toggle_collapse.bind(this);
		this.disconnect = this.disconnect.bind(this);
		this.getComandi = this.getComandi.bind(this)
		this.closeWindowPortal = this.closeWindowPortal.bind(this)
		this.openWindowsPortal = this.openWindowsPortal.bind(this)

	}
	authorizationHeader() {
		if(!this.props.keycloak) return {};
		return {
		  headers: {
			"Authorization"                : "Bearer " + this.props.keycloak.token,
		  }
		};
	  }
	//DIDMOUNT FUNCTION
	componentDidMount() {
		console.log("COMPONENTDIDMOUNTAPPJS")
		window.addEventListener('beforeunload', () => {
			this.closeWindowPortal();
		});
		let struttura = []

		axios.get('http://localhost:8080/client'+this.props.campo_idclient,this.authorizationHeader())
			.then(res => {

				
				for (let i = 0; i < res.data.length; i++) {
					struttura.push({
						nome_dispositivo: res.data[i].nome_dispositivo,
						interfaccia: res.data[i].interfaccia,
						descrizione: res.data[i].descrizione,
						lista_comandi: [],
						is_scelto: false,
						timestamp: [],
						connect: false,
						flag_resume: false,
						render_resume: false
					})

				}
				this.setState({ device: struttura })
				console.log("Device: ", this.state.device)

			});


	}

	componentWillUnmount() {

	}

	//CONNECT FUNCTION
	connect(key) {

		let temp = this.state.device;
		temp[key].is_scelto = true
		temp[key].connect = true;

		this.setState({ scelta: temp[key].nome_dispositivo, device: temp });

	}

	disconnect(device, key) {

		//GESTIORE RENDER DISCONNECT E CONNECT
		let temp = this.state.device;
		//pulire il database
		axios.get('http://localhost:8080/client'+this.props.campo_idclient+'/delete/' + device,this.authorizationHeader())

			.then(res => {
				temp[key].connect = false
				temp[key].is_scelto = false
				temp[key].render_resume = false
				temp[key].lista_comandi = []

				this.setState({ device: temp })
			});
	}

	getComandi(key, device) {
		this.openWindowsPortal(key)
		let temp = this.state.device;
		temp[key].lista_comandi = [] //importante altrimenti si aggiungono anche i comandi precedenti
		axios.get('http://localhost:8080/client'+this.props.campo_idclient+'/' + device + '/comandi',this.authorizationHeader())
			.then(res => {
				for (let i = 0; i < res.data.length; i++) {
					temp[key].lista_comandi.push(JSON.parse(res.data[i].comando))
				}
				temp[key].flag_resume = true
				temp[key].render_resume = false
				this.setState({ device: temp })
			});
	}

	handleHistory(device) {
		let temp = this.state.device;
		var lista_timestamp = {}
		var struttura = []
		axios.get('http://localhost:8080/client'+this.props.campo_idclient+'/' + device,this.authorizationHeader())
			.then(res => {

				for (let i=0; i<res.data.length; i++) {
					struttura.push ( {
						ora_connessione: res.data[i].ora_connessione,
						key : i+1
					})
				}

				temp.filter((dev) => dev.nome_dispositivo == device)[0].timestamp = struttura

				this.setState({ 
					device: temp
				});
			});
	}


	//FUNZIONI DI TOGGLE	 
	toggle_tab(tab) {

		if (tab == 3) {
			this.handleHistory(this.state.scelta)
		}
		this.setState({ activetab: tab });

	}

	toggle_collapse(key) {
		let temp = this.state.device;
		this.setState({ collapse: { ...this.state.collapse, [key]: !this.state.collapse[key] }, scelta: temp[key].nome_dispositivo });

	}


	openWindowsPortal(key) {

		let temp = this.state.device
		temp[key].connect = true
		this.setState({ device: temp })

	}

	closeWindowPortal(key) {

		let temp = this.state.device;
		if (this.state.device[key].connect == true) {
			temp[key].render_resume = true
			temp[key].connect = false
			temp[key].flag_resume = false
			this.setState({ device: temp })
		}

	}
	

	render() {

		const { device, collapse, scelta, activetab } = this.state;
		if (this.props.keycloak) {
			if (this.props.authenticated)
			
		return (
			
			<div>
				
				<h1 style={{ padding: "0.6cm" }}> Network Configuration Management </h1>

				<Row id="1" style={{ color: "#62615f" }}>

					<Col sm="3" style={{ border: "ridge" }}>

						<Container>
							<h2 style={{ textAlign: "center", margin: ".5rem" }}>Device</h2>
							{device.map((dev, key) =>

								<Row style={{ marginRight: "0", marginLeft: "0" }}>

									<Button color="primary" onClick={() => this.toggle_collapse(key)} style={{ marginBottom: '1rem', marginTop: '1rem', backgroundColor: "#073765" }} size="lg" block>

										{dev.nome_dispositivo}

									</Button>

									<Collapse isOpen={collapse[key]} id={key} style={{ width: "100%" }}>

										<Card body style={{ width: '100%' }} >

											<CardHeader style={{ fontWeight: "600" }}>Device: {dev.nome_dispositivo}</CardHeader>
											<CardBody>
												<CardTitle>Interface: {dev.interfaccia}</CardTitle>
											</CardBody>
											<CardFooter>
												<div className='ui connect disconnect' style={{ textAlign: "center" }}>
													{!dev.is_scelto ?
														<Button color='success' onClick={() => this.connect(key)} style={{ fontSize: "2vh", width: "14vh" }}>
															Open Shell
																</Button>
														:
														<Button color='danger' onClick={() => this.disconnect(dev.nome_dispositivo, key)} style={{ fontSize: "2vh", width: "14vh", marginRight: "0.5vh" }}>
															Disconnect
															</Button>
													}
													{dev.render_resume &&
														<Button color='info' onClick={() => this.getComandi(key, dev.nome_dispositivo)} style={{ fontSize: "2vh", width: "14vh", marginLeft: "0.5vh" }}>
															Resume
														</Button>
													}
												</div>
											</CardFooter>
										</Card>
									</Collapse>

								</Row>
							)
							}
						</Container>
					</Col>



					<Col sm="9" style={{}}>
						

						<Container fluid style={{ textAlign: 'center', marginBottom: '0.75cm', marginTop: '0.75cm' }}>
							<h2 className="display-3">Welcome {this.props.name}</h2>
							
							{scelta == null ?
								<h2>Choose the device to manage</h2>
								:
								<h2>Selected device: <strong style={{ color: "black" }}> {scelta} </strong></h2>
							}
							<Button  onClick={() => this.props.keycloak.logout()} style={{marginLeft: '14cm',marginTop:' -2cm'}}> Logout</Button>
						</Container>
						{scelta != null &&
							<Nav tabs>
								<NavItem>
									<NavLink
										className={classnames({ active: this.activetab === '1' })}
										onClick={() => { this.toggle_tab('1'); }}> Home device
								</NavLink>
								</NavItem>


								<NavItem>
									<NavLink
										className={classnames({ active: this.activetab === '3' })}
										onClick={() => { this.toggle_tab('3'); }}> History
								</NavLink>
								</NavItem>
							</Nav>

						}
						<TabContent activeTab={activetab}>
							{scelta != null &&
								<TabPane tabId="1">
									<Row>
										<Col >
											<Jumbotron style={{ backgroundColor: "#fff", padding: "0.5cm" }}>
												<h2> Device description </h2>
												<p className="lead">{device.filter((dev) => dev.nome_dispositivo == scelta)[0].descrizione}</p>
											</Jumbotron>
										</Col>
									</Row>
								</TabPane>
							}

							{scelta != null &&
								<TabPane tabId="3">
									<BootstrapTable keyField='id' data= {device.filter((dev) => dev.nome_dispositivo == scelta)[0].timestamp} columns={ columns } pagination={ paginationFactory() } />


								</TabPane>
							}
						</TabContent>

					</Col>

				</Row>

				<Row>
					<Container>

					</Container>
				</Row>

				{device.map((dev, key) =>
					<div>
						{dev.connect &&
							<Window dev={dev.nome_dispositivo} closeWindowPortal={() => this.closeWindowPortal(key)}>
								<Shell dev={dev.nome_dispositivo} comandi={dev.lista_comandi} flag={dev.flag_resume} url={'ws://localhost:8080' + '/\client'+this.props.campo_idclient+'/' + dev.nome_dispositivo} token={this.authorizationHeader()} />
							</Window>
						}
					</div>
				)}

			</div>
		);
		else return ( <div>Unable to authenticate!</div>)
	}
	return (
		<div>Initializing Keycloak...</div>
	  );
	}
}

export default DeviceList;