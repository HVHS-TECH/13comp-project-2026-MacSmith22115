// Imports 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {getDatabase, set, ref, get, off,onValue,update, query,remove, orderByValue} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";


/*****************************************************************
 * FirebaseIO.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 26/2/26
 * Description: 
 *  -> Provides a Layer of Abstraction for Handeling Database Operations
 *  -> Contains Methods for Reading, Writing & Authenticating via Google
 ****************************************************************/
export default class FirebaseIO { 
    #db; // Database Reference

    /*****************************************************************
    * @param {Object} _config - Firebase Config Object
    *****************************************************************/
    constructor(_config){
        this.#db = getDatabase(initializeApp(_config));
    }


    /*****************************************************************
    * update(_path, _data, _callback);
    * Description:
    *   -> Updates existing data in the database
    *   -> If data at the path was not existent, it is written
    *   -> calls the optional callback if sucessful
    * Params: 
    *   -> '_path': Path to write data to
    *   -> '_data': Data to write
    *   -> '_callback': Optional Callback Function
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async update(_path, _data, _callback = null){
        try {
            const REF = ref(this.#getDatabase(), _path);
            await update(REF, _data);
            if (_callback) _callback();
        } catch (_error) {
            console.error(`Error Updating ${_data} @ ${_path}: ${_error}`)
        }
    }

    /*****************************************************************
    * read(_path);
    * Description:
    *   -> Reads and returns data at specified Path
    * Params: 
    *   -> '_path': Path to read.
    * Returns: Data, or Null.
    * Throws: N/A
    *****************************************************************/
    async read(_path){
        try {
            const REF = ref(this.#getDatabase(), _path);
            const SNAPSHOT = await get(REF);
            return SNAPSHOT.exists() ? SNAPSHOT.val() : null;
        } catch (_error){
            console.error(`Error Reading Data @ ${_path}: ${_error}`);
        }
    }

    /*****************************************************************
     * #getDatabase();
     * Description:
     *    -> Returns the database reference;
     * Params: N/A
     * Returns: Database Refernce
     * Throws: N/A
     * *****************************************************************/
    #getDatabase(){
        return this.#db;
    }
}