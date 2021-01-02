import React from 'react';
import { ButtonGroup, Button, Form, FormGroup, Label, Formbel, Input, FormText } from 'reactstrap';
import './index.css';

import { w3cwebsocket as W3CWebSocket } from "websocket";


class Shell extends React.Component {

	constructor(props) {

		super(props)

		this.state = { 
					   create_socket: false, 
					   alreadycreate: false, 
					   command: "", 
					   command_cont: 0, 
					   comandi_inseriti: [], 
					   commandList: [],
					   ws: null, 
					   resume: false 
					}

		this.handleKeyDown = this.handleKeyDown.bind(this)

	}

	createsocket() {

		if (this.state.alreadycreate == false) {
			console.log("token",this.props.token)
			this.setState({ ws: new W3CWebSocket(this.props.url, 'echo-protocol') }, () => {
				this.state.ws.onmessage = msg => {
					this.setState({ create_socket: true })
					this.setState({ commandList: this.state.commandList.concat([JSON.parse(msg.data)]) }, () => {
					});

				}
			});
			this.setState({ alreadycreate: true });
		}
	}

	componentDidMount() {
	}


	componentWillUnmount() {
		if (this.state.create_socket) {
			var data = null
			data = { method: 'closed', command: "closed" };
			this.state.ws.send(JSON.stringify(data));
			this.setState({ alreadycreate: false })
			this.setState({ commandList: [] })
			this.setState({ create_socket: false })
			this.state.ws.close();
			console.log("Socket chiusa: ", this.props.dev)
		}

	}

	aggiornacomandi() {


		if (this.props.flag == true && this.state.resume == false) {

			var i = 0;

			this.setState({ commandList: this.props.comandi })

			this.setState({ resume: true })

		}


	}

	handleKeyDown(e) {
		// arrow up/down button 
		if (e.keyCode === 38) {
			console.log("TASTO SU")
			if (this.state.command_cont == this.state.comandi_inseriti.length) {
				this.setState({ command: this.state.comandi_inseriti[0] })
			}
			else {
				this.setState({ command_cont: this.state.command_cont + 1 }, () => {
					this.setState({ command: this.state.comandi_inseriti[this.state.comandi_inseriti.length - this.state.command_cont] });
				});
			}
		} else if (e.keyCode === 40) {
			console.log("TASTO GIU")
			if (this.state.command_cont <= 1) {
				this.setState({ command: this.state.comandi_inseriti[this.state.comandi_inseriti.length - 1] });
			}
			else {
				this.setState({ command_cont: this.state.command_cont - 1 }, () => {
					this.setState({ command: this.state.comandi_inseriti[this.state.comandi_inseriti.length - this.state.command_cont] });
				});
			}
		}
	}


	onSend() {

		var data = null;
		data = { method: 'command', command: this.state.command }
		if (this.state.command == 'clear') {
			this.setState({ commandList: [] , command:""})

		} else {
			this.state.ws.send(JSON.stringify(data));
			this.setState({ command: "" });
		}
	}

	render() {



		return (
			<body class="body-terminal" >






				<div className="App">
					{this.createsocket()}
					{this.aggiornacomandi()}





					<div class="terminal">
						{this.state.commandList.map((list, i) => {

							return <div id="history" style={{ textAlign: 'left' }} key={i}>{list.data}</div>
						})}


						{this.state.create_socket &&
							<div class="line">

								<span id="path">&nbsp;>&nbsp;</span>
								<input type="text" value={this.state.command} onKeyDown={this.handleKeyDown} onChange={(e) => this.setState({ command: e.target.value })}


									placeholder="Enter your command"

									onKeyPress={event => {
										if (event.key === 'Enter') {
											if(this.state.command =="") {
												this.onSend()
											} else {
												this.setState({ comandi_inseriti: this.state.comandi_inseriti.concat(this.state.command), command_cont: 0 })
												this.onSend()
											}
										}

									}}
								/>
							</div>
						}

					</div>
				</div>
			</body>
		);
	}
}

export default Shell;
