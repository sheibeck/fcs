import CommonService from "./commonService";

export default class DbTools {
  constructor(fcs){    
    this.fcs = fcs;
    this.commonSvc = new CommonService(fcs);
    this.tablename = "";
  }

  RemoveEmptyObjects = (obj) => {
    $.each(obj, (key, value) => {
        if (key === "")
        {
          delete obj[""];
        }
        else {
          if (value === "" || value === null || value === undefined || value === {}){
              delete obj[key];
          } else if (Object.prototype.toString.call(value) === '[object Object]') {
              this.RemoveEmptyObjects(value);
          } else if ($.isArray(value)) {
              $.each(value, function (k,v) {
                if (v === "") {
                  value.splice(k);
                }
              });
          }
        }
      });
  };

  GetData = async (tablename) => {   
    // Create DynamoDB document client
    let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    docClient.service.config.credentials = this.fcs.$store.state.credentials;
    
    let params = {
      TableName: tablename,      
      Select: 'ALL_ATTRIBUTES'
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
        return itemsAll;
    }

    return scanAll(params);
  }

  DeleteData = async() => {
    let tablename = this.tablename;
  
    debugger;
    let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    docClient.service.config.credentials = this.fcs.$store.state.credentials;
    let records = await this.GetData(tablename);

    records.forEach(async (record) => {

      // create/update a  character
      // we always use the put operation because the data can change depending on your character sheet
      let params = {
        TableName: tablename,
        Key: {
          'owner_id': record.owner_id,
          'id': record.id
         }
      };

      await docClient.delete(params, function (err, data) {          
        if (err) {         
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted item:", JSON.stringify(data, null, 2));              
        }
      });
    });

    this.commonSvc.Notify("Delete Complete.");   
  }

