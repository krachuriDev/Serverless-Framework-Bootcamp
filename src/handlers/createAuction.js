import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import commonMiddleware from '../lib/commonMiddleware.js';
import createError from 'http-errors';

const createAuction = async (event, context) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const { title } = JSON.parse(event.body);
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    }
  }

  const command = new PutCommand({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction
  });

  try {
    await docClient.send(command);
  }
  catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  const response_success = {
    statusCode: 201,
    body: JSON.stringify(auction)
  }

  return response_success;
}

export const handler = commonMiddleware(createAuction);