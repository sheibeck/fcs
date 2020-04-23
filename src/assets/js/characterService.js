export default class CharacterService {
    constructor(dbService){        
        this.dbSvc = dbService;
    }

    async listByOwnerId(ownerId) {
        
        let docClient = this.dbSvc.GetDbClient();
        
        let params = {
            TableName: `fate_character${process.env.NODE_ENV !== "production" ? "_dev" : ""}`,
            KeyConditionExpression: 'character_owner_id = :owner_id',
            ExpressionAttributeValues: {
            ':owner_id': ownerId
            }
        }    
        
        const queryAll = async (params) => {
            let lastEvaluatedKey = 'dummy'; // string must not be empty
            const itemsAll = [];
            while (lastEvaluatedKey) {
                const data = await docClient.query(params).promise();
                itemsAll.push(...data.Items);
                lastEvaluatedKey = data.LastEvaluatedKey;
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }
            }
            return itemsAll;
        }

        return await queryAll(params);
    }
}