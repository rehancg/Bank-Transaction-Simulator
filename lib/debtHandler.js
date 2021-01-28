const chalk = require("chalk");
const _ = require('lodash');
const fs = require('fs')
const path = require("path");
const sessionHandler = require("./sessionHandler");

const debtJsonPath = path.resolve(__dirname, "../data/debt.json");

const upsertDebt = (from,to,amount) => {
    try {
        let debts  = getAllDebts();
        let exstingDebtIndex = debts.findIndex(debt => debt.to === to && debt.from === from);
        if(exstingDebtIndex === -1){
            debts.push({
                from,
                to,
                amount
            })
            console.log(chalk.yellow(`Owing ${amount} to ${to}\n`))
        }
        else{
            debts[exstingDebtIndex] = {
                ...debts[exstingDebtIndex],
                amount: parseFloat(debts[exstingDebtIndex].amount) + parseFloat(amount)
            }
            console.log(chalk.yellow(`Owing ${debts[exstingDebtIndex].amount} to ${to}\n`))
        }

        fs.writeFileSync(debtJsonPath,JSON.stringify(debts));
    } catch (error) {
        console.log(chalk.red('Error: Updating debt list'))
    }
}

const getAllDebts = () => {
    try {
        const debtBuffer = fs.readFileSync(debtJsonPath);
        return _.isArray(JSON.parse(debtBuffer)) ? JSON.parse(debtBuffer) : [];
    } catch (error) {
        return []
    }
}

const getDebtsByUsername = (username) => {
    const debts = getAllDebts();
    return debts.filter(debt => debt.from === username);
}

const getLoansByUsername = (username) => {
    const debts = getAllDebts();
    return debts.filter(debt => debt.to === username);
}

const printDebts = (username) => {
    const debts = getDebtsByUsername(username);
    const loans = getLoansByUsername(username);
    loans.forEach(debt => {
        console.log(chalk.yellow(`Owing ${debt.amount} from ${debt.from}\n`))
    });

    if(debts.length  == 0 ){
        console.log('You dont have any debts\n')
        return;
    }
    
    debts.forEach(debt => {
        console.log(chalk.yellow(`Owing ${debt.amount} to ${debt.to}\n`))
    });
    
}

const updateDebtsOnTopup = (amount,username) => {
    let availableFromReceived = amount;
        let debts = getAllDebts();
        let updatedDebts = debts.map((debt) => {
            if(debt.from === username){
                // check if debt is payable
                if(availableFromReceived > 0 ){
                    let payingDebtAmount = 0;
                    if(debt.amount >= availableFromReceived){
                        debt.amount = debt.amount - availableFromReceived;
                        payingDebtAmount = availableFromReceived;
                        availableFromReceived = 0;
                    }else{
                        payingDebtAmount = debt.amount;
                        availableFromReceived = availableFromReceived - debt.amount;
                        debt.amount = 0;
                    }

                    let recievingUser = sessionHandler.getUserByUsername(debt.to);
                    if(recievingUser){
                        sessionHandler.updateUser({
                            ...recievingUser,
                            balance: parseFloat(payingDebtAmount) + parseFloat(recievingUser.balance)
                        })
                        console.log(chalk.yellow(`Transfered ${payingDebtAmount} to ${recievingUser.username}\n`))
                    }
                    return debt
                }

                // return existing debts
                return debt
            }
            return debt
        }).filter(debt => debt.amount != 0);
        fs.writeFileSync(debtJsonPath,JSON.stringify(updatedDebts));
}


module.exports = {
    printDebts,
    upsertDebt,
    getAllDebts,
    updateDebtsOnTopup
}