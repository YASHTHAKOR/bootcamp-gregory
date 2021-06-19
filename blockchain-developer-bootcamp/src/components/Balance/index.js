import React, {Fragment, useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {
    web3Selector,
    exchangeSelector,
    tokenSelector,
    accountSelector,
    balancesLoadingSelector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector
} from '../../store/selectors';
import {
    loadBalances,
    depositEther,
    withdrawEther,
    depositToken,
    withdrawToken
} from '../../store/interactions';
import Spinner from "../Commons/Spinner";
import {
    etherDepositAmountChanged,
    etherWithdrawAmountChanged,
    tokenDepositAmountChanged,
    tokenWithdrawAmountChanged
} from '../../store/actions';
import {Tabs, Tab} from 'react-bootstrap';


function Balance() {

    const account = useSelector(accountSelector);
    const exchange = useSelector(exchangeSelector);
    const token = useSelector(tokenSelector);
    const web3 = useSelector(web3Selector);
    const etherBalance = useSelector(etherBalanceSelector);
    const tokenBalance = useSelector(tokenBalanceSelector);
    const exchangeEtherBalance = useSelector(exchangeEtherBalanceSelector);
    const exchangeTokenBalance = useSelector(exchangeTokenBalanceSelector);
    const balanceLoading = useSelector(balancesLoadingSelector);
    const etherDepositAmount = useSelector(etherDepositAmountSelector);
    const etherWithdrawAmount = useSelector(etherWithdrawAmountSelector);
    const tokenDepositAmount = useSelector(tokenDepositAmountSelector);
    const tokenWithdrawAmount = useSelector(tokenWithdrawAmountSelector);

    const dispatch = useDispatch();

    useEffect(() => {
        loadBlockChainData();
    }, []);

    const loadBlockChainData = async () => {
        await loadBalances(dispatch, web3, exchange, token, account);
    }


    const showForm = () => {
        return <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
            <Tab eventKey="deposit" title="deposit" key="deposit" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>ETH</td>
                        <td>{etherBalance}</td>
                        <td>{exchangeEtherBalance}</td>
                    </tr>
                    </tbody>
                </table>
                <form className="row" onSubmit={(event) => {

                    event.preventDefault();
                    depositEther(dispatch, exchange, web3, etherDepositAmount, account)
                }
                }>
                    <div className=" clo-13 col-sm pr-sm-2">
                        <input type="text"
                               placeholder="ETH Amount"
                               onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                    </div>
                </form>
                <table className="table table-dark table-sm small">
                    <tbody>
                    <tr>
                        <td>DNR</td>
                        <td>{tokenBalance}</td>
                        <td>{exchangeTokenBalance}</td>
                    </tr>
                    </tbody>
                </table>

                <form className="row" onSubmit={(event) => {

                    event.preventDefault();
                    depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
                }
                }>
                    <div className=" clo-13 col-sm pr-sm-2">
                        <input type="text"
                               placeholder="Token Amount"
                               onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                    </div>
                </form>

            </Tab>
            <Tab key="withdraw" eventKey="withdraw" title="Withdraw" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>ETH</td>
                        <td>{etherBalance}</td>
                        <td>{exchangeEtherBalance}</td>
                    </tr>
                    </tbody>
                </table>
                <form className="row" onSubmit={(event) => {

                    event.preventDefault();
                    withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
                }
                }>
                    <div className=" clo-13 col-sm pr-sm-2">
                        <input type="text"
                               placeholder="ETH Amount"
                               onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                    </div>
                </form>
                <table className="table table-dark table-sm small">
                    <tbody>
                    <tr>
                        <td>DNR</td>
                        <td>{tokenBalance}</td>
                        <td>{exchangeTokenBalance}</td>
                    </tr>
                    </tbody>
                </table>
                <form className="row" onSubmit={(event) => {

                    event.preventDefault();
                    withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
                }
                }>
                    <div className=" clo-13 col-sm pr-sm-2">
                        <input type="text"
                               placeholder="Token Amount"
                               onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))}
                               className="form-control form-control-sm bg-dark text-white"
                               required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                    </div>
                </form>
            </Tab>
        </Tabs>
    }

    return <div className="card bg-dark text-white">
        <div className="card-header">
            Balance
        </div>
        <div className="card-body">
            {!balanceLoading ? showForm() : <Spinner/>}
        </div>
    </div>


}

export default Balance;