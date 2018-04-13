"use strict"
const express = require('express')
const fs = require('fs')
const util = require('util')
const logger = require('morgan')
const bodyParser = require('body-parser')
const request = require('request')
const axios = require('axios')


/*YodleeTransactionHandler extends TransactionApiHandler
 * This class contains all methods requires to communicate with the Yodlee Open Banking Api (see documentation at
 * https://developer.yodlee.com/API_Resources/Yodlee_Sample_App_Getting_Started_Guide)
 */

class YodleeApiHandler{

    constructor(db) {
        this.db = db

        //Configuration information for Yodlee API calls. 
        this.base_url = "https://developer.api.yodlee.com/ysl/"
        this.login = "sbCobd282174b90963b29a8e8abe6a71d705eea"
        this.password = "8a852c48-1ab6-45ac-a28f-7bf545b1c553"
        this.testUser1_name = "sbMemd282174b90963b29a8e8abe6a71d705eea1"
        this.testUser1_pwd = "sbMemd282174b90963b29a8e8abe6a71d705eea1#123"
        this.cobsession = null;
        this.cobSessionToken = '08062013_0:cef9ae910f27c3daad6b4e62ea83eaf7db832ecc7693b6b4d65f0e4' + 
                    'cbdbdd24f1f133e8c2ae1cb16b061c3f400c26d33eb193e28b21f08608c4913bc9d155ece'; // TEMP -this will be loaded from db
        this.userSessionToken = '08062013_0:366aeada427404941abca1d987889c392a12a4bf236992161cab8256d9ef4daed1' + 
                    'b8e9119267b247c05e552adce0639f01e90ededb1883f8881d38cc205ad37e'; // TEMP -this will be loaded from db
        this.appResponse

        //Default options to post https requests
        this.defaultOptions = {
                url: this.base_url, 
                method: 'POST',
                headers: {  
                    'Cache-Control': 'no-cache',
                    'Cobrand-Name': 'restserver',
                    'Api-Version': '1.1',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Authorization': '',
                    Referer: 'https://developer.yodlee.com/apidocs/index.php',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3)'
                        + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                    Origin: 'https://developer.yodlee.com',
                    Accept: 'application/json',
                    Connection: 'keep-alive',
                    Host: 'developer.api.yodlee.com' },
                body: {}, 
                json: true
        };

        //Binding 'this' to functions.  These functions are used in callbacks.  Binding allows 'this' to be used in callback.


