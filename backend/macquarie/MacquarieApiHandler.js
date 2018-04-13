"use strict"
const express = require('express')
const fs = require('fs')
const util = require('util')
const logger = require('morgan')
const bodyParser = require('body-parser')
const request = require('request')
//import TransactionApiHandler from './TransactionApiHandler.js'


/*MacquarieApiHandler extends TransactionApiHandler
 * This class contains all methods requires to communicate with the Macquarie Open Banking Api (see documentation at
 * https://developer.macquariebank.io/devportal/v1/)
 */

class MacquarieApiHandler{

    constructor() {
        this.base_url = "https://sandbox.api.macquariebank.io/connect/v1"
        this.oauth_uri = this.base_url + '/oauth2/token' 
        this.mac_client_id = "61sdGiAuzyFb3rmyMoNF7swey7XXOmcu"
        this.mac_client_secret = "9HauKBRTOD3O2rZj"
        this.mac_content_type = "application/x_www_form_urlencoded" 
        this.mac_transaction_uri = this.base_url + '/accounts/' + this.mac_client_id
	this.waiting = false
	this.access_token = null
    }   

    accessTokenHandler(error,response){
  
	console.log("CALLED CALLBACK")
	console.log(response.body)
         jsonResponse = JSON.parse(response.body)
         this.access_token = jsonResponse.access_token
    }

    doAuth(req){

        //app.use(cookieParser());
        //app.use(express.static(path.join(__dirname, 'public')));

            //Step 1: get Access code from Macquarie
            console.log(req.query.code)
            //fs.writeFileSync('./data.json', util.inspect(req.body), 'utf_8')

            //Step 2: get access token from Macquarie

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
        
		//var self = this

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
            request(clientServerOptions, this.accessTokenHandler.bind(this))
	
    }

   
    getTransactions(req){

	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}
	this.doAuth(req)
	while (this.access_token == null)
	{
		sleep(1000)
		// do nothing
		console.log("WAITING FOR DOAUTH")
		console.log(this.access_token)
	}

        let clientServerOptions = {
            uri: this.mac_transaction_uri, 
            method: 'GET',
            headers: {
                "user-agent":"",
                "authorization": "Bearer " + this.accessToken,
                "client_id": this.mac_client_id
                }
        }

        request(clientServerOptions, function(error, response){
            if (error){
                console.log("error: " + typeof(error))
            }
            else{
                console.log("response: " + response.body)
            }
        })
	return true
    }   

    getAccounts(){
    }   
    
    getBalance(){
 
    }  

 

}
module.exports = MacquarieApiHandler;
