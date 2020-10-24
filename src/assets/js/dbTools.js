import CommonService from "./commonService";
import DbService from '../dbService';

export default class DbTools {
  constructor(fcs){    
    this.fcs = fcs;
    this.commonSvc = new CommonService(fcs);
    this.dbSvc = new DbService(fcs);
    this.tablename = "";
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