const express = require('express')
const fs = require('fs')
const util = require('util')
const logger = require('morgan')
const bodyParser = require('body-parser')
const request = require('request')
const path = require('path');
const app = express()
var cors = require('cors');


var MongoClient = require('mongodb').MongoClient
var dbname = "mydb"
var url = "mongodb://localhost:27017/" + dbname;
var MacquarieApiHandler = require('./macquarie/MacquarieApiHandler_v2.js')
var YodleeApiHandler = require('./macquarie/YodleeApiHandler.js')
var db

/*
 *  Establish connection to mongodb database and create collections (transactions, accounts and balances).
 */

MongoClient.connect(url, function(err, client) {
    if (err) return console.log(err);
    console.log("Database created!");
    
    db = client.db(dbname)
    db.createCollection("transactions", function(err, res) {
        if (err) throw err;
        console.log("Transaction collection created!");
    });
    db.createCollection("accounts", function(err, res) {
        if (err) throw err;
        console.log("Accounts collection created!");
    });
    db.createCollection("balances", function(err, res) {
        if (err) throw err;
        console.log("Balances collection created!");
    }); 
    db.createCollection("yodlee_transactions", function(err, res) {
        if (err) throw err;
        console.log("yodlee_transactions collection created!");
    });
 

    //client.close();
});

/*
 * Start server on port 3000.
 */

app.listen(3001, () => console.log('Server running on port 3000'));

/*
 * Serve static files
 */

app.use(express.static(__dirname));


/*
 * Allow cross origin resource sharing 
 */


app.use(cors())

var corsOptions = {
  origin: 'http://terra.bbqsuitcase.com:3000/tictactoe',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}


/*
 * This route causes a request to go to the Macquarie server to fetch current list of transactions and insert it into the db.
 */

app.get('/', (req, res) => {
    let handler = new MacquarieApiHandler(db);

    handler.getTransactions(req);
    //handler.getAccounts(req)
    //handler.getBalances(req)
    res.send('Transactions inserted into MongoDB')

})

/*
 * /dbTest route responds with a copy of the startup_log
 */

app.get('/dbTest', (req, res) => {
  
    var start = db.collection('startup_log').findOne()
    res.send(start)
})

/*
 * /transactions route responds with array containing all transaction records stored in 'transactions' collection the database
 */

app.get('/transactions', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('transactions').find({}).toArray(cb)
})

/*
 * /accounts route responds with array containing all account information stored in 'accounts' collection in database
 */


app.get('/accounts', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('accounts').find({}).toArray(cb)
})


/*
 * /balances route responds with array containing all balance information stored in 'balances' collection in database
 */

app.get('/balances', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('balances').find({}).toArray(cb)
})

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));


/*
 * /callback route is required by Macquarie api.  After Macquarie Login occurs, the Macquare API sends a request to this route which contains an authentication code.  
 * This code is then used to obtain an access token and/or refresh token.  These tokens are required to make transaction/account/balance api calls.
 */

app.get('/callback', (req, res) => {
  	
    console.log("callback");   
 
    let handler = new MacquarieApiHandler(db);

    handler.getTransactions(req)
    //handler.getAccounts(req)
    //handler.getBalances(req)

	res.send("success") 

})

/*
 * /getToken route
 * 
 */

app.get('/testToken', (req, res) => {
  	
    let handler = new MacquarieApiHandler(db);
    var dummyReq = {};
    dummyReq.query = {};
    dummyReq.query.code = "g8ikHiRad1j6wykGENiINZSvSzBV";
 
    handler.getTransactions(dummyReq)
    //handler.getAccounts(req)
    //handler.getBalances(req)

	res.send("gettingToken") 

})

/*
 * /reset route - drops all collections in mongodb
 * 
 */

app.get('/reset', (req, res) => {
  
    db.collection("transactions").drop();
    db.collection("accounts").drop();
    db.collection("balances").drop();
    db.collection("yodlee_tokens").drop();
    db.collection("yodlee_accounts").drop();
    db.collection("yodlee_transactions").drop();
    res.send("Dropped all transactions, accounts and balances from MongoDb") 

})


app.get('/reset_yodlee_accounts', (req, res) => {
  
    db.collection("yodlee_accounts").drop();
    res.send("Dropped");
})



/*
 * /yodlee_uploadCobToken route - gets cobrand session token from Yodlee
 * 
 */

app.get('/yodlee_uploadCobToken', (req, res) => {
 
    let handler = new YodleeApiHandler(db);

    handler.uploadCobToken(res);

})


/*
 * /yodlee_uploadUserToken route - gets user session token from Yodlee
 * 
 */

app.get('/yodlee_uploadUserToken', (req, res) => {
 
    let handler = new YodleeApiHandler(db);

    //handler.getUserToken(res);
    handler.uploadUserToken(res);

})

/*
 * /gets all tokens stored in yodlee_tokens collection and prints to screen 
 */


app.get('/yodlee_printTokens', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('yodlee_tokens').find({}).toArray(cb)
})



/*
 * /gets all accounts stored in yodlee_accounts collection and prints to screen 
 */


app.get('/yodlee_printAccounts', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('yodlee_accounts').find({}).toArray(cb)
})


/*
 * /yodlee_uploadAccounts route - gets account information from Yodlee and saves to mongo
 * 
 */

app.get('/yodlee_uploadAccounts', (req, res) => {
 
    let handler = new YodleeApiHandler(db);

    handler.doAuth(res, handler.uploadAccounts);

})


/*
 * /yodlee_uploadTransactions route - gets transaction information from Yodlee and saves to mongo
 * 
 */

app.get('/yodlee_uploadTransactions', (req, res) => {
 
    let handler = new YodleeApiHandler(db);

    handler.doAuth(res, handler.uploadTransactions);

})


/*
 * /prints all transactions stored in yodlee_transactions collection and prints to screen 
 */


app.get('/yodlee_printTransactions', (req, res) => {
  
    cb = function(err, data){ 
        if (err){
            console.log(err)
            return res(err);
        } else {
            console.log(data);
            return res.json(data)
        }
    }
    db.collection('yodlee_transactions').find({}).toArray(cb)
})


app.get('/yodlee_sync', (req, res) => {
    
    // Run a transaction sync
    let handler = new YodleeApiHandler(db);
    
    res.write("Rnning Transaction Sync");
    handler.doAuth(res, handler.uploadTransactions);

})








