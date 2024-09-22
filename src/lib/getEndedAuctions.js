import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";


export default async function getEndedAuctions() {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    let now = new Date();

    let params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status=:status and endingAt<=:now',
        ExpressionAttributeValues: {
            ':now': now.toISOString(),
            ':status': 'OPEN'
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    const command = new QueryCommand(params);

    const result = await docClient.send(command);

    return result.Items;
}