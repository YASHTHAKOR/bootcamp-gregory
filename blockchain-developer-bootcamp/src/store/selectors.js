import {get} from 'lodash';
import {createSelector} from 'reselect';
import moment from 'moment';
import {ETHER_ADDRESS, ether, tokens, GREEN, RED} from '../helpers';

const account = state => get(state, 'web3.account');
export const accountSelector = createSelector(account, a => a);

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl);

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el);

const exchange = state => get(state, 'exchange.contract');
export const exchangeSelector = createSelector(exchange, e => e)

export const contractLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => tl && el
);

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(
    filledOrders,
    (Orders) => {
        console.log('orders');
        let orders = Orders.sort((a, b) => b.timestamp - a.timestamp);

        orders = decorateFilledOrders(orders);

        return orders.sort((a, b) => b.timestamp - a.timestamp);
    }
)

const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0];
    return orders.map((order) => {
        order = decorateOrder(order);
        order = decorateFilledOrder(order, previousOrder);
        previousOrder = order;
        return order
    })
}

const decorateOrder = (order) => {
    let tokenAmount, etherAmount;
    if (order.tokenGive === ETHER_ADDRESS) {
        etherAmount = order.amountGive;
        tokenAmount = order.amountGet;
    } else {
        tokenAmount = order.amountGive;
        etherAmount = order.amountGet;
    }

    let tokenPrice = (etherAmount / tokenAmount);
    const precision = 100000;
    tokenPrice = Math.round(tokenPrice * 100000) / 100000;
    return {
        ...order,
        etherAmount: ether(etherAmount),
        tokenAmount: tokens(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    };
}

const decorateFilledOrder = (order, previousOrder) => {
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {

    if(orderId === previousOrder.id) {
        return GREEN;
    }


    if(previousOrder.tokenPrice <= tokenPrice) {
        return GREEN;
    } else {
        return RED
    }
}