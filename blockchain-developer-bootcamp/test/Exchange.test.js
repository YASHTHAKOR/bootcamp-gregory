const {tokens, ether, EVM_MESSAGE, ETHER_ADDRESS} = require('./helpers');

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {

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
            await exchange.sendTransaction({value: 1, from: user1}).should.be.rejectedWith(EVM_MESSAGE);
        });
    });

    describe('Depositing tokens', () => {

        let result;
        let amount;

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, {from: user1});
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
            result = await exchange.depositEther({from: user1, value: amount});
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
    });

    describe('withdraw ether', async () => {

        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            await exchange.depositEther({from: user1, value: amount});
        });

        describe('success', async () => {

            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, {from: user1});
            });

            it('withdraw ether', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.be.equal('0');
            })

            it('emits the "withdraw" event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(ETHER_ADDRESS, 'Token Address is correct');
                event.user.should.equal(user1, 'User Address is correct');
                event.amount.toString().should.equal(amount.toString(), 'Amount is correct');
                event.balance.toString().should.equal('0', 'Balance is correct');
            })

        });
        describe('failure', async () => {
            it('rejects when insufficient funds', async () => {
                await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
            })
        });

    })

    describe('withdraw tokens', () => {

        let result;
        let amount;

        describe('success', async () => {

            beforeEach(async () => {
                amount = tokens(10);
                // deposit token to withdraw
                await token.approve(exchange.address, amount, {from: user1});
                await exchange.depositToken(token.address, amount, {from: user1});

                //deposit
                result = await exchange.withdrawToken(token.address, amount, {from: user1});

            });

            it('withdraws token funds', async () => {
                const balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal('0')
            });

            it('emits the "withdraw" event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(token.address, 'Token Address is correct');
                event.user.should.equal(user1, 'User Address is correct');
                event.amount.toString().should.equal(amount.toString(), 'Amount is correct');
                event.balance.toString().should.equal('0', 'Balance is correct');
            })

        })

        describe('failure', async () => {
            it('rejects Ether withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
            });

            it('Fails for insufficient balance', async () => {
                await exchange.withdrawToken(token.address, tokens(100), {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
            })
        });

    });

    describe('Check balance', () => {
        beforeEach(async () => {
            await token.approve(exchange.address, tokens(10), {from: user1});
            await exchange.depositToken(token.address, tokens(10), {from: user1});
        });

        it('returns balance', async () => {
            const balanceOf = await exchange.tokens(token.address, user1);
            balanceOf.toString().should.be.equal(balanceOf.toString());
        })
    });

    describe('making orders', async () => {
        let result;

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1});
        });

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount();
            orderCount.toString().should.equal('1');
            const order = await exchange.orders('1');
            order.id.toString().should.equal('1', 'id is correct');
            order.user.should.equal(user1, 'user is correct');
            order.tokenGet.should.equal(token.address, 'token get is correct');
            order.amountGet.toString().should.equal(tokens(1).toString(), 'Amount get is correct');
            order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Token Give is correct');
            order.amountGive.toString().should.equal(ether(1).toString(), 'Amount Give is correct');
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        });

        it('emits an "Order event', async () => {
            const log = result.logs[0];
            log.event.should.eq('Order');
            const event = log.args;
            event.id.toString().should.equal('1', 'id is correct');
            event.user.should.equal(user1, 'user is correct');
            event.tokenGet.should.equal(token.address, 'token get is correct');
            event.amountGet.toString().should.equal(tokens(1).toString(), 'Amount get is correct');
            event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Token Give is correct');
            event.amountGive.toString().should.equal(ether(1).toString(), 'Amount Give is correct');
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        });


    });

    describe('order actions', async () => {

        beforeEach(async () => {
            // user1 deposit ether
            await exchange.depositEther({from: user1, value: ether(1)});

            //Give tokens to user2
            await token.transfer(user2, tokens(2), {from: deployer});
            //user2 deposits token to add balance in exchange
            await token.approve(exchange.address, tokens(2),{from: user2});
            await exchange.depositToken(token.address, tokens(2), {from : user2});

            // user1 makes an order to buy tokens with ether
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1});
        });

        describe('Cancelling Orders', async () => {

            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1',{from: user1});
                });

                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1);
                    orderCancelled.should.equal(true);
                });

                it('emits a "cancel" event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Cancel');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct');
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'Amount get is correct');
                    event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Token Give is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), 'Amount Give is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                });



            })

            describe('failure', async () => {
                it('rejects invalid order id', async()=> {
                    const invalidOrderId = 999999;
                    await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_MESSAGE);
                });

                it('reject unauthorized cancelations', async () => {
                    await exchange.cancelOrder('1', {from: user2}).should.be.rejectedWith(EVM_MESSAGE);
                })
            })

        });

        describe('filling Orders', async () => {
            let result;

            describe('success', async() => {
                beforeEach(async () => {
                    // user2 fills order
                    result = await exchange.fillOrder('1', {from: user2});
                })

                it('executes the trade and charges fees', async () => {
                   let balance;
                   balance = await exchange.balanceOf(token.address, user1);
                   balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens');
                   balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
                   balance.toString().should.equal(ether(1).toString(), 'user2 received Ether');
                   balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
                   balance.toString().should.equal('0', 'user1 Ether is deducted');
                   balance = await exchange.balanceOf(token.address, user2);
                   balance.toString().should.equal(tokens(0.9).toString(), 'user2 token is deducted');
                   const feeAccount = await exchange.feeAccount();
                   balance = await exchange.balanceOf(token.address, feeAccount);
                   balance.toString().should.equal(tokens(0.1).toString(), 'FeeAccount received Fee');
                });

                it('update Fee orders', async () => {
                    const orderFilled = await exchange.orderFilled(1);
                    orderFilled.should.equal(true);
                });

                it('emits a "Trade" event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Trade');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'Order id is correct');
                    event.user.should.equal(user1, 'Receiver id is correct');
                    event.tokenGet.should.equal(token.address, 'Received token is correct');
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'Amount get is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'Selling token is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), 'Selling amount is correct');
                    event.userFill.should.equal(user2,'Filler user address is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                })

            });

            describe('failure', async () => {

                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999;
                    await exchange.fillOrder(invalidOrderId, {from:user2}).should.be.rejectedWith(EVM_MESSAGE);
                });

                it('rejects already-filled orders', async () => {

                    // Fill the orders
                    await exchange.fillOrder('1',{from:user2}).should.be.fulfilled;

                    // fill the already filled order
                    await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_MESSAGE);

                });

                it('rejects cancel orders', async () => {
                    //cancel the order
                    await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled;
                    // try to fill the order
                    await exchange.fillOrder('1', {from : user2}).should.be.rejectedWith(EVM_MESSAGE);
                })

            });
        })
    })

})

