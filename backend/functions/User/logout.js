// Work in progress. I might abandon this approach and user local storage instead to clear cookies and destry the token.

// const { middy } = require('@middy/core')
// const httpErrorHandler = require('@middy/http-error-handler').default
// const { createError } = require('http-errors')
// const { validateToken } = require('../../middleware/auth')

// const logout = async (event) => {
//     const token = event.headers.Authorization
//     const user  = await validateToken(token)
//     if (!user) {
//         throw new createError.Unauthorized("Invalid token")
//     }
//     return {
//         statusCode: 200,
//         headers: {
//             'Set-Cookie': 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;', // Clear the cookie
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ message: 'Logged out successfully' })
//     };
// };

// module.exports.handler = middy(logout).use(httpErrorHandler())

