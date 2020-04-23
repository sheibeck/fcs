export default class DbService {
    constructor(fcs){
        this.fcs = fcs;
    }

    GetDbClient() {        
        // Create DynamoDB document client
        var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        docClient.service.config.credentials = this.fcs.$store.state.credentials;
  
        return docClient;
    }
}