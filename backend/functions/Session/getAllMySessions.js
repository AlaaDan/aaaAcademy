const { db } = require('../../services/db')
const { sendResponse, sendError } = require("../../responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");

// Function to get all the user sessions from the DB 
export async function getAllMySessions(userID){
    try {
        const usersSessions = await db.scan({
            TableName: 'sessionsDB',
            FilterExpression: 'bookedBy.userID = :userID',
            ExpressionAttributeValues: {
                ':userID': userID
            }
        }).promise()
        //console.log("Users Sessions ", usersSessions)
        if (usersSessions.Items.length === 0) {
            return { message: 'No sessions found' }
        }
        return usersSessions
        
    } catch (error) {
        throw new Error('An error occurred while fetching the sessions')
    }
}

exports.handler = middy (async (event) => {
    try{
        const userID  = event.userID
        //console.log("User ID ", userID)
        const sessions = await getAllMySessions(userID)
        return sendResponse(200, sessions.Items)
    } catch (error) {
        return sendError(404, error.message)
    }
}
).use(validateToken)