        this.uploadUserToken = this.uploadUserToken.bind(this);
        //this.getUserToken = this.getUserToken.bind(this);
        //this.saveUserTokenToMongo = this.saveUserTokenToMongo.bind(this);
        //this.saveSessionTokenToMongo = this.saveSessionTokenToMongo.bind(this);
        this.saveToMongo = this.saveToMongo.bind(this);
        this.saveAccountsToMongo = this.saveAccountsToMongo.bind(this);
        this.doAuth = this.doAuth.bind(this);
   
     }//END CONSTRUCTOR   

 /* 
 * Authentication Process
 *
 * Yodlee API authentication requires two steps: cobrand authentication and user/consumer authentication. The former authenticates the Yodlee customer whereas 
 * the latter authenticates the user in the customer?s API environment and sets the context of the financial data that is returned; the API returns data for the 
 * accounts associated with the user that have been authenticated.
 *
 * Cobrand authentication (with cobrand credentials) must occur first, and returns a cobrand session token. User authentication requires the cobrand session token 
 * and user credentials, and returns the user session token. The remaining data retrieval API calls require both the cobrand and user session tokens to 
 * ensure authorization and set the context of the user for whom the data is being returned.

    /**
     * This function gets the Cobrand (ie our) Session authentication token and saves it to Mongo
     *
     */
    uploadCobToken(appResponse){

        var coBrandOptions = Object.assign(this.defaultOptions); //clone default options (do not want to change original default options object)
        coBrandOptions.url = this.base_url + 'cobrand/login';
        coBrandOptions.data =  { cobrand: {
                                    cobrandLogin: this.login,
                                    cobrandPassword: this.password } };
        
        //Make api call to yodlee using coBrandOptions
        axios(coBrandOptions)
            .then((response) => {
                console.log(response.data); 
                let tokenData = { 
                    'bank_name': 'yodlee', 
                    'cobSession': response.data.session.cobSession, 
                    'token_type': 'cobSession', 
                    'expires': this.now() + 100*60 //time in seconds (cobsession token expires after 100 minutes)
                }
                return tokenData
            })
            .then((tokenData) => {
                this.saveToMongo(tokenData, "yodlee_tokens");
                appResponse.send("Saving to cobrand session token to Mongo:<br><br>" + JSON.stringify(tokenData, null, 2));
                return tokenData;
            })
           .catch((error) => {
                console.log("Error: " + error)
            })

    }


    /**
     * This function gets the user authentication token from Yodlee and saves it to Mongo
     *
     */
    uploadUserToken(appResponse){

        var userOptions = Object.assign(this.defaultOptions); //clone options (do not want to change original default options object)
        userOptions.url = this.base_url + 'user/login';
        userOptions.data = { user: { 
                                loginName: this.testUser1_name,
                                password: this.testUser1_pwd } };
 
        // Yodlee requires cobToken to get userToken - so retreieve from db
        let fetchCobToken = new Promise((resolve, reject) => {
                    resolve(this.db.collection("yodlee_tokens")
                                    .find({'token_type': 'cobSession'})
                                    .sort({"expires": -1})
                                    .limit(1)
                                    .next());
                    reject("error");
                    }
                );


      fetchCobToken
            .then((response, reject) => {
//                console.log(response);
                userOptions.headers.Authorization = '{cobSession=' + response.cobSession + '}';
//                console.log(userOptions);
                return userOptions;
            })
            .then((userOptions) => {
                return axios(userOptions)
            })
            .then((response) => {
                console.log(response.data); 
                let tokenData = { 
                    'bank_name': 'yodlee', 
                    'userSession': response.data.user.session.userSession, 
                    'token_type': 'userSession', 
                    'expires': this.now() + 30*60 //time in seconds (cobsession token expires after 100 minutes)
                }
                return tokenData
            })
           .then((tokenData) => {
                this.saveToMongo(tokenData, "yodlee_tokens");
                appResponse.send("Saving to user session token to Mongo:<br><br>" + JSON.stringify(tokenData, null, 2));
                return tokenData;
            })
           .catch((error) => {
                console.log("Error: " + error)
            })
    }

    /**
    * This function retrieves the authentication tokens from db and then calls the callback provided by the user.  Callback must take auth object as 
    * argument which has properties cobToken & userToken.
    */
 
    doAuth(res, callback){

        this.appResponse = res

        let p1 = new Promise((resolve, reject) =>{
                    resolve(this.db.collection("yodlee_tokens")
                                    .find({'token_type': 'cobSession'})
                                    .sort({"expires": -1})
                                    .limit(1)
                                    .next());
                    reject("error");
                    }
                );

        let p2 = new Promise((resolve, reject) =>{
                    resolve(this.db.collection("yodlee_tokens")
                                    .find({'token_type': 'userSession'})
                                    .sort({"expires": - 1})
                                    .limit(1)
                                    .next());
                    reject("error");
                    }
                );
        
        // Wait until we have both tokens, then proceed with callback that takes the token values as args.    
        Promise.all([p1, p2])
            .then(function(arr){return {"cobSession": arr[0]['cobSession'], "userSession": arr[1]['userSession']}})
            .then(callback.bind(this));
    }


    /**
    * This function retrieves all banks accounts from yodlee
    * Input: auth object which has properties cobSession and userSession 
    */
 
    uploadAccounts(auth){
       
        var accountOptions = Object.assign(this.defaultOptions); //clone options (do not want to change original default options object)
        accountOptions.method = 'GET';
        accountOptions.url = this.base_url + 'accounts';
        accountOptions.headers.Authorization = '{cobSession=' + auth.cobSession + ', userSession=' + auth.userSession + '}';

        console.log(accountOptions);

        axios(accountOptions)
            .then((response) => {
                let accountData = { 
                    'bank_name': 'yodlee', 
                    'data': response.data, 
                    'download_date': this.now
                }
                return accountData
            })
            .then((accountData) => {
                this.appResponse.send("Saving accounts to Mongo:<br><br>" + JSON.stringify(accountData, null, 2));
                this.saveToMongo(accountData, "yodlee_accounts");
                return accountData;
            })
            .catch((error) => {
                console.log("Error: " + error)
            })


   }




    /**
    * This function retrieves all banks accounts from yodlee
    * Input: auth object which has properties cobSession and userSession 
    */
 
    getAccounts(auth){
       
        var accountOptions = Object.assign(this.defaultOptions); //clone options (do not want to change original default options object)
        accountOptions.method = 'GET';
        accountOptions.url = this.base_url + 'accounts';
        accountOptions.headers.Authorization = '{cobSession=' + auth.cobSession + ', userSession=' + auth.userSession + '}';
        request(accountOptions, this.saveAccountsToMongo);

   }

    /**
    * This function saves account information to Mongo
    */

    saveAccountsToMongo(error, response){
         if (error){
            console.log("error: " + typeof(error))
            console.log(error)
        }
        else{
            console.log("body: " + JSON.stringify(response.body)) 
            let now = this.now() 

            let accountData = { 
                'bank_name': 'yodlee', 
                'data': response['body'], 
                'download_date': now
            }

            this.appResponse.send("Saving accounts to Mongo:<br><br>" + JSON.stringify(accountData, null, 2));
            this.saveToMongo(accountData, "yodlee_accounts");
       }
    }



    /**
    * This function retrieves all transactions from yodlee 
    * Input: auth object which has properties cobSession and userSession 
    */

    uploadTransactions(auth){


        var appResponse = this.appResponse;
        
        var transactionOptions = Object.assign(this.defaultOptions); //clone options (do not want to change original default options object)
        transactionOptions.method = 'GET';
        transactionOptions.url = this.base_url + 'transactions?fromDate=2011-06-01&toDate=2017-06-01&&&&&&&';
        transactionOptions.headers.Authorization = '{cobSession=' + auth.cobSession + ', userSession=' + auth.userSession + '}';
        transactionOptions.headers.accountId = '11497000'; 
        transactionOptions.headers.fromDate = '2011-06-01'; 
        transactionOptions.headers.fromDate = '2018-03-01'; 
       
        // request(transactionOptions, this.saveTransactionsToMongo);

        axios(transactionOptions)
            .then((response) => {
                let now = this.now() 
                let transactionData = { 
                    'bank_name': 'yodlee', 
                    'data': response.data.transaction, 
                    'download_date': now
                }
                return transactionData
            })
            .then((transactionData) => {
                this.saveToMongo(transactionData, "yodlee_transactions");
                this.appResponse.send("Saving transactions to Mongo:<br><br>" + JSON.stringify(transactionData, null, 2));
                return transactionData;
            })
            .catch((error) => {
                console.log("Error: " + error)
            })
    }

    /**
    * This function saves data to Mongo
    */

    saveToMongo(data, collectionName){
        this.db.collection(collectionName).insert(data, function(err, res) {
            if (err){
                console.log(err);
            }
            console.log("inserted data into " + collectionName);
            });
    }
   

    /**
     * This function returns the current seconds since epoch, which is what we will be working with most
     */
 
    now(){
        return Math.round((new Date()).getTime() / 1000)
    }




}
module.exports = YodleeApiHandler;
