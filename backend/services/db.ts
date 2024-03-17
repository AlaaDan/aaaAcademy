import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const db: DocumentClient = new DocumentClient({
  region: process.env.AWS_REGION,
});

export { db };