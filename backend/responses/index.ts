interface Response {
  statusCode: number;
  headers: {
    "Content-Type": string;
  };
  body: string;
}

function sendResponse(code: number, response: any): Response {
  return {
    statusCode: code,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  };
}

function sendError(statusCode: number, message: string): Response {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message)
  };
}

export { sendResponse, sendError }