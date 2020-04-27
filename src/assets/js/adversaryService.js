export default class AdversaryService {
    constructor(dbService){        
        this.dbSvc = dbService;
    }

    async list(searchText, ownerId) {       
        let docClient = this.dbSvc.GetDbClient();

        var params = {
            TableName: this.dbSvc.TableName,
            Select: 'ALL_ATTRIBUTES'
        }
        
        //search
        if (searchText && searchText.length > 0) {
            params.ExpressionAttributeValues= {
              ':an': searchText,
              ':anl': searchText.toLowerCase(),
              ':anu': searchText.toUpperCase(),
              ':ant': searchText.toTitleCase(),
            };
  
            params.FilterExpression = '( contains (name, :an)';
            params.FilterExpression += ' OR contains (name, :anl)';
            params.FilterExpression += ' OR contains (name, :anu)';
            params.FilterExpression += ' OR contains (name, :ant)';
  
            params.FilterExpression += ' OR contains (aspects.high_concept, :an)';
            params.FilterExpression += ' OR contains (aspects.high_concept, :anl)';
            params.FilterExpression += ' OR contains (aspects.high_concept, :anu)';
            params.FilterExpression += ' OR contains (aspects.high_concept, :ant)';
  
            params.FilterExpression += ' OR contains (aspects.trouble, :an)';
            params.FilterExpression += ' OR contains (aspects.trouble, :anl)';
            params.FilterExpression += ' OR contains (aspects.trouble, :anu)';
            params.FilterExpression += ' OR contains (aspects.trouble, :ant)';
  
            params.FilterExpression += ' OR contains (aspects.other_aspects, :an)';
            params.FilterExpression += ' OR contains (aspects.other_aspects, :anl)';
            params.FilterExpression += ' OR contains (aspects.other_aspects, :anu)';
            params.FilterExpression += ' OR contains (aspects.other_aspects, :ant)';
  
            params.FilterExpression += ' OR contains (system, :an)';
            params.FilterExpression += ' OR contains (system, :anl)';
            params.FilterExpression += ' OR contains (system, :anu)';
            params.FilterExpression += ' OR contains (system, :ant)';
  
            params.FilterExpression += ' OR contains (type, :an)';
            params.FilterExpression += ' OR contains (type, :anl)';
            params.FilterExpression += ' OR contains (type, :anu)';
            params.FilterExpression += ' OR contains (type, :ant)';
  
            params.FilterExpression += ' OR contains (genre, :an)';
            params.FilterExpression += ' OR contains (genre, :anl)';
            params.FilterExpression += ' OR contains (genre, :anu)';
            params.FilterExpression += ' OR contains (genre, :ant)';
  
            params.FilterExpression += ' OR slug = :anl )';
        }
  
        //show only the current users adversaries if the box is checked
        if (ownerId)
        {
            if (!params.FilterExpression)
            {
                params.ExpressionAttributeValues = {':owner_id' : ownerId };
                params.FilterExpression = 'owner_id = :owner_id';
            }
            else {
                params.ExpressionAttributeValues[':owner_id'] = ownerId;
                params.FilterExpression += ' AND (owner_id = :owner_id)';
            }
        }
        
        const scanAll = async (params) => {
            let lastEvaluatedKey = 'dummy'; // string must not be empty
            const itemsAll = [];
            while (lastEvaluatedKey) {
                const data = await docClient.scan(params).promise();
                itemsAll.push(...data.Items);
                lastEvaluatedKey = data.LastEvaluatedKey;
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }
            }

            //dynamodb doesn't order items, it's a NODB. WE'll manually tweak a few
            // things to try and make them consistent
            var adversaries = itemsAll.sort(function(a,b) {return (a["name"] > b["name"]) ? 1 : ((b["name"] > a["name"]) ? -1 : 0);} );
            $.each(adversaries, function(i, v) {
                if (v.aspects)
                {
                    const orderedAspects = {};
                    if (v.aspects["high_concept"])
                        orderedAspects["high_concept"] = v.aspects["high_concept"];
                    if (v.aspects["trouble"])
                        orderedAspects["trouble"] = v.aspects["trouble"];
                    if (v.aspects["other_aspects"])
                        orderedAspects["other_aspects"] = v.aspects["other_aspects"];

                    v.aspects = orderedAspects;
                }

                const orderedSkills = {};
                    Object.keys(v.skills).sort().forEach(function(key) {
                    orderedSkills[key] = v.skills[key];
                });
                v.skills = orderedSkills;

                const orderedConsequences = {};
                    Object.keys(v.consequences).sort().forEach(function(key) {
                    orderedConsequences[key] = v.consequences[key];
                });
                
                v.consequences = orderedConsequences;
            });            
            return itemsAll;
        }

        return await scanAll(params);
    }

    async EditAdversary(ownerid, id) {       
        // Create DynamoDB document client
        var docClient = this.dbSvc.GetDbClient();
  
        let params = {
            TableName: fs_adversary.config.adversarytable,
            IndexName: "slug-index",
            KeyConditionExpression: 'slug = :slug',
            FilterExpression: 'owner_id = :owner_id',
            ExpressionAttributeValues: {
              ':slug': slug,
              ':owner_id': ownerid
            }
        }
  
        const queryAll = async (params) => {
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

        return await queryAll(params);
       
    }
}