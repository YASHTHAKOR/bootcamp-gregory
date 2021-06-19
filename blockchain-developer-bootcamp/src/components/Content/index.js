import React, {Fragment, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadAllOrders,subscribeToEvents} from "../../store/interactions";
import Trades from "../Trades";
import OrderBook from "../OrderBook";
import MyTransaction from "../MyTransactions";
import PriceChart from '../PriceChart';
import Balance from '../Balance';
import NewOrder from '../NewOrder';

function Content() {

    const dispatch = useDispatch();

    const exchange  = useSelector(state => state.exchange.contract);

    useEffect(() => {
        loadBlockchainData(dispatch)
    }, [])

    const loadBlockchainData = async (dispatch) => {
        await loadAllOrders(exchange, dispatch);
        await subscribeToEvents(dispatch, exchange);
    }



    return <Fragment>
        <div className="content">
            <div className="vertical-split">
                <Balance/>
                <NewOrder/>
            </div>
            <OrderBook/>
            <div className="vertical-split">
                <PriceChart/>
                <MyTransaction/>
            </div>
            <Trades/>
        </div>
    </Fragment>
}

export default Content;