import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import commonMiddleware from '../lib/commonMiddleware.js';
import createError from 'http-errors';
import getAuctionById from './getAuction.js';

const placeBid = async (event, context) => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const { id } = event.pathParameters;

    const auction = await getAuctionById(id);

    if (auction.status !== 'OPEN') {
        throw new createError.Forbidden(`You cannot bid on closed auctions!`);
    }

    const { amount } = JSON.parse(event.body);

    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Bid amount must be higher than ${auction.highestBid.amount}!`);
    }

    let updatedAuction;

    const command = new UpdateCommand({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW'
    })

    try {
        const result = await docClient.send(command);
        updatedAuction = result.Attributes;
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    const response_success = {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }

    return response_success;
}

export const handler = commonMiddleware(placeBid);