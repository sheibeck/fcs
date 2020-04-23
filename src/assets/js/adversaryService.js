export default class AdversaryService {
    constructor(dbService){        
        this.dbSvc = dbService;
    }

    async list(searchText, ownerId) {       
        let docClient = this.dbSvc.GetDbClient();

        var params = {
            TableName: fs_adversary.config.adversarytable,
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
  
            params.FilterExpression = '( contains (adversary_name, :an)';
            params.FilterExpression += ' OR contains (adversary_name, :anl)';
            params.FilterExpression += ' OR contains (adversary_name, :anu)';
            params.FilterExpression += ' OR contains (adversary_name, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :an)';
            params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anl)';
            params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anu)';
            params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_aspects.trouble, :an)';
            params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anl)';
            params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anu)';
            params.FilterExpression += ' OR contains (adversary_aspects.trouble, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :an)';
            params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anl)';
            params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anu)';
            params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_system, :an)';
            params.FilterExpression += ' OR contains (adversary_system, :anl)';
            params.FilterExpression += ' OR contains (adversary_system, :anu)';
            params.FilterExpression += ' OR contains (adversary_system, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_type, :an)';
            params.FilterExpression += ' OR contains (adversary_type, :anl)';
            params.FilterExpression += ' OR contains (adversary_type, :anu)';
            params.FilterExpression += ' OR contains (adversary_type, :ant)';
  
            params.FilterExpression += ' OR contains (adversary_genre, :an)';
            params.FilterExpression += ' OR contains (adversary_genre, :anl)';
            params.FilterExpression += ' OR contains (adversary_genre, :anu)';
            params.FilterExpression += ' OR contains (adversary_genre, :ant)';
  
            params.FilterExpression += ' OR adversary_slug = :anl )';
        }
  
        //show only the current users adversaries if the box is checked
        if (ownerId)
        {
            if (!params.FilterExpression)
            {
                params.ExpressionAttributeValues = {':owner_id' : ownerId };
                params.FilterExpression = 'adversary_owner_id = :owner_id';
            }
            else {
                params.ExpressionAttributeValues[':owner_id'] = ownerId;
                params.FilterExpression += ' AND (adversary_owner_id = :owner_id)';
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
            var adversaries = itemsAll.sort(function(a,b) {return (a["adversary_name"] > b["adversary_name"]) ? 1 : ((b["adversary_name"] > a["adversary_name"]) ? -1 : 0);} );
            $.each(adversaries, function(i, v) {
                if (v.adversary_aspects)
                {
                    const orderedAspects = {};
                    if (v.adversary_aspects["high_concept"])
                        orderedAspects["high_concept"] = v.adversary_aspects["high_concept"];
                    if (v.adversary_aspects["trouble"])
                        orderedAspects["trouble"] = v.adversary_aspects["trouble"];
                    if (v.adversary_aspects["other_aspects"])
                        orderedAspects["other_aspects"] = v.adversary_aspects["other_aspects"];

                    v.adversary_aspects = orderedAspects;
                }

                const orderedSkills = {};
                    Object.keys(v.adversary_skills).sort().forEach(function(key) {
                    orderedSkills[key] = v.adversary_skills[key];
                });
                v.adversary_skills = orderedSkills;

                const orderedConsequences = {};
                    Object.keys(v.adversary_consequences).sort().forEach(function(key) {
                    orderedConsequences[key] = v.adversary_consequences[key];
                });
                
                v.adversary_consequences = orderedConsequences;
            });            
            return itemsAll;
        }

        return await scanAll(params);
    }

    async EditAdversary(ownerid, slug) {
        
        // Create DynamoDB document client
        var docClient = this.dbSvc.GetDbClient();
  
        let params = {
            TableName: fs_adversary.config.adversarytable,
            IndexName: "adversary_slug-index",
            KeyConditionExpression: 'adversary_slug = :slug',
            FilterExpression: 'adversary_owner_id = :owner_id',
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