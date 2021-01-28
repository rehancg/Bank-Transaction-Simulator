const chalk = require('chalk');
const inquirer = require('inquirer');
const sessionHandler = require('./sessionHandler');
const transactionHandler = require('./transactionHandler');
const debtHandler = require('./debtHandler');

var username = '';

const printHelperMethods = () => {
    console.log(chalk.yellow(`\n[login] - Login with username\n`))
    console.log(chalk.yellow(`[logout] - Logout from the system\n`))
    console.log(chalk.yellow(`[topup] - Topup your account\n`))
    console.log(chalk.yellow(`[pay] - Pay existing user\n`))
    console.log(chalk.yellow(`[my-debts] - Check your debts\n`))
    console.log(chalk.yellow(`[exit] - Close application\n`))
}

const promptInquirer = async () => {
    const res = await inquirer.prompt([{
        name:'command',
        message:`${username} >`,
        type:'string'
    }])

    const args = res.command.split(" ");

    if(args[0] === 'exit'){
        process.exit();
    }

    switch(args[0]){
        case 'login':
            username = await sessionHandler.loginAsync(args);
            debtHandler.printDebts(username)
            break;
        case 'logout':
            username = '';
            sessionHandler.logout();
            break;
        case 'topup':
            transactionHandler.topUp(args[1]);
            break;
        case 'pay':
            transactionHandler.pay(args);
            break;
        case 'my-debts':
            debtHandler.printDebts(sessionHandler.getUsername());
            break;
        case '--help':
            printHelperMethods();
            break;
        default:
            console.log(chalk.yellow("Invalid command! try --help to find avaibale commands\n"));
            break;
    }

    promptInquirer();
}

module.exports = {
    promptInquirer
}