export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    );
}

export const tokens = (n) => ether(n);

export const EVM_MESSAGE = 'VM Exception while processing transaction: revert';