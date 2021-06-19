import Web3 from 'web3';
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading,
    buyOrderMaking,
    sellOrderMaking,
    orderMade
} from './actions'
import Token from "../abis/Token.json";
import Exchange from "../abis/Exchange.json";
import {ETHER_ADDRESS} from '../helpers';

export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(window.ethereum || 'http://localhost:8545');
    dispatch(web3Loaded(web3));
    return web3;
}

export const loadAccount = async (web3, dispatch) => {
    await window.ethereum.enable()
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
    } catch (Err) {
        console.log('Contract not deployed to the current network. Please select another network with metamask');
        return null;
    }

}

export const loadExchange = (web3, networkId, dispatch) => {

    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
        dispatch(exchangeLoaded(exchange));
        return exchange;
    } catch (Err) {
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


export const subscribeToEvents = async (dispatch, exchange) => {
    exchange.events.Cancel({}, (error, event) => {
        dispatch(orderCancelled(event.returnValues));
    })

    exchange.events.Deposit({}, (error, event) => {
        dispatch(balancesLoaded(event.returnValues));
    })

    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded(event.returnValues));
    })

    exchange.events.Trade({}, (error, event) => {
        dispatch(orderFilled(event.returnValues));
    })

    exchange.events.Order({}, (error, event) => {
        dispatch(orderMade(event.returnValues));
    })
}

export const cancelOrder = (dispatch, exchange, order, account) => {
    exchange.methods.cancelOrder(order.id).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(orderCancelling())
        })
        .on('error', (error) => {
            console.log(error);
            window.alert('There was an error!');
        })
}

export const fillOrder = (dispatch, exchange, order, account) => {
    exchange.methods.fillOrder(order.id).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(orderFilling());
        })
        .on('error', (error) => {
            console.log(error);
        })
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {

    const etherBalance = await web3.eth.getBalance(account);
    dispatch(etherBalanceLoaded(etherBalance));

    const tokenBalance = await token.methods.balanceOf(account).call();
    dispatch(tokenBalanceLoaded(tokenBalance));

    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call();
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

    dispatch(balancesLoaded())


}

export const depositEther = async (dispatch, exchange, web3, amount, account) => {
    exchange.methods.depositEther().send({from: account, value: web3.utils.toWei(amount, 'ether')})
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading());
        })
        .on('error', (error) => {
            console.log(error);
        })
}


export const withdrawEther = async (dispatch, exchange, web3, amount, account) => {
    exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading());
        })
        .on('error', (error) => {
            console.log(error);
        })
}


export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether');

    token.methods.approve(exchange.options.address, amount).send({from: account})
        .on('transactionHash', (hash) => {
            exchange.methods.depositToken(token.options.address, amount).send({from: account})
                .on('transactionHash', (hash) => {
                    dispatch(balancesLoading());
                })
        })
        .on('error', (error) => {
            console.log(error);
            window.alert('there was an error');
        })
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading());
        })
        .on('error', (error) => {
            console.log(error);
            window.alert('there was an error');
        })
}

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
    debugger;
    const tokenGet = token.options.address;
    const amountGet = web3.utils.toWei(order.amount, 'ether');
    const tokenGive = ETHER_ADDRESS;
    const amountGive = web3.utils.toWei((order.amount* order.price).toString(), 'ether');

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(buyOrderMaking());
        })
        .on('error', (error) => {
            console.log(error);
            window.alert('There was an error!');
        })

}

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
    const tokenGive = token.options.address;
    const amountGive = web3.utils.toWei(order.amount, 'ether');
    const tokenGet = ETHER_ADDRESS;
    const amountGet = web3.utils.toWei((order.amount* order.price).toString(), 'ether');

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(sellOrderMaking());
        })
        .on('error', (error) => {
            console.log(error);
            window.alert('There was an error!');
        })

}