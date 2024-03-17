import { db } from '../../services/db'
import { sendResponse, sendError } from "../../responses";
import middy from "@middy/core";
import { validateToken } from "../../middleware/auth";
import { getMySession } from './getMySession'

export async function deleteSession(sessionID: string){
    try {
        const currentSession = await getMySession(sessionID)
        const currentSessionDate = new Date(currentSession.Items?.[0].date + ' ' + currentSession.Items?.[0].time);
        if (currentSessionDate < new Date()) {
            throw new Error('Current session is in the past and cannot be deleted');
        }
        if (sessionID === currentSession.Items?.[0].sessionID && currentSession.Items[0].booked === false) {

            const session = await db.delete({
                TableName: 'sessionsDB',
                Key: {
                    sessionID: sessionID
                }
            }).promise()
            console.log("Session",session)
            return session
        } else {
            throw new Error('Current session is booked and cannot be deleted');
        }
    } catch (error) {
        console.error('Error in deleteSession', error)
        throw error
    }
}

// If the user is admin, they can delete any session, otherwise they can only delete their own sessions
exports.handler = middy(async (event: any) => {
    try {
        const sessionID = event.pathParameters.sessionID
        const isAdmin = event.admin
        console.log("isAdmin",isAdmin)
        if(isAdmin){
            const session = await deleteSession(sessionID)
            return sendResponse(200, session)
        }else{
            return sendError(400, "You are not authorized to delete sessions")
        }
    } catch (error) {
        console.error("Error in Deleting Session",error)
        return sendError(400, error.message)
    }
})
.use(validateToken)