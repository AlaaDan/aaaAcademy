import { sendResponse, sendError } from '../../responses/index';
import { db } from '../../services/db';
import middy from '@middy/core';
import { validateToken } from '../../middleware/auth';

// Book a session by updating the booked field in the DB, using sessionID from params
export async function bookSession(sessionID: string, userName: string, userID: string) {
    const sessionInDB = await db.scan({
        TableName: 'sessionsDB',
        FilterExpression: 'sessionID = :sessionID',
        ExpressionAttributeValues: {
            ':sessionID': sessionID
        }
    }).promise();
            
    console.log('Session in DB:', sessionInDB.Items?.[0])
    if (sessionInDB.Items?.[0].booked === true) {
        return sendError(404,'This session is already booked');
    }
    const sessionDetails = {
        sessionID: sessionID,
        date: sessionInDB.Items?.[0].date,
        time: sessionInDB.Items?.[0].time,
        booked: true,
        bookedBy: {
            userName: userName,
            userID: userID
        }
    };
    await db.update({
        TableName: 'sessionsDB',
        Key: {
            sessionID: sessionID
        },
        UpdateExpression: 'set booked = :b, bookedBy = :bb',
        ExpressionAttributeValues: {
            ':b': true,
            ':bb': {
                userName: userName,
                userID: userID
            }
        }
    }).promise();
    return sessionDetails;
}

exports.handler = middy(async (event: any) => {
    try {
        const sessionID = event.pathParameters.sessionID;
        // Ftech the username from the token
        const userName = event.userName;
        const userID = event.userID;
        const sessionDetails = await bookSession(sessionID, userName, userID);
        return sendResponse(200, sessionDetails);
    } catch (error) {
        
        return sendError(500, error.message);
    }
})
.use(validateToken)
