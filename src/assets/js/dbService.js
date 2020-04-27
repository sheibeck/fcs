import CommonsService from "./commonService"
import CommonService from "./commonService";

export default class DbService {
    constructor(fcs){        
        this.fcs = fcs;
        this.tablename = `FateCharacterSheet${process.env.NODE_ENV !== "production" ? "_dev" : ""}`;
        this.commonSvc = new CommonService(fcs);
    }

    GetDbClient() {        
        // Create DynamoDB document client
        let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        docClient.service.config.credentials = this.fcs.$store.state.credentials;
  
        return docClient;
    }

    //get a specific object.
    GetObject = async (objectId, ownerId) => {        
        //if we know the ownerId then get the object directly
        if(ownerId) {                           
            var docClient = this.GetDbClient();
            var params = {            
                TableName: this.tablename,
                Key: {
                    'owner_id': ownerId,
                    'id': objectId
                },
            }

            const getItem = async (params) => {
                const data = await docClient.get(params).promise();
                return data.Item;
            };

            return await getItem(params);    
        }    
        else {
            //if we don't know the owner we have to query for one
            let docClient = this.GetDbClient();

            let params = {
                TableName: this.tablename,
                IndexName: "item",
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                ':id': objectId
                }
            }
                
            const queryOne = async (params) => {
                let lastEvaluatedKey = 'dummy'; // string must not be empty
                const itemsAll = [];
                while (lastEvaluatedKey && itemsAll.length === 0) {
                    const data = await docClient.query(params).promise();
                    itemsAll.push(...data.Items);
                    lastEvaluatedKey = data.LastEvaluatedKey;
                    if (lastEvaluatedKey) {
                        params.ExclusiveStartKey = lastEvaluatedKey;
                    }
                }
                if (itemsAll.length > 0)
                    return itemsAll[0];
                else 
                    return null;
            }

            return await queryOne(params);
        }
    }

    SaveObject = async (data) => {            
        //dynamodb won't let us have empty attributes
        this.commonSvc.RemoveEmptyObjects(data);
        
        let docClient = this.GetDbClient();

        // create/update a  character
        // we always use the put operation because the data can change depending on your character sheet
        let params = {
            TableName: this.tablename,
            Item: data
        };

        const putItem = async (params) => {            
            const data = await docClient.put(params).promise();
            return data;
        };

        return await putItem(params);      
    }

    ListItemsByType = async (itemType) => {
        let docClient = this.GetDbClient();

        let params = {
            TableName: this.tablename,
            IndexName: "type",
            KeyConditionExpression: 'object_type = :item_type',
            ExpressionAttributeValues: {
              ':item_type': itemType
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

    ListItemsByOwner = async (itemType, ownerId) => {
        let docClient = this.GetDbClient();        

        let params = {
            TableName: this.tablename,
            KeyConditionExpression: 'owner_id = :owner_id AND begins_with(id, :item_type)',          
            ExpressionAttributeValues: {
            ':owner_id': ownerId,
            ':item_type': itemType
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