import { db } from '../../services/db'
import { sendResponse, sendError } from "../../responses";
import middy from "@middy/core";
import { validateToken } from "../../middleware/auth";


export async function getAllSessions(){
    const sessions = await db.scan({
        TableName: 'sessionsDB'
    }).promise()
    return sessions
}


exports.handler = middy (async (event: any) => {
    try{
        const sessions = await getAllSessions()
        return sendResponse(200, sessions)
    } catch (error) {
        return sendError(500, error)
    }
}).use(validateToken)