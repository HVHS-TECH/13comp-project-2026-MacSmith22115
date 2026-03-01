// Imports 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {getDatabase, set, ref, get, off,onValue,update, query,remove, orderByValue} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";


/*****************************************************************
 * FirebaseIO.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 28/2/26
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
     * authViaGoogle();
     * Description:
     *    -> Auths the user via a google account.
     *    -> Returns an object of user data
     * Params: N/A
     * Returns: User's Data
     * Throws: N/A
     * *****************************************************************/
    async authViaGoogle(){
        const PROVIDER = new GoogleAuthProvider();
        PROVIDER.setCustomParameters({prompt: 'select_account'});
        try {
            const AUTH = await signInWithPopup(getAuth(), PROVIDER);
            return this.#buidUserObject(AUTH.user);
        } catch (_error){
            console.error(`Auth Via Google Failed: ${_error}`);
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

    /*****************************************************************
     * #getDatabase();
     * Description:
     *    -> Returns the database reference;
     * Params: N/A
     * Returns: Database Refernce
     * Throws: N/A
     * *****************************************************************/
    authedUser(){
        return this.#buidUserObject(getAuth().currentUser);
    }

    /*****************************************************************
     * #buildUserObject(_user);
     * Description:
     *    -> Returns the d
     * Params:
     *  -> '_user': Full user data captured from 'authViaGoogle()';
     * Returns: Object containing core user info
     * Throws: N/A
     * *****************************************************************/
    #buidUserObject(_user){
        return {
            name: _user.displayName,
            uid: _user.uid,
            pfp: _user.photoURL
        }
    }
}