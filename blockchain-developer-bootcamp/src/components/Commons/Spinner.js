import React from 'react';

export default function({type}) {
    if(type === 'table') {
        return (<tbody className="spinner border text-light text-center"><tr></tr></tbody>)
    } else {
        return (<div className="spinner border text-light text-center"/>)
    }
}