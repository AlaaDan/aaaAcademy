const middy = require('@middy/core')
const { sendError, sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const { validateApprove } = require('../../middleware/validation')
const { validateToken } = require('../../middleware/auth')


export async function checkPendingUser(userName){
    const userInDB = await db.scan({
        TableName: 'pendingUserDB',
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': userName.toLowerCase()
        }
    }).promise()
    return userInDB
}


export async function approveUser(event, userName){
    // Check the user in the pending db and then move it to the user db
    const userInDB = await checkPendingUser(userName)
    if(userInDB.Items.length === 0){
        throw new Error('User not found, please try again.')
    }
    const user = userInDB.Items[0]
    user.approved = true
    // Add the user to the user db
    await db.put({
        TableName: 'academyUserDB',
        Item: user
    }).promise()

    // Delete the user from the pending db
    await db.delete({
        TableName: 'pendingUserDB',
        Key: {
            PK: user.PK
        }
    }).promise()
    return user
}


// Function to handle the request if the user is an admin
exports.handler = middy() .handler(async (event)=>{
    try{
        const isAdmin = event.admin
        console.log('isAdmin: ', isAdmin)
        if(isAdmin){
            const body = JSON.parse(event.body)
            const { userName } = body
            const user = await approveUser(event, userName)
            return sendResponse(200, {success: true, 
                msg: 'User approved', 
                user: user.userName, 
                userID: user.PK})
        } else {
            throw new Error('You are not authorized to approve users.')
        }
    } catch (err) {
        console.error(err)
        return sendError(400, {msg: err.message})
    }
})
.use(validateToken)
.use(validateApprove)