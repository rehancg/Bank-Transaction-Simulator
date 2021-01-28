var expect = require("chai").expect;
var sessionHandler = require('../lib/sessionHandler');
var transactionHandler = require('../lib/transactionHandler');
const path = require("path");
var fs = require('fs');

const usersJsonPath = path.resolve(__dirname, "../data/users.json");
const debtJsonPath = path.resolve(__dirname, "../data/debt.json");

const resetJsons = () => {
    fs.writeFileSync(usersJsonPath,'[]');
    fs.writeFileSync(debtJsonPath,'[]');
}

describe("Banking simulator", () => {

    describe("#authentication",()=>{
        before(()=>{
            resetJsons();
        })

        it('login succesfully with correct credentials', async ()=>{
            var commands = ['login','Alice']
            var response = await sessionHandler.loginAsync(commands);
            expect(response).to.equal('Alice');
        })
    });

    describe("#topup", () => {
        before(()=>{
            resetJsons();
        })

        it('should return false with string value', () => {
            var result = transactionHandler.topUp('Thousand');
            expect(result).to.equal(false);
        })
        it('should return false top up without logging', () => {
            sessionHandler.logout()
            var result = transactionHandler.topUp(100);
            expect(result).to.equal(false);
        })
        it('should top up correctly', async () => {
            var commands = ['login','Alice']
            await sessionHandler.loginAsync(commands);
            transactionHandler.topUp(100);
            var result = sessionHandler.getUserByUsername('Alice');
            expect(result.balance).to.equal(100);
        })
    })

    describe('#pay&debt', () => {

        beforeEach(async function() {
            resetJsons();
            var userCreationCommands1 = ['login','Alice']
            var userCreationCommands2 = ['login','Bob']
            await sessionHandler.loginAsync(userCreationCommands1);
            await sessionHandler.loginAsync(userCreationCommands2);
        });

        it('payment should be made correctly',async ()=>{
            transactionHandler.topUp(1000)
            transactionHandler.pay(['pay','Alice','500'])
            const userAlice = sessionHandler.getUserByUsername('Alice');
            expect(userAlice.balance).to.equal(500);
        })


        it('debt should be calculated correctly',()=>{
            transactionHandler.topUp(100)
            transactionHandler.pay(['pay','Alice','200'])
            const userBob = sessionHandler.getUserByUsername('Bob');
            expect(userBob.balance).to.equal(-100);
        })
    })
    


})