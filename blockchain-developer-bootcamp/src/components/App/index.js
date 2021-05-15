import React, {Component} from 'react';
import './App.css';
import {connect} from 'react-redux';
import {
    loadWeb3,
    loadAccount,
    loadToken,
    loadExchange
} from '../../store/interactions'
import {
    contractLoadedSelector
} from '../../store/selectors';

import Navbar from '../Navbar'
import Content from "../Content";

class App extends Component {
    componentWillMount() {
        this.loadBlockchainData(this.props.dispatch)
    }

    async loadBlockchainData(dispatch) {
        const web3 = loadWeb3(dispatch);
        const networkId = await web3.eth.net.getId()
        const account = await loadAccount(web3, dispatch);
        const token = loadToken(web3, networkId, dispatch);
        if(!token) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;
        }
        const exchange = loadExchange(web3, networkId, dispatch);
        if(!exchange) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;

        }
    }

    render() {
        return (
            <div>
                <Navbar/>
                {this.props.contractsLoaded ? <Content/>:  <div className="content"/>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("Loaded",contractLoadedSelector(state))
    return {
        contractsLoaded: contractLoadedSelector(state)
    }
}

export default connect(mapStateToProps, null)(App);
