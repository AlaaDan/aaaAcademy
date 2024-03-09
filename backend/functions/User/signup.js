const bcrypt = require('bcryptjs');
import { db } from "../../services/db"
import { nanoid } from "nanoid"
const { sendResponse, sendError } = require('../../responses/index')
import { validateUser } from "../../middleware/validation"
const middy = require('@middy/core')
const { checkPendingUser } = require('./approveUser')


export async function checkUser(userName){
    const userInDB = await db.scan({
        TableName: 'academyUserDB',
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': userName.toLowerCase()
        }
    }).promise()
    return userInDB
}

export async function encryptPass(pass, userName){
    const userInDB = await checkUser(userName, pass)
    const userInPendingDB = await checkPendingUser(userName)
    // If the user dosen't exist, encrypt the password
    if(userInDB.Items.length === 0 && userInPendingDB.Items.length === 0){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);
        return hash
    } else {
        throw new Error('User already exists, please try again with a different username.')
    }
}

export async function addUser(firstName, lastName, userID, userName, encryptedPass, email){
    const newUser = {
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

exports.handler = middy () .handler(async (event, context) => {
    try{
        const body = JSON.parse(event.body)
        const { firstName, lastName, userName, password, email } = body
        const userID = nanoid(8)
        // Check if the user is in the database, if they are return a msg saying the user already exists
        const userInDB = await checkUser(userName, password)
        if(userInDB.Items.length !== 0){
            throw new Error('User already exists, please try again with a different username.')
        }

        if (event.error) {
            return sendError(400, {msg: event.error})
        }
        console.log('User name: ', userName)

        // Encrypt the password
        const encryptedPass = await encryptPass(password, userName)

        // Add the user to the database
        const newUser = await addUser(firstName, lastName, userID, userName, encryptedPass, email)

        return sendResponse(200, {sucess: true, UserInfo: newUser})
    } catch (err) {
        console.error(err)
        return sendError(500, {msg: err.message})
    }
}).use(validateUser)