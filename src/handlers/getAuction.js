import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import commonMiddleware from '../lib/commonMiddleware.js';
import createError from 'http-errors';

export default async function getAuctionById(id) {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    let auction;
    const command = new GetCommand({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
            id
        }
    });

    try {
        let result = await docClient.send(command);
        auction = result.Item;
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if (!auction) {
        throw new createError.NotFound(`Auction with ID "${id}" not found!`);
    }
    return auction;
}

const getAuction = async (event, context) => {

    let { id } = event.pathParameters;

    let auction = await getAuctionById(id);

    const response_success = {
        statusCode: 200,
        body: JSON.stringify(auction)
    }

    return response_success;
}

export const handler = commonMiddleware(getAuction);