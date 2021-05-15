import Web3 from 'web3';
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded
} from './actions'
import Token from "../abis/Token.json";
import Exchange from "../abis/Exchange.json";

export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(window.ethereum || 'http://localhost:8545');
    dispatch(web3Loaded(web3));
    return web3;
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    dispatch(web3AccountLoaded(account));
    return account;
}

export const loadToken = (web3, networkId, dispatch) => {

    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
        dispatch(tokenLoaded(token));
        return token;
    } catch(Err) {
        console.log('Contract not deployed to the current network. Please select another network with metamask');
        return null;
    }

}

export const loadExchange = (web3, networkId, dispatch) => {

    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
        dispatch(exchangeLoaded(exchange));
        return exchange;
    } catch(Err) {
        console.log('Contract not deployed to the current network. Please select another network with metamask');
        return null;
    }

}

export const loadAllOrders = async (exchange, dispatch) => {

    const cancelStream = await exchange.getPastEvents('Cancel', {fromBlock: 0, toBlock: 'latest'});

    const cancelledOrders = cancelStream.map((event) => event.returnValues);

    dispatch(cancelledOrdersLoaded(cancelledOrders));

    const tradeStream = await exchange.getPastEvents('Trade', {fromBlock: 0, toBlock: 'latest'});
    const filledOrders = tradeStream.map((event) => event.returnValues);

    dispatch(filledOrdersLoaded(filledOrders));

    const orderStream = await exchange.getPastEvents('Order', {fromBlock: 0, toBlock: 'latest'});
    const allOrders = orderStream.map((event) => event.returnValues);

    dispatch(allOrdersLoaded(allOrders));


}