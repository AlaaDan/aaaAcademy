const { db } = require('../../services/db')
const { sendResponse, sendError } = require("../../responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getMySession } = require('./getMySession')
const { validateEdit } = require('../../middleware/validation')

export async function checkNewSession(session){
    // Check if the session exists using the date and time of the session
    try {
        const sessionDate = session.date
        const sessionTime = session.time
        const sessionInDB = await db.scan({
            TableName: 'sessionsDB',
            FilterExpression: '#date = :sessionDate AND #time = :sessionTime',
            ExpressionAttributeValues: {
                ':sessionDate': sessionDate,
                ':sessionTime': sessionTime
            },
            ExpressionAttributeNames: {
                '#date': 'date',
                '#time': 'time'
            }
        }).promise()
        //console.log("Session in DB ", sessionInDB.Items[0])
        
        // if the session exists return it otherwise return an error
        if (sessionInDB.Items.length != 0) {
            return sessionInDB.Items[0]
        } else {
            throw new Error('Session not found')
        }   
    } catch (error) {
        console.error(error)
        throw new Error('An error occurred while checking the session')
    } 
}

export async function editMySession(session){
    try {
        // Fetch current session details from the DB
        const currentSession = await getMySession(session.sessionID)

        // Check if the current session is in the past
        const currentSessionDate = new Date(currentSession.Items[0].date + ' ' + currentSession.Items[0].time);
        if (currentSessionDate < new Date()) {
            throw new Error('Current session is in the past and cannot be changed');
        }

        // Check if the current session is less than 24 hours away
        const timeDifference = currentSessionDate.getTime() - new Date().getTime();
        if (timeDifference < 24 * 60 * 60 * 1000) {
            throw new Error('Current session is less than 24 hours away and cannot be changed');
        }

        // Check if the current session is booked, if it is then check if the new session is booked and if not then update the sessions
        if (currentSession.Items[0].booked === true) {
            const newSession = await checkNewSession(session)

            // Check if the new session is in the past
            const newSessionDate = new Date(newSession.date + ' ' + newSession.time);
            if (newSessionDate < new Date()) {
                throw new Error('New session is in the past and cannot be booked');
            }
            
            if (newSession.booked === false) {
                const updatedNewSession = await db.update({
                    TableName: 'sessionsDB',
                    Key: {
                        'sessionID': newSession.sessionID
                    },
                    UpdateExpression: 'set booked = :booked, bookedBy = :bookedBy',
                    ExpressionAttributeValues: {
                        ':booked': true,
                        ':bookedBy': currentSession.Items[0].bookedBy
                    },
                    ReturnValues: 'ALL_NEW'
                }).promise()

                await db.update({
                    TableName: 'sessionsDB',
                    Key: {
                        'sessionID': currentSession.Items[0].sessionID
                    },
                    UpdateExpression: 'set booked = :booked, bookedBy = :bookedBy',
                    ExpressionAttributeValues: {
                        ':booked': false,
                        ':bookedBy': 'None'
                    },
                    ReturnValues: 'ALL_NEW'
                }).promise()
                return updatedNewSession
            } else {
                throw new Error('Session already booked')
            }
        } 
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.handler = middy (async (event) => {
    try{
        const body = JSON.parse(event.body)
        const session = {
            sessionID: body.sessionID,
            date: body.date,
            time: body.time
        }
        const updatedSession = await editMySession(session)
        //console.log("Updated Session ", updatedSession)
        return sendResponse(200, updatedSession)
    } catch (error) {
        return sendError(404, error.message)
    }
})
.use(validateToken)
.use(validateEdit)