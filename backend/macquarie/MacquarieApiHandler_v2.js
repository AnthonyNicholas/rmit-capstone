"use strict"
const express = require('express')
const fs = require('fs')
const util = require('util')
const logger = require('morgan')
const bodyParser = require('body-parser')
const request = require('request')
const axios = require('axios');
//import TransactionApiHandler from './TransactionApiHandler.js'

/*MacquarieApiHandler extends TransactionApiHandler
 * This class contains all methods requires to communicate with the Macquarie Open Banking Api (see documentation at
 * https://developer.macquariebank.io/devportal/v1/)
 */
 
class MacquarieApiHandler{

    constructor(db) {
        this.db = db
        this.base_url = "https://sandbox.api.macquariebank.io/connect/v1"
        this.oauth_uri = this.base_url + '/oauth2/token' 
        this.mac_client_id = "jnmGHTIozAcaSwCJx2ImVqKQk1fun9HE"
        this.mac_client_secret = "ABoD6PubD0k21AbX"
        this.mac_content_type = "application/x-www-form-urlencoded" 
        this.mac_transaction_uri = this.base_url + '/accounts/084c4df6-a805-42d6-939e-2db7c3d50ded/transactions'
		this.transaction_route = '/accounts/084c4df6-a805-42d6-939e-2db7c3d50ded/transactions'
        this.balance_route = '/accounts/084c4df6-a805-42d6-939e-2db7c3d50ded/balances'
		this.access_token = null
    }   

    // Returns the current seconds since epoch, which is what we will be working with most
    now(){
        return Math.round((new Date()).getTime() / 1000)
    }


    /**
     * This function saves a clients token to the mongodb database for later reuse
     */
    saveToken(token_req){

        let now = this.now()

        let tokenData = {
            'bank_name': 'macquarie',
            'client_id': this.mac_client_id,
            'token_type': token_req.token_type,
            'access_token': token_req.access_token,
            'expires': now + token_req.expires_in,
            'scope': token_req.scope,
            'refresh_token': token_req.refresh_token,
            'refresh_token_expires': now + token_req.refresh_token_expires_in
        }

        this.db.collection("tokens").insert(tokenData, function(err, res) {
            if (err) throw err;
                console.log("token inserted");
            });

    }
 
    /**
     * This function is currently the entry point to Macquarie API handler.
     *
     * We must first determine the access rights of our app.
     * If we have a token - is it still valid?
     */
    getTransactions(req){

        console.log("req.query.code = " + req.query.code);
        // If do auth says no, then we must redirect to macquarie
		return this.doAuth(req, this.saveTransactions)

	}

	saveTransactions(error, response){
        
		console.log("saving transactions")
        let jsonResponse = JSON.parse(response.body)
       	let access_token = jsonResponse.access_token

        // now that we hace an access token, we should save it for later use
        this.saveToken(jsonResponse)

        let callback = this.saveToMongo("transactions") 
        let options = this.getDefaultClientServerOptions(this.transaction_route, access_token)

        request(options, callback)

		return true
    }   

    isAccessTokenValid(){
            let token = this.db.collection('tokens')
                .find( { client_id: this.mac_client_id} )
                .sort({expires:-1})
                .limit(1);

            console.log(token.toArray())
                
            if (token.expires < this.now() )
                return true
            return false
    }

    isRefreshTokenValid(){
            let token = this.db.collection('tokens')
                .find( { client_id: this.mac_client_id} )
                .sort({refresh_token_expires:-1})
                .limit(1);
                
            if (token.refresh_token_expires < this.now() )
                return true
            return false
                /*
                .next(function(err, doc) {
                    assert.equal(err, null)
                    console.log("Found refresh token")
                    console.log(doc)
                    // epoch time, larger is later
                    if ( doc.refresh_token_expires < this.now() )
                        return true
                    return false
        }
        return new Promise(callback)
       });

       */
    }

   /**
    * This function obtains access code and passes to callBackFunc
    * Params: Request (containing query code) and a callbackFunction
    * Returns: Executes a request which will provide a access_token to provided callback function
    */

