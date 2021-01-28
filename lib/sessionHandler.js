'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require("path");
const _ = require('lodash');

const usersJsonPath = path.resolve(__dirname, "../data/users.json");

var loggedInUser = '';

const loginAsync = async(args) => {
    try {
        let users = getAllUsers();

        if(args[1]){
            // Check if user exists;
            const user = users.find(user => user.username === args[1])
            if(!user){
                // If user not exists save the new user
                users.push({
                    username: args[1],
                    balance: 0
                });
                fs.writeFileSync(usersJsonPath,JSON.stringify(users));
            }
            console.log(chalk.green(`Hello ${args[1]} \nYour balance is ${user ? user.balance > 0 ? user.balance : 0.00 : 0.00}\n`));
            loggedInUser = args[1];
            return args[1];
        }else{
            console.log(chalk.red('Error: username cannot be empty'));
        }
        
    } catch (error) {
        console.log(chalk.red('Login failed! '+error.message));
    }
}

const logout = () => {
    loggedInUser = '';
    console.log(chalk.green('Logout successfully\n'));
}

const updateUser = (data) => {
    try {
        let users = getAllUsers();
        let updatedUsers = users.map(user=>{
            if(user.username === data.username) return data;
            return user
        })

        fs.writeFileSync(usersJsonPath,JSON.stringify(updatedUsers));
         
    } catch (error) {
        console.log(chalk.red('Updating user failed! '+error.message)); 
    }
}

const getUserByUsername = (username) => {
    try {
        
        let users = getAllUsers();

        const user = users.find(user => user.username === username)

        return user;

    } catch (error) {
        console.log(chalk.red(`Error: ${error.message}`))
    }
}

const getAllUsers  = () => {
    try {
        const usersBuffer = fs.readFileSync(usersJsonPath);
        return _.isArray(JSON.parse(usersBuffer)) ? JSON.parse(usersBuffer) : [];
    } catch (error) {
        return []
    }
}


module.exports = {
    loginAsync,
    logout,
    updateUser,
    getUserByUsername,
    getUsername:() => {
        return loggedInUser;
    }
}