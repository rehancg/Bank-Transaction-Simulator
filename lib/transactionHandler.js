const chalk = require('chalk');
const sessionHandler = require('./sessionHandler');
const debtHanlder = require('./debtHandler');
const logger = require('./logger');

const topUp =  (amount) => {
    try {
        // validate is numeric
        if(isNaN(amount)){
            logger.error('Invalid amount entered!')
            return false;
        }
        const username = sessionHandler.getUsername();
        if(username){
           const user = sessionHandler.getUserByUsername(username);
           let newUser = {
               ...user,
               balance: parseFloat(user.balance) + parseFloat(amount)
           }
           debtHanlder.updateDebtsOnTopup(amount,username);
           sessionHandler.updateUser(newUser);
           logger.success(`Your balance is ${newUser.balance > 0 ? newUser.balance : 0.00}\n`);
           return newUser;
        }else{
            logger.error('Unauthorized! Please login to continue.');
            return false;
        }
    } catch (error) {
        logger.error(`Error: ${error.message}`)
        return false;
    }
}

const pay = (args) => {
    try {
        let to = args[1]
        let amount = args[2]
        if(isNaN(amount)) {
            logger.error('Invalid amount entered \n');
            return false;
        }

        const reciever = sessionHandler.getUserByUsername(to);
        if(!reciever){
            logger.error('Error: invalid recipient \n');
            return false;
        }
        const sender = sessionHandler.getUserByUsername(sessionHandler.getUsername());

        // Max amount that sender can send
        let sendingAmount = 0;
        let debtAmount = 0;
        if(sender.balance >= amount){
            sendingAmount = amount;
        }else{
            if(sender.balance > 0){
                sendingAmount = sender.balance 
                debtAmount = amount - sendingAmount;
            }else{
                debtAmount = amount;
            }
        }

        // Update senders balance
        let updatedSenderProfile = {
            ...sender,
            balance: parseFloat(sender.balance) - parseFloat(amount)
        }
        sessionHandler.updateUser(updatedSenderProfile);

        // Update reciever balance
        let newReciever = {
            ...reciever,
            balance: parseFloat(sendingAmount) + parseFloat(reciever.balance)
        }
        sessionHandler.updateUser(newReciever);

        // Update debt on receiving user
        debtHanlder.updateDebtsOnTopup(sendingAmount,to);

        logger.success(`Transfered ${sendingAmount} to ${to}`)

        const sendersNewFund = sessionHandler.getUserByUsername(sessionHandler.getUsername());
        logger.success(`Your balance is ${sendersNewFund.balance > 0 ? sendersNewFund.balance : 0}\n`)

        // Update senders debt only if balance is negative
        if(debtAmount > 0){
            debtHanlder.upsertDebt(sessionHandler.getUsername(),to,debtAmount)
        }
    } catch (error) {
        logger.error('Error: transaction failed');
    }
    
}

module.exports = {
    topUp,
    pay,
}