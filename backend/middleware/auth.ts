import * as jwt from 'jsonwebtoken';

interface Request {
  event: {
    headers: {
      authorization: string;
    };
    userName?: string;
    userID?: string;
    admin?: string;
    error?: {
      msg: string;
    };
  };
  response: any;
}

export function createToken(userName: string, userID: string, admin: string): string {
  const token = jwt.sign({ userName, userID, admin }, "1a1b1c", { expiresIn: 1000 });
  return token;
}

export const validateToken = {
  before: async (request: Request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '').trim();
      if (!token) {
        return { error: 'No token provided' };
      } else {
        const decoded = jwt.verify(token, "1a1b1c") as { userName: string; userID: string; admin: string; };
        request.event.userName = decoded.userName;
        request.event.userID = decoded.userID;
        request.event.admin = decoded.admin;
        return request.response;
      }
    } catch (err) {
      request.event.error = { msg: 'You are not logged in or your token has expired. Please log in and try again.' };
      return { error: request.event.error.msg };
    }
  }
}