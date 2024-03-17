import * as bcrypt from 'bcryptjs';
import { createToken } from "../../middleware/auth";
import { sendResponse, sendError } from '../../responses/index';
import middy from '@middy/core';
import { validateLogin } from "../../middleware/validation";
import { checkUser } from './signup';
import { checkPendingUser } from './approveUser';

// Check if the user is in the database and if the password is correct, 
//If yes decrypt it and return the user info

interface User {
    PK: string;
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    email: string;
    approved: boolean;
    admin: boolean;
}

interface Event {
    body: string;
    error?: string;
}
export async function login(userName: string, password: string){

    const userInDB = await checkUser(userName.toLowerCase())
    
    if(userInDB.Items?.length === 0){
        const userInPendingDB = await checkPendingUser(userName.toLowerCase())
        if (userInPendingDB.Items?.length === 0) {
            throw new Error('User not found, please try again.')
        } else {
            throw new Error('User is not approved, please try again later.')
        }
    } else {
        //
        const user = userInDB.Items?.[0]
        const passMatch = await bcrypt.compare(password, user?.password)
        if(passMatch){
            return user
        } else {
            throw new Error('Password is incorrect, please try again.')
        }
    }
};

exports.handler = middy() .handler(async (event: Event)=>{
    try{
        const body = JSON.parse(event.body)
        const { userName, password } = body

        if (event.error) {
            return sendError(400, event.error)
        }

        // Validate the user
        const user = await login(userName, password)
        console.log('user: ', user?.admin)

        // Create a token
        const token = createToken(user?.userName, user?.PK, user?.admin)
        console.log('token: ', token)

        return sendResponse(200, {sucess: true, 
            msg: "Successfully logged in", 
            UserInfo: {
                userName: user?.userName,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                userID: user?.PK
            }, token: token})
    } catch (err) {
        console.error(err)
        return sendError(400, err.message)
    }
}).use(validateLogin);