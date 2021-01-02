import React from 'react';
import ReactDOM from 'react-dom';

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = { win: null, el: null };
    this.hendleClose = this.hendleClose.bind(this);
  }

  componentDidMount() {
    let win = window.open('', '', 'width=600,height=400');
    win.document.title = 'shell' + this.props.dev;
    let el = document.createElement('div');
    win.document.body.appendChild(el);
    this.setState({ win, el });
    win.onbeforeunload = this.hendleClose
    this.copyStyles(document, win.document);

  }

    
  copyStyles(sourceDoc, targetDoc) {
    Array.from(sourceDoc.querySelectorAll('link[rel="stylesheet"], style'))
      .forEach(link => {
        targetDoc.head.appendChild(link.cloneNode(true));
      }) 
}
  
  hendleClose(){
    this.props.closeWindowPortal()
  }

  componentWillUnmount() {
    this.state.win.close();
  }

  render() {
    const { el } = this.state;
    if (!el) {
      return null;
    }
    return ReactDOM.createPortal(this.props.children, el);
  }
}

export default Window;