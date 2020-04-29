import CommonsService from "./commonService"
import CommonService from "./commonService";

export default class DbService {
    TableName = `FateCharacterSheet${process.env.NODE_ENV !== "production" ? "_dev" : ""}`;

    constructor(fcs){        
        this.fcs = fcs;        
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
        var docClient = this.GetDbClient();
              
        //if we know the ownerId then get the object directly
        if(ownerId) {                           
            
            var params = {            
                TableName: this.TableName,
                Key: {
                    'owner_id': ownerId,
                    'id': objectId
                },
            }

            //return await getItem(params);    
            return await docClient.get(params).promise()
                .then((data) => {
                    return data.Item;
                }).catch(function(err) {
                    this.commonSvc.Notify(err.code, 'error', 2000);
                });
        }    
        else {
            //if we don't know the owner we have to query for one
            let params = {
                TableName: this.TableName,
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
                    await docClient.query(params).promise()
                        .then((data) => {
                            itemsAll.push(...data.Items);
                            lastEvaluatedKey = data.LastEvaluatedKey;
                            if (lastEvaluatedKey) {
                                params.ExclusiveStartKey = lastEvaluatedKey;
                            }
                        }).catch((err) => {
                            this.commonSvc.Notify(err.code, 'error', 2000);
                        });
                   
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
            TableName: this.TableName,
            Item: data
        };
             
        //return await getItem(params);    
        return await docClient.put(params).promise()
            .then((data) => {
                return data;
            }).catch((err) => {
                this.commonSvc.Notify(err.code, 'error', 2000);
            });
    }

    ListObjects = async (itemType, ownerId, filter) => {
        let docClient = this.GetDbClient();

        let params = {
            TableName: this.TableName,
            IndexName: "type",
            KeyConditionExpression: 'object_type = :item_type',
            ExpressionAttributeValues: {
              ':item_type': itemType
            }
        }

        //if we know the owner then use the sort key, too
        if (ownerId) {
            params.KeyConditionExpression += ' AND owner_id = :owner_id';
            params.ExpressionAttributeValues[':owner_id'] = ownerId;
        }

        //add some search parameters
        if (filter) {
            this.GetSearchFilters(filter, params);
        }
             
        const queryAll = async (params) => {
            let lastEvaluatedKey = 'dummy'; // string must not be empty
            const itemsAll = [];
            while (lastEvaluatedKey) {
                await docClient.query(params).promise()
                    .then((data) => {
                        itemsAll.push(...data.Items);
                        lastEvaluatedKey = data.LastEvaluatedKey;
                        if (lastEvaluatedKey) {
                            params.ExclusiveStartKey = lastEvaluatedKey;
                        }
                    }).catch((err) => {
                        this.commonSvc.Notify(err.code, 'error', 2000);
                    });
                
            }            
            return itemsAll;
        }

        return await queryAll(params);
    }

    ListRelatedObjects = async (relatedTo) => {
        let docClient = this.GetDbClient();

        let params = {
            TableName: this.TableName,
            IndexName: "relations",
            KeyConditionExpression: 'related_id = :id',
            ExpressionAttributeValues: {
              ':id': relatedTo
            }
        }
   
        const queryAll = async (params) => {
            let lastEvaluatedKey = 'dummy'; // string must not be empty
            const itemsAll = [];
            while (lastEvaluatedKey) {
                await docClient.query(params).promise()
                    .then((data) => {
                        itemsAll.push(...data.Items);
                        lastEvaluatedKey = data.LastEvaluatedKey;
                        if (lastEvaluatedKey) {
                            params.ExclusiveStartKey = lastEvaluatedKey;
                        }
                    }).catch((err) => {
                        this.commonSvc.Notify(err.code, 'error', 2000);
                    });              
            }
            return itemsAll;
        }

        return await queryAll(params);
    }
    
    DeleteObject = async (ownerId, id) => {
        let docClient = this.GetDbClient();        

        var params = {
            TableName: this.TableName,
            Key: {
             'owner_id': ownerId,
             'id': id
            }
        };
        
         //return await getItem(params);    
         return await docClient.delete(params).promise()
            .then((data) => {
                return data;
            }).catch((err) => {
                this.commonSvc.Notify(err.code, 'error', 2000);
            });
    }
    
    GetSearchFilters(searchText, params) {
        let FilterExpression = '( contains (#object_name, :an)';

        FilterExpression += ' OR contains (#object_name, :anl)';
        FilterExpression += ' OR contains (#object_name, :anu)';
        FilterExpression += ' OR contains (#object_name, :ant)';

        FilterExpression += ' OR contains (aspects.high_concept, :an)';
        FilterExpression += ' OR contains (aspects.high_concept, :anl)';
        FilterExpression += ' OR contains (aspects.high_concept, :anu)';
        FilterExpression += ' OR contains (aspects.high_concept, :ant)';

        FilterExpression += ' OR contains (aspects.highconcept, :an)';
        FilterExpression += ' OR contains (aspects.highconcept, :anl)';
        FilterExpression += ' OR contains (aspects.highconcept, :anu)';
        FilterExpression += ' OR contains (aspects.highconcept, :ant)';

        FilterExpression += ' OR contains (aspects.trouble, :an)';
        FilterExpression += ' OR contains (aspects.trouble, :anl)';
        FilterExpression += ' OR contains (aspects.trouble, :anu)';
        FilterExpression += ' OR contains (aspects.trouble, :ant)';

        FilterExpression += ' OR contains (aspects.other_aspects, :an)';
        FilterExpression += ' OR contains (aspects.other_aspects, :anl)';
        FilterExpression += ' OR contains (aspects.other_aspects, :anu)';
        FilterExpression += ' OR contains (aspects.other_aspects, :ant)';

        FilterExpression += ' OR contains (#object_game_system, :an)';
        FilterExpression += ' OR contains (#object_game_system, :anl)';
        FilterExpression += ' OR contains (#object_game_system, :anu)';
        FilterExpression += ' OR contains (#object_game_system, :ant)';

        FilterExpression += ' OR contains (#object_game_type, :an)';
        FilterExpression += ' OR contains (#object_game_type, :anl)';
        FilterExpression += ' OR contains (#object_game_type, :anu)';
        FilterExpression += ' OR contains (#object_game_type, :ant)';

        FilterExpression += ' OR contains (genre, :an)';
        FilterExpression += ' OR contains (genre, :anl)';
        FilterExpression += ' OR contains (genre, :anu)';
        FilterExpression += ' OR contains (genre, :ant)';

        FilterExpression += ' OR contains (related_id, :an)';
        FilterExpression += ' OR contains (related_id, :anl)';
        FilterExpression += ' OR contains (related_id, :anu)';
        FilterExpression += ' OR contains (related_id, :ant)';

        FilterExpression += ' OR slug = :anl )';

        
        let filterParms = {
            ExpressionAttributeValues: {
                ':an': searchText,
                ':anl': searchText.toLowerCase(),
                ':anu': searchText.toUpperCase(),
                ':ant': searchText.toTitleCase(),
            },
            ExpressionAttributeNames: {
                "#object_name": "name",
                "#object_game_type": "type",
                "#object_game_system": "system"
            },
            FilterExpression: FilterExpression,
        }

        Object.keys(filterParms.ExpressionAttributeValues).forEach(function (item) {
            params.ExpressionAttributeValues[item] = filterParms.ExpressionAttributeValues[item];
        });
        
        params.ExpressionAttributeNames = filterParms.ExpressionAttributeNames;
        params.FilterExpression = filterParms.FilterExpression;   
        
        return params;
    }
}