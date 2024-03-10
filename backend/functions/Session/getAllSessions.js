const { db } = require('../../services/db')
const { sendResponse, sendError } = require("../../responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");


export async function getAllSessions(){
    const sessions = await db.scan({
        TableName: 'sessionsDB'
    }).promise()
    return sessions
}


exports.handler = middy (async (event) => {
    try{
        const sessions = await getAllSessions()
        return sendResponse(200, sessions)
    } catch (error) {
        return sendError(500, error)
    }
}).use(validateToken)