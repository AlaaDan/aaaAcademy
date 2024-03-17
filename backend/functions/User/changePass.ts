import * as bcrypt from 'bcryptjs';
import { sendResponse, sendError } from '../../responses/index';
import middy from '@middy/core';
import { validatePassChange } from "../../middleware/validation";
import { checkUser } from './signup';
import { db } from '../../services/db';
import { validateToken } from '../../middleware/auth';

interface User {
    PK: string;
    password: string;
    [key: string]: any;
}

interface Event {
    body: string;
    error?: string;
    userName: string;
}
// Function to check if the password and re-typepassword match
function checkPassMatch(newPassword: string, retypePassword: string): boolean{
    return newPassword !== retypePassword
}

// Function to handle password change requests
export async function handleChangePasswordRequest(event: Event, currentPassword: string, newPassword: string, retypePassword: string): Promise<User> {
    // Get the username from the token
    const userName = event.userName;

    // Find the user by id
    const user = await checkUser(userName)
    if(!user.Items || user.Items.length === 0){
        throw sendError(400,'User not found, please try again.')
    }
    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.Items[0].password);
    if (!isMatch) {
        throw sendError(400,'Incorrect password, please try again.')
    }else {
        // Check if the new password and re-type password match
        const passcheck = checkPassMatch(newPassword, retypePassword)
        if(passcheck){
            throw sendError(400, 'Passwords do not match, please try again.')
        }
        // Hash the new password and update it in the database
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(newPassword, salt);
        // Change the password in the database
        await db.update({
            TableName: 'academyUserDB',
            Key: {
                PK: user.Items[0].PK
            },
            UpdateExpression: 'set password = :p',
            ExpressionAttributeValues: {
                ':p': newPass
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        user.Items[0].password = newPass
        return user.Items[0] as User
    }
}

exports.handler = middy() .handler(async (event: Event)=>{
    try{
        const body = JSON.parse(event.body)
        const { password, newPassword, retypePassword } = body

        if (event.error) {
            return sendError(400, event.error)
        }
        // Validate the user
        const user = await handleChangePasswordRequest(event, password, newPassword, retypePassword)
        return sendResponse(200, {sucess: true, 
            msg: "Password changed successfully."})
    } catch (err) {
        console.error(err)
        return sendError(400,JSON.parse(err.body).msg)
    }
})
.use(validateToken)
.use(validatePassChange)