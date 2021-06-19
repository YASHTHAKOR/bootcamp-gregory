import React from 'react';
import {Tabs, Tab} from "react-bootstrap";
import Spinner from '../Commons/Spinner';
import {
    accountSelector,
    exchangeSelector,
    tokenSelector,
    web3Selector,
    buyOrderSelector,
    sellOrderSelector
} from '../../store/selectors';
import {
    buyOrderAmountChanged,
    buyOrderPriceChanged,
    sellOrderAmountChanged,
    sellOrderPriceChanged, tokenWithdrawAmountChanged
} from '../../store/actions';
import {useSelector, useDispatch} from "react-redux";

import {
    makeBuyOrder,
    makeSellOrder
} from '../../store/interactions';


const showFormView = ({
                          dispatch,
                          exchange,
                          web3,
                          token,
                          account,
                          buyOrder,
    sellOrder,
                          showBuyTotal,
                          showSellTotal

                      }) => {


    return <Tabs defaultActiveKey="buy" className="bg-dark text-white">

        <Tab eventKey="buy" title="Buy" className="bg-dark">
            <form onSubmit={(event) => {

                event.preventDefault();
                makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account)
            }
            }>
                <div className="form-group small">
                    <label>Buy DRT Amount</label>
                    <div className="input-group">
                        <input type="text"
                               placeholder="Buy Amount"
                               onChange={(e) => dispatch(buyOrderAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                </div>
                <div className="form-group small">
                    <label>Buy Price</label>
                    <div className="input-group">
                        <input type="text"
                               placeholder="Buy Price"
                               onChange={(e) => dispatch(buyOrderPriceChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Buy Order</button>
                    <small>{showBuyTotal ? <span>Total: {buyOrder.amount * buyOrder.price} ETH</span> : null}</small>
                </div>
            </form>
        </Tab>
        <Tab eventKey="sell" title="Sell" className="bg-dark">
            <form onSubmit={(event) => {

                event.preventDefault();
                makeSellOrder(dispatch, exchange, token, web3, sellOrder, account)
            }
            }>
                <div className="form-group small">
                    <label>Sell DRT Amount</label>
                    <div className="input-group">
                        <input type="text"
                               placeholder="Sell Amount"
                               onChange={(e) => dispatch(sellOrderAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                </div>
                <div className="form-group small">
                    <label>Sell Price</label>
                    <div className="input-group">
                        <input type="text"
                               placeholder="Sell Price"
                               onChange={(e) => dispatch(sellOrderPriceChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm">Sell Order</button>
                    <small>{showSellTotal ? <span>Total: {sellOrder.amount * sellOrder.price} ETH</span> : null}</small>
                </div>
            </form>
        </Tab>
    </Tabs>
}

function NewOrder() {
    const buyOrder = useSelector(buyOrderSelector);
    const sellOrder = useSelector(sellOrderSelector);

    const exchange = useSelector(exchangeSelector);
    const token = useSelector(tokenSelector);
    const account = useSelector(accountSelector);
    const web3 = useSelector(web3Selector);
    const showForm = !buyOrder.making && !sellOrder.making;
    const showBuyTotal = buyOrder.amount && buyOrder.price;
    const showSellTotal = sellOrder.amount && sellOrder.price;

    const dispatch = useDispatch();


    return <div className="card bg-dark text-white">
        <div className="card-header">
            New order
        </div>
        <div className="card-body">
            {showForm? showFormView({
                dispatch,
                exchange,
                token,
                account,
                web3,
                buyOrder,
                sellOrder,
                showBuyTotal,
                showSellTotal
            }): <Spinner/>}
        </div>

    </div>

}

export default NewOrder;