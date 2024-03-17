import { sendResponse, sendError } from '../../responses/index'
import middy from '@middy/core'
import { db } from '../../services/db'
import { checkUser } from './signup'
import { validateToken } from '../../middleware/auth'
import { validateInfo } from '../../middleware/validation'

interface User {
    firstName: string;
    lastName: string;
    email: string;
    PK: string;
}

interface Event {
    body: string;
    error?: string;
    userName: string;
}

export async function changeUserInfo(event: Event, firstName: string, lastName: string, email: string): Promise<User> {
    const userName = event.userName;
    const user = await checkUser(userName)
    if(user.Items?.length === 0){
        throw sendError(400, 'User not found, please try again.')
    }
    // If the user wants to change only one of the fields the other fields will be the same
    if(!firstName){
        firstName = user.Items?.[0].firstName
    }
    if(!lastName){
        lastName = user.Items?.[0].lastName
    }
    if(!email){
        email = user.Items?.[0].email
    }
    await db.update({
        TableName: 'academyUserDB',
        Key: {
            PK: user.Items?.[0].PK
        },
        UpdateExpression: 'set firstName = :f, lastName = :l, email = :e',
        ExpressionAttributeValues: {
            ':f': firstName,
            ':l': lastName,
            ':e': email
        }
        
    }).promise()
    // Fetch the update user and return it
    const result = await checkUser(userName)
    if (result.Items && result.Items.length > 0) {
        const updatedUser = result.Items[0]
        return updatedUser as User
    }
}

exports.handler =  middy() .handler(async (event: Event)=>{
    try{
        const body = JSON.parse(event.body)
        const { firstName, lastName, email } = body
        if (event.error) {
            return sendError(400, event.error)
        }
        const user = await changeUserInfo(event, firstName, lastName, email)
        return sendResponse(200, {
            msg: 'User information updated successfully', 
            UserInfo:{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
                
            }})
    }catch(err){
        return sendError(400, err.message)
    }
})
.use(validateToken)
.use(validateInfo)