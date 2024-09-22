import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export default async function closeAuction(auction) {
    const client = new DynamoDB({});
    const docClient = DynamoDBDocumentClient.from(client);

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status=:status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    const command = new UpdateCommand(params);

    const result = await docClient.send(command);

    return result;
}