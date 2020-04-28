


export default class DbTools {
  constructor(fcs){    
    this.fcs = fcs;
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

  MigrateData = async () => {    
    // Create DynamoDB document client
    let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    docClient.service.config.credentials = this.fcs.$store.state.credentials;
    
    let tables = ["fate_campaign_dev"];
        
    debugger;

    tables.forEach(async (tablename) => {
      let records = await this.GetData(tablename);
      records.forEach(record => {
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

            record.system = record.charactersheetsystem.replace(/-/gi, " ").toTitleCase();          
            delete record.charactersheetsystem;

            delete record.charactersheetid;

            break;


          case "fate_character":
          case "fate_character_dev":      

            recordType = "CHARACTER";
            record.object_type = recordType;

            record.owner_id = record.character_owner_id;
            delete record.character_owner_id;

            record.id = `${recordType}|${record.character_id}`;
            delete record.character_id;

            record.related_id = `CHARACTERSHEET|${record.sheetname}`;
            delete record.sheetname;
            record.system = record.system.replace(/-/gi, " ").toTitleCase();

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

            record.id = `${recordType}|${record.adversary_id}`;
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
          TableName: "FateCharacterSheet_dev",
          Item: record
        };                  
        
        docClient.put(params, function (err, data) {          
          if (err) {         
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Migrated item:", JSON.stringify(data, null, 2));              
          }
        });
      })
    })    

  }
  
}