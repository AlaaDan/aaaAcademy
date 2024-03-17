const { sendResponse, sendError } = require('../../responses/index')
const middy = require('@middy/core')
const { db } = require('../../services/db')
const { checkUser } = require('./signup')
const { validateToken } = require('../../middleware/auth')
const { validateInfo } = require('../../middleware/validation')


export async function changeUserInfo(event, firstName, lastName, email) {
    const userName = event.userName;
    const user = await checkUser(userName)
    if(user.Items.length === 0){
        throw new sendError(400, {msg: 'User not found, please try again.'})
    }
    // If the user wants to change only one of the fields the other fields will be the same
    if(!firstName){
        firstName = user.Items[0].firstName
    }
    if(!lastName){
        lastName = user.Items[0].lastName
    }
    if(!email){
        email = user.Items[0].email
    }
    await db.update({
        TableName: 'academyUserDB',
        Key: {
            PK: user.Items[0].PK
        },
        UpdateExpression: 'set firstName = :f, lastName = :l, email = :e',
        ExpressionAttributeValues: {
            ':f': firstName,
            ':l': lastName,
            ':e': email
        }
        
    }).promise()
    // Fetch the update user and return it
    const updatedUser = await checkUser(userName)
    return updatedUser
}

exports.handler =  middy() .handler(async (event)=>{
    try{
        const body = JSON.parse(event.body)
        const { firstName, lastName, email } = body
        if (event.error) {
            return sendError(400, {msg: event.error})
        }
        const user = await changeUserInfo(event, firstName, lastName, email)
        return sendResponse(200, {
            msg: 'User information updated successfully', 
            UserInfo:{
                firstName: user.Items[0].firstName,
                lastName: user.Items[0].lastName,
                email: user.Items[0].email
                
            }})
    }catch(err){
        return sendError(400, {msg: err.message})
    }
})
.use(validateToken)
.use(validateInfo)