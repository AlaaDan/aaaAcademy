const bcrypt = require('bcryptjs');
const { sendResponse, sendError } = require('../../responses/index')
const middy = require('@middy/core')
const { validatePassChange } = require("../../middleware/validation")
const { checkUser } = require('./signup')
const { db } = require('../../services/db')
const { validateToken } = require('../../middleware/auth')

// Function to check if the password and re-typepassword match
function checkPassMatch(newPassword, retypePassword){
    if(newPassword !== retypePassword){
        return true
    }
}

// Function to handle password change requests
export async function handleChangePasswordRequest(event, currentPassword, newPassword, retypePassword) {
    // Get the username from the token
    const userName = event.userName;

    // Find the user by id
    const user = await checkUser(userName)
    if(user.Items.length === 0){
        throw new sendError(400, {msg: 'User not found, please try again.'})
    }
    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.Items[0].password);
    if (!isMatch) {
        throw new sendError(400, {msg: 'Incorrect password, please try again.'})
    }else {
        // Check if the new password and re-type password match
        const passcheck = checkPassMatch(newPassword, retypePassword)
        if(passcheck){
            throw new sendError(400, {msg: 'Passwords do not match, please try again.'})
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
            }
        }).promise()
        return user
    }
}

exports.handler = middy() .handler(async (event)=>{
    try{
        const body = JSON.parse(event.body)
        const { password, newPassword, retypePassword } = body

        if (event.error) {
            return sendError(400, {msg: event.error})
        }
        // Validate the user
        const user = await handleChangePasswordRequest(event, password, newPassword, retypePassword)
        return sendResponse(200, {sucess: true, 
            msg: "Password changed successfully."})
    } catch (err) {
        console.error(err)
        return sendError(400,{msg: JSON.parse(err.body).msg})
    }
})
.use(validateToken)
.use(validatePassChange)


