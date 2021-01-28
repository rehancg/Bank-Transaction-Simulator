'use strict';

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');

function run() {
    clear();
    console.log(
        chalk.yellow(
            figlet.textSync('Banking App', { horizontalLayout: 'full' })
        )
    )
    inquirer.promptInquirer()
}

run();