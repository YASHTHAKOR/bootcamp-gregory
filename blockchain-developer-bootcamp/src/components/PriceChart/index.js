import React from 'react';
import Chart from 'react-apexcharts';
import {useSelector} from 'react-redux';
import Spinner from '../Commons/Spinner';
import {chartOptions, dummyData} from './config';
import {priceChatLoadedSelector, priceChartSelector} from '../../store/selectors';

const priceSymbol = (lastPriceChange) => {
    let output;
    if(lastPriceChange === '+') {
        output = <span className="text-success">&#9650;</span>
    } else {
        output = <span className="text-danger">&#9660;</span>
    }

    return output;
}

const showPriceChart = (priceChart) => {
    return <div className="price-chart">
        <div className="price">
            <h4>DNR/ETH&nbsp; {priceSymbol(priceChart.lastPriceChange)} {priceChart.lastPrice}</h4>
        </div>
            <Chart options={chartOptions} series={priceChart.series} type='candlestick' widht="100%" height="100%"/>
    </div>
}

function PriceChart () {

    const priceChartLoaded = useSelector(priceChatLoadedSelector);
    const priceChart = useSelector(priceChartSelector);

    return <div className="card bg-dark text-white">

        <div className="card-header">
            Price Chart
        </div>
        <div className="card-body">
            {priceChartLoaded?showPriceChart(priceChart): <Spinner/>}
        </div>

    </div>
}

export default PriceChart;