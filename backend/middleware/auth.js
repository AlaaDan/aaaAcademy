const jwt = require('jsonwebtoken');

export function createToken (userName, userID, admin){
    const token = jwt.sign({userName, userID, admin}, "1a1b1c", {expiresIn: 1000 })
    return token
};

export const validateToken = {
    before: async (request) => {
        try{
            const token = request.event.headers.authorization.replace('Bearer ', '').trim()
            if (!token) {
                return({error: 'No token provided'})
            } else {
                const decoded =  jwt.verify(token, "1a1b1c")
                request.event.userName = decoded.userName
                request.event.userID = decoded.userID
                request.event.admin = decoded.admin
                return request.response
            }
        } catch (err) {
            request.event.error = {msg: 'You are not loged in or your token has expired. Please log in and try again.'}
            return {error: request.event.error.msg }
        }
    }
}