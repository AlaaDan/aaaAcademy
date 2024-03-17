import { db } from '../../services/db'
import { sendResponse, sendError } from "../../responses";
import middy from "@middy/core";
import { validateToken } from "../../middleware/auth";

export async function getMySession(sessionID: string){
    // Checks if the sesssion ID in the DB, if its there return the session ortherwise return an error
    const session = await db.scan({
        TableName: 'sessionsDB',
        FilterExpression: 'sessionID = :sessionID',
        ExpressionAttributeValues: {
            ':sessionID': sessionID
        }
    }).promise()
    if (session.Items?.length === 0) {
        throw new Error('Session not found')
    }
    return session
}

exports.handler = middy (async (event: any) => {
    try{
        // SessionID comes from params and then checks if the sessionID is the same as the user's sessionID
        const sessionID = event.pathParameters.sessionID
        //console.log("Session ID ", sessionID)
        const session = await getMySession(sessionID)
        //console.log("Session ", session)
        if (session.Items?.[0].sessionID === sessionID) {
            return sendResponse(200, session.Items?.[0])
        } else {
            return sendError(403, 'You are not authorized to view this session')
        }
    } catch (error) {
        return sendError(404, error.message)
    }
}).use(validateToken)