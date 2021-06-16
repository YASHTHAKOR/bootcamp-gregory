import React,{Fragment} from 'react';
import {useSelector} from 'react-redux';
import {
    orderBookSelector,
    orderBookLoadedSelector
} from '../../store/selectors';
import Spinner from "../Commons/Spinner";

function OrderBook() {

    const orderBook = useSelector(state => orderBookSelector(state));
    const showOrderBook = useSelector(state => orderBookLoadedSelector(state));

    const renderOrder = (order) => {
        return <tr key={order.id}>
            <td>{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td>{order.etherAmount}</td>
        </tr>
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
                      {showOrderBook? listOrderBook(orderBook): <Spinner type="table"/>}
                  </table>
                </div>
            </div>
        </div>
    </Fragment>

}

export default OrderBook;