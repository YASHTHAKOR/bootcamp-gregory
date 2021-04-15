const {tokens, ether, EVM_MESSAGE, ETHER_ADDRESS} = require('./helpers');

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Exchange', ([deployer, feeAccount, user1]) => {

    let token;
    let exchange;
    const feePercent = 10;

    beforeEach(async () => {
        //Deploy Token
        token = await Token.new();

        //Transfer some tokens to user1
        token.transfer(user1, tokens(100), {from: deployer});

        // Deploy exchange
        exchange = await Exchange.new(feeAccount, feePercent);

    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {

            const result = await exchange.feeAccount();
            result.should.equal(feeAccount);

        });

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        })
    });

    describe('fallback', () => {
        it('reverts when ether is sent', async () => {
            await exchange.sendTransaction({value: 1, from : user1}).should.be.rejectedWith(EVM_MESSAGE);
        });
    });

    describe('Depositing tokens', () => {

        let result;
        let amount;

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount,{from: user1});
                result = await exchange.depositToken(token.address, amount, {from: user1});
            })


            it('tracks the token deposit', async () => {
                let balance;
                balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());

                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());


            });

            it('emits deposit event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Deposit');
                const event = log.args;
                event.token.should.equal(token.address, 'Token Address is correct');
                event.user.should.equal(user1, 'User Address is correct');
                event.amount.toString().should.equal(amount.toString(), 'Amount is correct');
                event.balance.toString().should.equal(amount.toString(), 'Balance is correct');

            })
        });

        describe('failure', () => {

            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
            })

            it('fails when no token is approved', async () => {
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
            })


        });

    });

    describe('depositing Ether', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            result = await exchange.depositEther({from: user1, value: amount})
        });

        it('tracks the ether deposit', async () => {
            let balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.be.equal(amount.toString());
        });

        it('emits deposit event', async () => {
            const log = result.logs[0];
            log.event.should.eq('Deposit');
            const event = log.args;
            event.token.should.equal(ETHER_ADDRESS, 'Token Address is correct');
            event.user.should.equal(user1, 'User Address is correct');
            event.amount.toString().should.equal(amount.toString(), 'Amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'Balance is correct');

        })
    })

})

