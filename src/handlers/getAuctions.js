import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import commonMiddleware from '../lib/commonMiddleware.js';
import createError from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import getAuctionsSchema from '../lib/getAuctionsSchema.js';

const getAuctions = async (event, context) => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const { status } = event.queryStringParameters;

    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status=:status',
        ExpressionAttributeValues: {
            ':status': status
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    const command = new QueryCommand(params);

    try {
        let data = await docClient.send(command);
        auctions = data.Items;
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    const response_success = {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }

    return response_success;
}

export const handler = commonMiddleware(getAuctions)
    .use(validator({
        eventSchema: transpileSchema(getAuctionsSchema), useDefaults: true
    }));