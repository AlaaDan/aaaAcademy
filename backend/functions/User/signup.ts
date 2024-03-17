import * as bcrypt from 'bcryptjs';
import { db } from "../../services/db"
import { nanoid } from "nanoid"
import { sendResponse, sendError } from '../../responses/index'
import { validateUser } from "../../middleware/validation"
import middy from '@middy/core'
import { checkPendingUser } from './approveUser'

interface User{
    PK: string,
    firstName: string,
    lastName: string,
    userName: string,
    password: string,
    email: string,
    approved: boolean,
    admin: boolean
}

interface Event {
    body: string;
    error?: string;
}

export async function checkUser(userName: string){
    const userInDB = await db.scan({
        TableName: 'academyUserDB',
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': userName.toLowerCase()
        }
    }).promise()
    return userInDB
}

export async function encryptPass(pass: string, userName: string){
    const userInDB = await checkUser(userName)
    const userInPendingDB = await checkPendingUser(userName)
    // If the user dosen't exist, encrypt the password
    if(userInDB.Items?.length === 0 && userInPendingDB.Items?.length === 0){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);
        return hash
    } else {
        throw new Error('User already exists, please try again with a different username.')
    }
}

export async function addUser(firstName: string, lastName: string, userID: string, userName: string, encryptedPass: string, email: string): Promise<User>{
    const newUser: User = {
        PK: userID,
        firstName: firstName,
        lastName: lastName,
        userName: userName.toLowerCase(),
        password: encryptedPass,
        email: email,
        approved: false,
        admin: false
    }
    await db.put({
        TableName: 'pendingUserDB',
        Item: newUser
    }).promise()
    return newUser
}

exports.handler = middy () .handler(async (event: Event, context: any) => {
    try{
        const body = JSON.parse(event.body)
        const { firstName, lastName, userName, password, email } = body
        const userID = nanoid(8)
        // Check if the user is in the database, if they are return a msg saying the user already exists
        const userInDB = await checkUser(userName)
        if(userInDB.Items?.length !== 0){
            throw new Error('User already exists, please try again with a different username.')
        }

        if (event.error) {
            return sendError(400, event.error)
        }
        console.log('User name: ', userName)

        // Encrypt the password
        const encryptedPass = await encryptPass(password, userName)

        // Add the user to the database
        const newUser = await addUser(firstName, lastName, userID, userName, encryptedPass, email)

        return sendResponse(200, {sucess: true, UserInfo: newUser})
    } catch (err) {
        console.error(err)
        return sendError(500, err.message)
    }
}).use(validateUser)