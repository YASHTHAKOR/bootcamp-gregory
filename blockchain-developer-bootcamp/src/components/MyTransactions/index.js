import React, {Fragment} from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import {useSelector, useDispatch} from 'react-redux';
import Spinner from "../Commons/Spinner";
import {
    myFilledOrderLoadedSelector,
    myFilledOrdersSelector,
    myOrderOrdersLoadedSelector,
    myOpenOrdersSelector,
    accountSelector,
    exchangeSelector,
    orderCancellingSelector
} from '../../store/selectors';
import {
    cancelOrder
} from '../../store/interactions';


const showMyFilledOrdersView = ({myFilledOrders}) => {

    return (
        <tbody>
        {myFilledOrders.map((order) => {
            return <tr key={order.id}>
                <td className="text-muted">{order.formattedTimestamp}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.orderFillClass}{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            </tr>
        })}
        </tbody>
    )

}

const showMyOpenOrderView = ({
                                 myOpenOrders,
                                 dispatch,
                                 exchange,
                                 account
                             }) => {
    return (
        <tbody>
        {myOpenOrders.map((order) => {
            return <tr key={order.id}>
                <td className="text-muted">{order.formattedTimestamp}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.orderFillClass}{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                <td className="text-muted cancel-order" onClick={(e) => {
                    console.log('Cancelling Order');
                    cancelOrder(dispatch, exchange, order, account)
                }}>
                    X
                </td>
            </tr>
        })}
        </tbody>
    )
}

function MyTransaction() {
    const orderCancelling = useSelector(orderCancellingSelector);
    const openOrdersLoaded = useSelector(myOrderOrdersLoadedSelector);

    const showMyFilledOrders = useSelector(myFilledOrderLoadedSelector);
    const myFilledOrders = useSelector(myFilledOrdersSelector);
    const showMyOpenOrders = openOrdersLoaded && !orderCancelling;
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const exchange = useSelector(exchangeSelector);
    const account = useSelector(accountSelector);

    const dispatch = useDispatch();

    return <Fragment>
        <div className="card bg-dark text-white">
            <div className="card-header">
                My Transactions
            </div>
            <div className="card-body">
                <Tabs defaultActiveKey="trades" className="bg-dark text-white" id="uncontrolled-tab-example">
                    <Tab eventKey="trades" title="Trades" key="trades" className="bg-dark">
                        <table className="table table-dark table-sm small">
                            <thead>
                            <tr>
                                <th>Time</th>
                                <th>DNR</th>
                                <th>DNR/ETH</th>
                            </tr>
                            </thead>
                            {showMyFilledOrders ? showMyFilledOrdersView({
                                myFilledOrders
                            }) : <Spinner/>}
                        </table>
                    </Tab>
                    <Tab key="orders" eventKey="orders" title="Orders" className="bg-dark">
                        <table className="table table-dark table-sm small">
                            <thead>
                            <tr>
                                <th>Time</th>
                                <th>DNR</th>
                                <th>DNR/ETH</th>
                                <th>Cancel</th>
                            </tr>
                            </thead>
                            {showMyOpenOrders ? showMyOpenOrderView({
                                myOpenOrders,
                                dispatch,
                                exchange,
                                account
                            }) : <Spinner/>}
                        </table>
                    </Tab>
                </Tabs>
            </div>
        </div>

    </Fragment>

}

export default MyTransaction;