  UpdateData = async() => {
     // Create DynamoDB document client
     let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
     docClient.service.config.credentials = this.fcs.$store.state.credentials;
     
     let params = {
          TableName: this.tablename,
          IndexName: "relations",
          KeyConditionExpression: 'related_id = :id',
          ExpressionAttributeValues: {
            ':id': "CHARACTERSHEET|fate-core"
          }        
      }

      const queryAll = async (params) => {
          let lastEvaluatedKey = 'dummy'; // string must not be empty
          const itemsAll = [];
                    
          while (lastEvaluatedKey) {
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
        
          return itemsAll;
      }

      let records = await queryAll(params);
debugger;
      records.forEach(async (record) => {        
        record.system = "Fate Core";
        // create/update a  character
        // we always use the put operation because the data can change depending on your character sheet
        let params = {
          TableName: this.tablename,
          Item: record
        };                  
        
        await docClient.put(params, function (err, data) {          
          if (err) {         
              console.error("Unable to updated item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Updated item:", JSON.stringify(data, null, 2));              
          }
        });
      });
  }

  MigrateData = async () => {    
    // Create DynamoDB document client
    let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    docClient.service.config.credentials = this.fcs.$store.state.credentials;
    
    let tables = ["fate_character", "fate_adversary", "fate_campaign"];
    //let tables = ["fate_charactersheet"];

    debugger;

    tables.forEach(async (tablename) => {
      let records = await this.GetData(tablename);
      if (tablename.indexOf("campaign") > -1) {
        //process all the parents first
        records.sort((a, b) => (a.parent_id > b.parent_id) ? 1 : (a.parent_id === b.parent_id) ? ((a.parent_id > b.parent_id) ? 1 : -1) : -1 )
      }
      
      records.forEach(async (record) => {
        let recordType = "";

        //setup new pk schema
        switch(tablename) {
          case "fate_charactersheet":
          case "fate_charactersheet_dev":
              
            record.owner_id = "JARVIS";
            recordType = "CHARACTERSHEET";

            record.object_type = recordType;

            record.id = `${recordType}|${record.charactersheetname}`;
            record.slug = record.charactersheetname;
            delete record.charactersheetname;
            
            record.description = record.charactersheetdescription;
            delete record.charactersheetdescription;

            //fix content for pluralization
            let content = record.charactersheetcontent;
            content = content.replace(/aspect\[/gi, "aspects[");
            content = content.replace(/skill\[/gi, "skills[");
            content = content.replace(/consequence\[/gi, "consequences[");
            content = content.replace(/condition\[/gi, "conditions[");
            content = content.replace(/approach\[/gi, "approaches[");
            content = content.replace(/character_image_url/gi, "image_url");
            

            record.content = content;

            delete record.charactersheetcontent;
            
            record.name = record.charactersheetdisplayname;
            delete record.charactersheetdisplayname;                  

            if (record.charactersheetsystem)
            {
            record.system = record.charactersheetsystem.replace(/-/gi, " ").toTitleCase();
            delete record.charactersheetsystem;
            }            

            delete record.charactersheetid;

            break;


          case "fate_character":
          case "fate_character_dev":      

            recordType = "CHARACTER";            
            record.object_type = recordType;

            record.owner_id = record.character_owner_id;
            delete record.character_owner_id;
            
            record.id = `${recordType}|${this.commonSvc.GenerateUUID()}`;
            delete record.character_id;

            if (!record.name)
            {
              record.name = "Un-named";
            }

            record.related_id = `CHARACTERSHEET|${record.sheetname}`;            

            delete record.sheetname;
            if (record.system) {
              record.system = record.system.replace(/-/gi, " ").toTitleCase();
              switch(record.system) {
                case "Core":
                  record.system = "Fate Core";
                case "Accelerated":
                case "Default":
                case "Freeport":
                  record.system = "Fate Accelerated";
              }
            }

            record.aspects = record.aspect;
            delete record.aspect;
            record.consequences = record.consequence;
            delete record.consequence;
            record.approaches = record.approach;
            delete record.approach;
            record.conditions = record.condition;
            delete record.condition;
            record.skills = record.skill;
            delete record.skill;

            record.image_url = record.character_image_url;
            delete record.character_image_url;                   

          break;

          case "fate_adversary":
          case "fate_adversary_dev":      

            recordType = "ADVERSARY";
            record.object_type = recordType;

            record.owner_id = record.adversary_owner_id;
            delete record.adversary_owner_id;

            record.id = `${recordType}|${this.commonSvc.GenerateUUID()}`;
            delete record.adversary_id;

            record.name = record.adversary_name;
            delete record.adversary_name;
            
            record.aspects = record.adversary_aspects;
            delete record.adversary_aspects;
            record.consequences = record.adversary_consequences;
            delete record.adversary_consequences;
            record.approaches = record.adversary_approaches;
            delete record.adversary_approaches;            
            record.skills = record.adversary_skills;
            delete record.adversary_skills;

            record.genre = record.adversary_genre;
            delete record.adversary_genre;

            record.stress = record.adversary_stress;
            delete record.adversary_stress;

            record.stunts = record.adversary_stunts;
            delete record.adversary_stunts;

            record.image_url = record.adversary_image;
            delete record.adversary_image;

            record.system = record.adversary_system;
            delete record.adversary_system;    
            
            record.type = record.adversary_type;
            delete record.adversary_type;
            
            record.slug = record.adversary_slug;
            delete record.adversary_slug;
          break;

          case "fate_campaign":
          case "fate_campaign_dev":

            record.owner_id = record.owner_id;

            //use new shortId
            let newId = this.commonSvc.GenerateUUID();
            this.updateChildrenId(records, record.id, newId);           
            record.id = newId;

            if (record.parent_id == "00000000-0000-0000-0000-000000000000") {
              recordType = "CAMPAIGN";                           
            }
            else {
              recordType = "LOG";
              record.related_id = `CAMPAIGN|${record.parent_id}`;
            }
            delete record.parent_id;
            

            record.object_type = recordType;
            record.id = `${recordType}|${record.id}`;

            record.name = record.title;
            delete record.title;

            record.public = record.ispublic;
            delete record.ispublic;
        }
         
        this.RemoveEmptyObjects(record);

        // create/update a  character
        // we always use the put operation because the data can change depending on your character sheet
        let params = {
          TableName: this.tablename,
          Item: record
        };                  
        
        await docClient.put(params, function (err, data) {          
          if (err) {         
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Migrated item:", JSON.stringify(data, null, 2));              
          }
        });       
      })

      
    })    

    this.commonSvc.Notify("Migration Complete.");    
  }

  updateChildrenId = function(obj, oldId, newId) {
    for (var i in obj) {
      if (obj[i].parent_id == oldId) {
        obj[i].parent_id = newId;
      }
    }
  }
}