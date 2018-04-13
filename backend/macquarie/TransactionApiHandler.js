"use strict";

/**
 * This class contains all methods required to communicate with Open APIs
 * As it is an abstract class, it will need to be implemented for each specific vendors API
 */
export class TransactionApiHandler {
	constructor() {
        if (new.target === TransactionApiHandler) {
            throw new TypeError("Cannot construct TransactionApiHandler instances directly");
        }
    }

    doAuth(){
        if (new.target === TransactionApiHandler) {
            throw new TypeError("doAuth() method must be implemented in concrete class");
        } 
    }
    
    getTransactions(){
        if (new.target === TransactionApiHandler) {
            throw new TypeError("getTransaction() method must be implemented in concrete class");
        } 
    }

    getAccounts(){
        if (new.target === TransactionApiHandler) {
            throw new TypeError("getAccounts() method must be implemented in concrete class");
        } 
    }
    
    getBalance(){
        if (new.target === TransactionApiHandler) {
            throw new TypeError("DoAuth() method must be implemented in concrete class");
        } 
 
    }

}
