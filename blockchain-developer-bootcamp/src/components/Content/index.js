import React, {Fragment, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadAllOrders,subscribeToEvents} from "../../store/interactions";
import Trades from "../Trades";
import OrderBook from "../OrderBook";
import MyTransaction from "../MyTransactions";
import PriceChart from '../PriceChart';

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
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Card Title
                    </div>
                    <div className="card-body">
                        <p className="card-text">Some quick example text to build on the card title and make up
                            the bulk of the card's content.</p>
                        <a href="/#" className="card-link">Card link</a>
                    </div>
                </div>
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Card Title
                    </div>
                    <div className="card-body">
                        <p className="card-text">Some quick example text to build on the card title and make up
                            the bulk of the card's content.</p>
                        <a href="/#" className="card-link">Card link</a>
                    </div>
                </div>
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