import { db } from '../../services/db'
const bcrypt = require('bcryptjs');
import { createToken } from "../../middleware/auth"
const { sendResponse, sendError } = require('../../responses/index')
const middy = require('@middy/core')
import { validateLogin } from "../../middleware/validation"
import { checkUser } from './signup'
// Check if the user is in the database and if the password is correct, 
//If yes decrypt it and return the user info

export async function login(userName, password){

    const userInDB = await checkUser(userName, password)
    
    if(userInDB.Items.length === 0){
        throw new Error('User not found.')
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
}

exports.handler = middy() .handler(async (event)=>{
    try{
        const body = JSON.parse(event.body)
        const { userName, password } = body

        if (event.error) {
            return sendError(400, {msg: event.error})
        }

        // Validate the user
        const user = await login(userName, password)

        // Create a token
        const token = createToken(user.userName, user.PK)
        console.log('token: ', token)

        return sendResponse(200, {sucess: true, msg: "Successfully logged in", token: token})
    } catch (err) {
        console.error(err)
        return sendError(400, {msg: err.message})
    }
}).use(validateLogin)