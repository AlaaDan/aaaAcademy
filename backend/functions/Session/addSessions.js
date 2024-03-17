const { db } = require('../../services/db')
const { sendResponse, sendError } = require("../../responses");
const middy = require("@middy/core");
const { validateSession } = require("../../middleware/validation");
const { validateToken } = require("../../middleware/auth");
const { nanoid } = require("nanoid");

// Check if the date and time already exists in the DB
export async function checkSession(date, time){
    const sessionInDB = await db.scan({
        TableName: 'sessionsDB',
        FilterExpression: '#date = :date AND #time = :time',
        ExpressionAttributeNames: {
            '#date': 'date',
            '#time': 'time'
        },
        ExpressionAttributeValues: {
            ':date': date,
            ':time': time
        }
    }).promise()
    return sessionInDB
} 

export async function addSession(date, time, sessionID, booked, bookedby){
    // Check if the date is in the past
    const sessionDate = new Date(date)
    const currentDate = new Date()
    const sessionInDB = await checkSession(date, time)
    //console.log("Session in DB", sessionInDB)
    if (sessionInDB.Items.length !== 0){
        throw new Error('The date and time you have entered already exists. Please enter a valid date and time.')
    }
    if(sessionDate < currentDate){
        throw new Error('The date you have entered is in the past. Please enter a valid date.')
    }

    // Check if the time is between 06:00 and 20:00
    const sessionTime = parseInt(time.replace(':', ''), 10)
    if(sessionTime < 600 || sessionTime > 2000){
        throw new Error('The time you have entered is outside of the working hours. Please enter a valid time.')
    }
    const sessionDetails = {
        sessionID: sessionID,
        date: date,
        time: time,
        booked: booked,
        bookedBy: bookedby

    }
    await db.put({
        TableName: 'sessionsDB',
        Item: sessionDetails
    }).promise()

    return sessionDetails
}


exports.handler = middy (async (event) => {
    try{
        const isAdmin = event.admin
        //console.log('isAdmin: ', isAdmin)
        if(isAdmin){
            const body = JSON.parse(event.body)
            const { date, time, booked, bookedBy } = body
            const sessionID = nanoid(8)
            const session = await addSession(date, time, sessionID, booked, bookedBy)
            return sendResponse(200, {success: true, msg: 'Session added', Session: session})

        } else{
            throw new Error('You are not authorized to add sessions.')
        }
    } catch (error){
        return sendError(500, error.message)
    }
})
.use(validateToken)
.use(validateSession)