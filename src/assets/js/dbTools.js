import CommonService from "./commonService";
import DbService from './dbService';

export default class DbTools {
  constructor(fcs){    
    this.fcs = fcs;
    this.commonSvc = new CommonService(fcs);
    this.dbSvc = new DbService(fcs);    
  }

  UpdateItem = async(id, userId) => {    
    let item = await this.dbSvc.GetObject(id, userId);

    for (const [key, value] of Object.entries(item)) {       
      if (typeof(value) == "object" && Object.keys(value).length > 0) {
        let count = 0;
        let array = new Array();
        for (const [childKey, childValue] of Object.entries(value)) {
          count++;
          console.log(`${childKey}: ${childValue}`);
          array.push({id: count, name:childKey, value:childValue});
        } 
        item[key] = [...array];
      }
    }   

    debugger;
        
    //then put the changes
    let params = {
      TableName: this.dbSvc.TableName,
      Item: item
    };           
    
    let docClient = await this.dbSvc.GetDbClient();
    debugger;
    await docClient.put(params, function (err, data) {
      debugger;    
      if (err) {         
          console.error("Unable to updated item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Updated item:", JSON.stringify(data, null, 2));              
      }
    });
  }
 
  UpdateData = async(itemType) => {     
    let records = dbSvc.ListObjects(itemType, null, null);

    records.forEach(async (record) => {                
      //perform data modifications here
      

      //then put the changes
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
}