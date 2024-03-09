const bcrypt = require('bcryptjs');
import { createToken } from "../../middleware/auth";
const { sendResponse, sendError } = require('../../responses/index');
const middy = require('@middy/core');
import { validateLogin } from "../../middleware/validation";
import { checkUser } from './signup';
const { checkPendingUser } = require('./approveUser');

// Check if the user is in the database and if the password is correct, 
//If yes decrypt it and return the user info

export async function login(userName, password){

    const userInDB = await checkUser(userName.toLowerCase(), password)
    
    if(userInDB.Items.length === 0){
        const userInPendingDB = await checkPendingUser(userName.toLowerCase())
        if (userInPendingDB.Items.length === 0) {
            throw new Error('User not found, please try again.')
        } else {
            throw new Error('User is not approved, please try again later.')
        }
    } else {
        //
        const user = userInDB.Items[0]
        const passMatch = await bcrypt.compare(password, user.password)
        if(passMatch){
            return user
        } else {
            throw new Error('Password is incorrect, please try again.')
        }
    }
};

exports.handler = middy() .handler(async (event)=>{
    try{
        const body = JSON.parse(event.body)
        const { userName, password } = body

        if (event.error) {
            return sendError(400, {msg: event.error})
        }

        // Validate the user
        const user = await login(userName, password)
        console.log('user: ', user.admin)

        // Create a token
        const token = createToken(user.userName, user.PK, user.admin)
        console.log('token: ', token)

        return sendResponse(200, {sucess: true, msg: "Successfully logged in", token: token, user: user})
    } catch (err) {
        console.error(err)
        return sendError(400, {msg: err.message})
    }
}).use(validateLogin);