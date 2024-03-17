import { db } from '../../services/db'
import { sendResponse, sendError } from "../../responses";
import middy from "@middy/core";
import { validateToken } from "../../middleware/auth";

// Function to get all the user sessions from the DB 
export async function getAllMySessions(userID: string){
    try {
        const usersSessions = await db.scan({
            TableName: 'sessionsDB',
            FilterExpression: 'bookedBy.userID = :userID',
            ExpressionAttributeValues: {
                ':userID': userID
            }
        }).promise()
        //console.log("Users Sessions ", usersSessions)
        if (usersSessions.Items?.length === 0) {
            return { message: 'No sessions found' }
        }
        return usersSessions
        
    } catch (error) {
        throw new Error('An error occurred while fetching the sessions')
    }
}

exports.handler = middy (async (event: any) => {
    try{
        const userID  = event.userID
        //console.log("User ID ", userID)
        const sessions = await getAllMySessions(userID)
        if ("Items" in sessions) {
            return sendResponse(200, sessions.Items)
        } else {
            return sendResponse(200, sessions)
        }
    } catch (error) {
        return sendError(404, error.message)
    }
}
).use(validateToken)

