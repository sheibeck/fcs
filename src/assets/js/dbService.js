import AWS from 'aws-sdk';
import CommonService from "./commonService";
import UserService from "./userService";
import { getPaginatedResult, decodeCursor } from 'dynamodb-paginator';

export default class DbService {
    TableName = `FateCharacterSheet${process.env.NODE_ENV !== "production" ? "_dev" : ""}`;
   
    constructor(fcs){
        this.fcs = fcs;
        this.commonSvc = new CommonService(fcs);
    }

    async GetDbClient() {        
        // if the user session has expired, refresh it so we don't get DB errors
        await this.RefreshUserSession();

        // Create DynamoDB document client
        let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        docClient.service.config.credentials = this.fcs.$store.state.credentials;
  
        return docClient;
    }

    RefreshUserSession = async() => {
        if (this.fcs.$store.state.credentials && this.fcs.$store.state.credentials.needsRefresh()) {
            let userSvc = new UserService(this.fcs);
            await userSvc.RefreshSession();
        }
    }

    //get a specific object.
    GetObject = async (objectId, ownerId) => {  
        var docClient = await this.GetDbClient();
              
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
                    this.commonSvc.Notify(err.code, 'error');
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
                },
                Limit: 1,
            }
                
            const queryOne = async (params) => {
                let lastEvaluatedKey = 'dummy'; // string must not be empty
                const itemsAll = [];
                while (lastEvaluatedKey && itemsAll.length === 0) {
                    try {
                     await docClient.query(params).promise()
                        .then((data) => {
                            itemsAll.push(...data.Items);
                            lastEvaluatedKey = data.LastEvaluatedKey;
                            if (lastEvaluatedKey) {
                                params.ExclusiveStartKey = lastEvaluatedKey;
                            }
                        }).catch((err) => {
                            this.commonSvc.Notify(err.code, 'error');
                            lastEvaluatedKey = null;
                        });
                    }
                    catch(ex) {
                        this.commonSvc.Notify(ex, 'error');
                        break;                        
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
        
        let docClient = await this.GetDbClient();

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
                this.commonSvc.Notify(err.code, 'error');
            });
    }

    ListObjects = async (itemType, ownerId, filter, page) => {        
        let params = {
            TableName: this.TableName,
            IndexName: "type",
            KeyConditionExpression: 'object_type = :item_type',
            ExpressionAttributeValues: {
              ':item_type': itemType,
              ':one': "1"
            },            
            FilterExpression: ":one = :one"
        }
       
        //if we know the owner then use the sort key, too
        if (ownerId) {
            params.KeyConditionExpression += ' AND owner_id = :owner_id';
            params.ExpressionAttributeValues[':owner_id'] = ownerId;
        } else {
            //if the user isn't looking at their own stuff, then they are looking at the
            //public list. don't show private_only items in the public list
            params.FilterExpression += ' AND is_private <> :is_private';
            params.ExpressionAttributeValues[':is_private'] = true;
        }

        //add some search parameters
        if (filter) {
            this.GetSearchFilters(filter, params);
        }
        
        if (!page) {
            return await this.QueryAll(params);
        } else {
            return await this.PagedResults(params, page);
        }
    }

    ListRelatedObjects = async (relatedTo, publicOnly) => {
        let docClient = await this.GetDbClient();

        let params = {
            TableName: this.TableName,
            IndexName: "relations",
            KeyConditionExpression: 'related_id = :id',
            ExpressionAttributeValues: {
              ':id': relatedTo
            }
        }

        if (publicOnly) {            
            params.FilterExpression = '#ispublic = :ispublic';
            params.ExpressionAttributeValues[':ispublic'] = true;
            params.ExpressionAttributeNames = {
                "#ispublic": "public",
            }
        }

        return await this.QueryAll(params);
    }
    
    QueryAll = async (params) => {   
        let docClient = await this.GetDbClient();
        let result, accumulated = [];
                    
        do {
            try {
                result = await docClient.query(params).promise();
                params.ExclusiveStartKey = result.LastEvaluatedKey;                
                accumulated = [...accumulated, ...result.Items];
            }
            catch(ex) {
                this.commonSvc.Notify(ex, 'error');
                break;
            }
        } while (!result.Items.length || result.LastEvaluatedKey);
       
        return accumulated;
    }

    
    PageList = [];
    CurrentPage = 1;

    PagedResults = async (params, page) => {   
        let docClient = await this.GetDbClient();
        const limit = 25;        
        params.Limit = limit;
        let pageData = null;

        switch(page) {
            case 'first':
                this.CurrentPage = 1;
                if (this.PageList.length > 0) return this.PageList[0];                
                break;
            case 'prev':
                //really the CURRENT page is the last page in the array. So, we go back 2 pages to get the true prev
                if (this.CurrentPage - 1 >= 1) {
                    this.CurrentPage = this.CurrentPage-1;
                    return this.PageList[this.CurrentPage-1];                    
                }
                else {
                    return;
                }
                break;                
            default:                
                let pageLen = this.PageList.length;
                if (this.CurrentPage + 1 <= pageLen) {
                    this.CurrentPage++;
                    return this.PageList[this.CurrentPage-1]
                }
                else {                   
                    if (!this.PageList[pageLen-1].meta.hasMoreData) {
                        return;
                    }
                    else {
                        //if we have this page in our tracked items then fetch the data with this tracked info                        
                        pageData = this.PageList[pageLen-1];
                        this.CurrentPage++;
                    }
                }
                break;
        }
        
        let cursor = pageData ? pageData.meta.cursor : null;
        const _params =
            decodeCursor(cursor)
            || params;
    
        const result = await docClient.query(_params).promise();        
        let paginatedResult = getPaginatedResult(_params, limit, result);

        //track this page if it's not already been viewed
        var pageTracked = this.PageList.findIndex(p => {
            return paginatedResult.meta.cursor === p.meta.cursor;
        });

        if (pageTracked === -1) {
            this.PageList.push(paginatedResult);
        }
       
        return paginatedResult;
    }

    DeleteObject = async (ownerId, id) => {
        let docClient = await this.GetDbClient();        

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
                this.commonSvc.Notify(err.code, 'error');
            });
    }
    
    GetSearchFilters(searchText, params) {
        let FilterExpression = ' AND ( contains (#object_name, :an)';

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

        FilterExpression += ' OR contains (playerList, :playerId)';        

        FilterExpression += ' OR slug = :anl )';

        
        let filterParms = {
            ExpressionAttributeValues: {
                ':an': searchText,
                ':anl': searchText.toLowerCase(),
                ':anu': searchText.toUpperCase(),
                ':ant': searchText.toTitleCase(),
                ':playerId': searchText,
            },
            ExpressionAttributeNames: {
                "#object_name": "name",
                "#object_game_type": "type",
                "#object_game_system": "system"
            },
            FilterExpression: FilterExpression,
        }

        Object.keys(filterParms.ExpressionAttributeValues).forEach(function (item) {
            if (!params.ExpressionAttributeValues) params.ExpressionAttributeValues = {};
            params.ExpressionAttributeValues[item] = filterParms.ExpressionAttributeValues[item];
        });
        
        Object.keys(filterParms.ExpressionAttributeNames).forEach(function (item) {
            if (!params.ExpressionAttributeNames) params.ExpressionAttributeNames = {};
            params.ExpressionAttributeNames[item] = filterParms.ExpressionAttributeNames[item];
        });
                
        params.FilterExpression += filterParms.FilterExpression;   
        
        return params;
    }
}