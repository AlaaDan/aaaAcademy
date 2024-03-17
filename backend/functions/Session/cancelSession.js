const { db } = require('../../services/db')
const { sendResponse, sendError } = require("../../responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getMySession } = require('./getMySession')

// function to check if the session in the DB using get my session, then it checks if  the date and time for the session not in the past, then check if the sesssion time is not less than 24 h then we cancle it 
export async function cancelSession(sessionID){
    try {
        const currentSession = await getMySession(sessionID)
        const currentSessionDate = new Date(currentSession.Items[0].date + ' ' + currentSession.Items[0].time);
        if (currentSessionDate < new Date()) {
            throw new Error('Current session is in the past and cannot be cancelled');
        }
        const timeDifference = currentSessionDate.getTime() - new Date().getTime();
        if (timeDifference < 24 * 60 * 60 * 1000) {
            throw new Error('Current session is less than 24 hours away and cannot be cancelled');
        }
        if (sessionID === currentSession.Items[0].sessionID) {
            const session = await db.update({
                TableName: 'sessionsDB',
                Key: {
                    sessionID: sessionID
                },
                UpdateExpression: "set booked = :booked, bookedBy = :bookedBy",
                ExpressionAttributeValues: {
                    ':booked': false,
                    ':bookedBy': 'None'
                },
                ReturnValues: "ALL_NEW"
            }).promise()
            return session
        }
    } catch (error) {
        console.error('Error in cancelSession', error)
        throw error
    }
}

exports.handler = middy(async (event) => {
    try {
        const sessionID = event.pathParameters.sessionID
        const session = await cancelSession(sessionID)
        return sendResponse(200, session)
    } catch (error) {
        console.error("Error in Cancelling Session",error)
        return sendError(400, error.message)
    }
})
.use(validateToken)
