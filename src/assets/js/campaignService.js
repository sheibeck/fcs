import CommonService from "./commonService";

export default class CampaignService {
    constructor(dbService) {
        this.dbSvc = dbService;
        this.commonSvc = new CommonService();
    }
   
    async GetCampaignByIndex(id) {       
        // Create DynamoDB document client
        let docClient = this.dbSvc.GetDbClient();

        let params = {
            TableName: fs_camp.config.campaigntable,
            IndexName: "campaign_id-index",
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {            
                ':id': id,
            },         
        }

        const get = async (params) => {
            let lastEvaluatedKey = 'dummy'; // string must not be empty
            const itemsAll = [];
            while (lastEvaluatedKey && itemsAll.length == 0) {
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

        return await get(params);       
    }

    async ListCampaignsByOwnerId(ownerId) {
        
        //reference this component so we can get/set data      
      let campaignList = [];

      // Create DynamoDB document client
      var docClient = this.dbSvc.GetDbClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          KeyConditionExpression: 'owner_id = :owner_id',
          FilterExpression: 'parent_id = :parent_id',
          ExpressionAttributeValues: {
            ':owner_id': ownerId,
            ':parent_id': this.commonSvc.EmptyGuid()
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

    async ListLogsForCampaign(ownerId, id, showPublicOnly) {    
      let sessionList = [];

      // Create DynamoDB document client
      let docClient = this.dbSvc.GetDbClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          ExpressionAttributeValues: {
            ':owner_id': ownerId,
            ':parent_id': id,
          },
          KeyConditionExpression: 'owner_id = :owner_id',
          FilterExpression: 'parent_id = :parent_id',
      }

      if (showPublicOnly) {           
        params.FilterExpression = '(parent_id = :parent_id) AND (ispublic = :is_public)';
        params.ExpressionAttributeValues = {
            ':owner_id': ownerId,
            ':parent_id': id,
            ':is_public': true,
        };       
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