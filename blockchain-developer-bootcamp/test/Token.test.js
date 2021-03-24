const Token = artifacts.require('./Token');
const {tokens, EVM_MESSAGE} = require('./helpers');
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Token', ([deployer, receiver]) => {

        let token;

        const name = 'DennisRitchie Token';
        const Symbol = 'DRT';
        const decimals = '18';
        const totalSupply = tokens(1000000).toString();

        beforeEach(async () => {
            token = await Token.new();
        })

        describe('deployment', () => {
            it('tracks the name',  async () => {
                const result = await token.name();
                result.should.equal(name);
                //Read token name
            });

            it('tracks the symbols', async () => {
                const result = await token.symbol();
                result.should.equal(Symbol);
            });

            it('tracks the decimals', async () => {
                const result = await token.decimals();
                result.toString().should.equal(decimals);
            });

            it('tracks the total supply', async () => {
                const result = await token.totalSupply();
                result.toString().should.equal(totalSupply.toString());
            });

            it('assigns the total supply to deployer', async () => {
               const result = await token.balanceOf(deployer);
               result.toString().should.equal(totalSupply.toString());
            });
        });

        describe('sending tokens', () => {

            let result;
            let amount;

            describe('success', async () => {
                beforeEach(async () => {
                    amount = tokens(100);
                    result = await token.transfer(receiver, amount)
                });


                it('transfers token balances', async () => {
                    let balanceOf;

                    balanceOf = await token.balanceOf(receiver);
                    balanceOf.toString().should.be.equal(tokens(100).toString());
                    balanceOf = await token.balanceOf(deployer);
                    balanceOf.toString().should.be.equal(tokens(999900).toString());
                })

                it('emits transfer event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Transfer');
                    const event = log.args;
                    event.from.toString().should.equal(deployer, 'from is correct');
                    event.to.toString().should.equal(receiver, 'to is correct');
                    event.value.toString().should.equal(amount.toString(), 'Value is correct');
                })

            });

            describe('failure', async () => {
                it('rejects insufficient balancers',  async () => {
                    let invalidAmount  = tokens(100000000);
                    await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_MESSAGE);

                    invalidAmount = tokens(10);
                    await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_MESSAGE);

                });

                it('rejects invalid recipients ', async () => {
                    await token.transfer('0x0',amount, {from: deployer}).should.be.rejected;
                });

            });

        })

})