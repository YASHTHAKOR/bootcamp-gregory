import React, {Fragment} from "react";
import {useSelector} from "react-redux";
import Spinner from '../Commons/Spinner';
import {filledOrdersSelector, filledOrdersLoadedSelector} from '../../store/selectors';

function Trades() {

    const orderLoaded = useSelector(state => filledOrdersLoadedSelector(state));
    const orders = useSelector(state => filledOrdersSelector(state));

    const showFilledOrders = (filledOrders) => {
        return <tbody>
        {filledOrders.map((order) => {
            return <tr className={`order-${order.id}`} key={order.id}>
                <td className="text-muted">{order.formattedTimestamp}</td>
                <td>{order.tokenAmount}</td>
                <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
            </tr>
        })}
        </tbody>
    }

    return <Fragment>
        <div className="vertical">
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Trades
                </div>
                <div className="card-body">
                    <table className="table table-dark table-sm small">
                        <thead>
                        <tr>
                            <th>Time</th>
                            <th>DNR</th>
                            <th>DNR/ETH</th>
                        </tr>
                        </thead>
                        {orderLoaded ? showFilledOrders(orders) : <Spinner type="table"/>}

                    </table>
                </div>
            </div>
        </div>
    </Fragment>

}

export default Trades;