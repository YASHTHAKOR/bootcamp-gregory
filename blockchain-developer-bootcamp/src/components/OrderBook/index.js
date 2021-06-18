import React, {Fragment} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {
    orderBookSelector,
    orderBookLoadedSelector,
    accountSelector,
    exchangeSelector,
    orderFillingSelector
} from '../../store/selectors';
import Spinner from "../Commons/Spinner";
import {
    fillOrder
} from '../../store/interactions'

function OrderBook() {

    const orderBookLoaded = useSelector(state => orderBookLoadedSelector(state));
    const orderFilling = useSelector(state => orderFillingSelector(state));

    const orderBook = useSelector(state => orderBookSelector(state));
    const showOrderBook = orderBookLoaded && !orderFilling;
    const exchange = useSelector(exchangeSelector);
    const account = useSelector(accountSelector);

    const dispatch = useDispatch();

    const renderOrder = (order) => {
        return <OverlayTrigger
                key={order.id}
                placement='auto'
                overlay={
                    <Tooltip id={order.id}>
                        {`Click here to ${order.orderFillAction}`}
                    </Tooltip>
                }
        >
            <tr key={order.id}
                onClick={() => fillOrder(dispatch,exchange,order, account)}
            >
                <td>{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                <td>{order.etherAmount}</td>
            </tr>
        </OverlayTrigger>
    }

    const listOrderBook = (orderBook) => {
        return <tbody>
        {orderBook.sellOrders.map((order) => renderOrder(order))}
        <tr>
            <th>DAPP</th>
            <th>DAPP/ETH</th>
            <th>ETH</th>
        </tr>
        {orderBook.buyOrder.map(order => renderOrder(order))}
        </tbody>
    }

    return <Fragment>
        <div className="vertical">
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Order Book
                </div>
                <div className="card-body order-book">
                    <table className="table table-dark table-sm small">
                        {showOrderBook ? listOrderBook(orderBook) : <Spinner type="table"/>}
                    </table>
                </div>
            </div>
        </div>
    </Fragment>

}

export default OrderBook;