    doAuth(req, callbackFunc){

      if ( req.query.code == undefined ) {
        // First check our database - do we have a valid access token for this user?
        if (this.isAccessTokenValid())
            console.log("We should simply request API with our valid token.")
        else if (this.isRefreshTokenValid())
            console.log("Token Expired. We will need to make a request using our valid refresh token")
        else
            console.log("You have no tokens for this account")

        return false // no actions have been defined yet
      }

      // in the event we are reacting to a callback, follow through in order to register a token

            callbackFunc = callbackFunc.bind(this); // Need to bind 'this' to callback function in order to access class variables
          
            //Step 1: get Access code from Macquarie

            let clientServerOptions = {
                uri: this.oauth_uri, 
                method: 'POST',
                headers: {
                    "user-agent":"",
                    "client_id": this.mac_client_id,
                    "client_secret": this.mac_client_secret,
                    "content-type": this.mac_content_type
                    },
                body: "grant_type=authorization_code&code=" + req.query.code
            }

            request(clientServerOptions, callbackFunc)
  
     }

    /**
    * This function retrieves all banks accounts and inserts (via callback) to Mongo accounts collection
    */
 
    
    getAccounts(req){
		return this.doAuth(req, this.saveAccounts)
    }  

   	saveAccounts(error, response){
        
        let jsonResponse = JSON.parse(response.body)
       	let access_token = jsonResponse.access_token

        // now that we hace an access token, we should save it for later use
        this.saveToken(jsonResponse)
        
        let options = this.getDefaultClientServerOptions("/accounts", access_token)
        let callback = this.saveToMongo("accounts")

        request(options, callback)

		return true
    }   

    /**
    * This function retrieves account balance for single account and inserts (via callback) to Mongo balances collection.  
    * Want to do this using promises - ie using axios rather than request.
    */
     
    getBalances(req){

        //req.query.code is the code issued by Macquarie

        console.log("getting balances")
        console.log("code: " + req.query.code);

        //Headers etc for authentication api call

/*
curl --request POST \
  --user-agent ""
  --url https://sandbox.api.macquariebank.io/connect/v1/oauth2/token \
  --header "client_id: {client_id}" \
  --header "client_secret: {client_secret}" \
  --header "content-type: application/x-www-form-urlencoded" \
  --data "grant_type=authorization_code" \
  --data "code={code}"
*/

        let clientServerOptions = {
                 }
       
        let requestParams = {
            method: 'post',
            url: this.oauth_uri,
            data: {
                grant_type: "authorization_code",
                code: req.query.code
            },
            headers: {
                "user-agent":"",
                "client_id": this.mac_client_id,
                "client_secret": this.mac_client_secret,
                "content-type": this.mac_content_type
            }
        }
        console.log(requestParams)

        //make doAuth request to get access_token

        axios(requestParams)
        .then(response => {      
            console.log("stage 2"); 
            //console.log("test - getting access_token")
            let jsonResponse = JSON.parse(response.body)
       	    this.access_token = jsonResponse.access_token
            console.log("get balance doAuth made successfully. Token is :" + this.access_token)
           
            /*
            let options = this.getDefaultClientServerOptions(this.balance_route, this.access_token)
            */
        })
        .catch(error => {
            //console.log(error);
            console.log(requestParams.method);
            console.log(requestParams.url)
            console.log(requestParams.data)
            console.log(requestParams.headers)
            console.log(error.response.data);
            console.log(error.response.status);
//            console.log(error.response);
        });
           
        
        /*
        axios(options)
            .then(response => {
            console.log("axios request made successfully")
            var myobj = JSON.parse(response.body)
            this.db.collection(collectionName).insert(myobj, function(err, res) {
                    console.log("inserted into " + collectionName);
                })
        })
        .catch(error => {
            console.log(error);
        });
        */
		return true

    }  


    /**
    * This function returns a callback function which will save a response into a given MongoDb table
    */

    saveToMongo(collectionName){
     
        let callback = function(error, response){
        
            if (error){
                console.log("error: " + typeof(error))
		        console.log(error)
            }
            else{
                var myobj = JSON.parse(response.body)
                //console.log("response: " + myobj.transactions[0])
                this.db.collection(collectionName).insert(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("inserted into " + collectionName);
                });

            }
        
        }
        callback = callback.bind(this)
        return callback
    }

    /** 
    * This function returns the client server options needed for the get accounts, balances and transactions api calls
    */
    
    getDefaultClientServerOptions(route, access_token){
        let clientServerOptions = {
            uri: this.base_url + route, 
            method: 'GET',
            headers: {
                "user-agent":"",
                "authorization": "Bearer " + access_token,
                "client_id": this.mac_client_id
                }
        }
        return clientServerOptions	 
    }




 

}
module.exports = MacquarieApiHandler;
