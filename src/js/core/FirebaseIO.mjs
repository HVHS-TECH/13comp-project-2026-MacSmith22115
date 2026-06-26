import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, set, ref, get, off, onValue, update, query, remove, orderByValue, onDisconnect } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
    PAGE_MANAGER_INSTANCE_KEY,
    REFERENCES,
    USER_IS_ADMIN_KEY
} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * FirebaseIO.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Description: 
 *  -> Provides a Layer of Abstraction for Handeling Database Operations
 *  -> Contains Methods for Reading, Writing & Authenticating via Google
 ****************************************************************/
export default class FirebaseIO {
    #db; // Database Reference

    /*****************************************************************
    * @param {Object} _config - Firebase Config Object
    *****************************************************************/
    constructor(_config) {
        this.#db = getDatabase(initializeApp(_config));
    }


    /*****************************************************************
    * Description:
    *   -> Updates existing data in the database
    *   -> If data at the path was not existent, it is written
    *   -> calls the optional callback if sucessful, or if error
    * Params: 
    *   -> '_path': Path to write data to
    *   -> '_data': Data to write
    *   -> '_pass': Optional Callback Function called on a sucessful update
    *   -> '_fail': Optional Callback function called on a error
    *****************************************************************/
    async update(
        _path,
        _data,
        _pass = null,
        _fail = async (_error) => alert(`[FirebaseIO.mjs] Error: Check Console For Details`)
    ) {
        try {
            const REF = ref(this.#getDatabase(), _path);
            await update(REF, _data);
            if (_pass) await _pass();
        } catch (_error) {
            console.error(`Error Updating ${_data} @ ${_path}: ${_error}`);
            await _fail(_error);
        }
    }

    /*****************************************************************
    * Description:
    *   -> Reads and returns data at specified Path
    * Params: 
    *   -> '_path': Path to read.
    * Returns: Data, or Null.
    *****************************************************************/
    async read(_path) {
        try {
            const REF = ref(this.#getDatabase(), _path);
            const SNAPSHOT = await get(REF);
            return SNAPSHOT.exists() ? SNAPSHOT.val() : null;
        } catch (_error) {
            console.error(`Error Reading Data @ ${_path}: ${_error}`);
        }
    }

    
    /*****************************************************************
    * Description:
    *   -> Attempts to delete data from _path in Firebase
    * Params: 
    *   -> '_path': Path to remove.
    *   -> '_callback': Function to call once completion
    *****************************************************************/
    async remove(_path, _callback = null) {
        try {
            const REF = ref(this.#getDatabase(), _path);
            await remove(REF, _path);
            if (_callback) await _callback();
        } catch (_error) {
            console.error(`Error Removing Data @ ${_path}: ${_error}`);
        }
    }

    
    /*****************************************************************
    * Description:
    *   -> Logs the user out, de-authing them
    * Params: 
    *   -> '_callback': Function to call if logout was sucessful
    *   -> '_fallback': Function to call if logout failed
    *****************************************************************/
    async logout(_callback = () => {}, _fallback = () => {}) {
        try {
            await signOut(getAuth());
            _callback();
        } catch (_err) {
            console.error(`Error Signing User Out: ${_err}`);
            _fallback();
            alert(`Firebase Error: See Console`);
        }
    }

    /*****************************************************************
     * Description:
     *    -> Auths the user via a google account.
     *    -> Returns an object of user data
     * Returns: User's Data
     * *****************************************************************/
    async authViaGoogle() {
        const PROVIDER = new GoogleAuthProvider();
        PROVIDER.setCustomParameters({ prompt: 'select_account' });
        try {
            const AUTH = (await signInWithPopup(getAuth(), PROVIDER));
            return this.#buildUserObject(AUTH.user, true);
        } catch (_error) {
            console.error(`Auth Via Google Failed: ${_error}`);
        }
    }

    /*****************************************************************
     * registerListeners(_listeners);
     * Description:
     *    -> Registers listeners on to the database
     *    -> Listeners are called when data at their path is changed
     * Params: '_listeners': Object containing paths (field), mapped to a listener callback (value);
     * Returns: Array of registered Listeners, used to unregister listeners later.
     * Throws: N/A
     * *****************************************************************/
    registerListeners(_listeners) {
        const REGISTERED_LISTENERS = [];
        for (const [_path, _listener] of Object.entries(_listeners)) {
            const REF = ref(this.#getDatabase(), _path);
            try {
                const WRAPPER = (_data) => _listener(_data.exists() ? _data.val() : null);
                onValue(REF, WRAPPER);
                REGISTERED_LISTENERS.push({
                    ref: REF,
                    listener: WRAPPER,
                    type: 'value',
                    path: _path,
                    initialized: false
                })
            } catch (_error) {
                console.error(`Error Registering Firebase Listner @ ${_path}: ${_error}`);
            }
        };
        return REGISTERED_LISTENERS;
    }

    /*****************************************************************
     * unregisterListeners(_listeners);
     * Description:
     *    -> Recursivly unregisters database listeners.
     * Params: '_listeners': Array containing listeners as objects
     * Returns: N/A
     * Throws: N/A
     * *****************************************************************/
    unregisterListeners(_listeners) {
        _listeners.forEach(_wrapper => {
            try {
                if (_wrapper.ref && _wrapper.listener && _wrapper.type) {
                    off(_wrapper.ref, _wrapper.type, _wrapper.listener)
                }
            } catch (_error) {
                console.error(`Error Unregistering Firebase Listener @ ${_wrapper.path}: ${_error}`);
            }
        })
    }

    /*****************************************************************
     * onClientDisconnect(_path);
     * Description:
     *    -> Registers the path in the firebase to be removed if the user disconnects
     * Params: '_path': Path to remove
     * Returns: N/A
     * Throws: N/A
     * *****************************************************************/
    async onClientDisconnect(_path) {
        const DB = this.#getDatabase();
        const REF = ref(DB, _path)
        const DISCONNECT = onDisconnect(REF);
        await DISCONNECT.remove();
    }

    /*****************************************************************
     * #getDatabase();
     * Description:
     *    -> Returns the database reference;
     * Params: N/A
     * Returns: Database Refernce
     * Throws: N/A
     * *****************************************************************/
    #getDatabase() {
        return this.#db;
    }

    /*****************************************************************
     * authedUser();
     * Description:
     *    -> Gets the currently authed user;
     * Params: N/A
     * Returns: User's details, or Null
     * Throws: N/A
     * *****************************************************************/
    authedUser(_extras = false) {
        const USER = getAuth().currentUser;
        return USER != null ? this.#buildUserObject(USER, _extras) : null;
    }

    /*****************************************************************
     * #isAuthedAdmin();
     * Description:
     *    -> Checks if the cauthed user is an admin;
     * Params: N/A
     * Returns: True if they are an admin, false if they are not logged in or are not admin
     * Throws: N/A
     * *****************************************************************/
    async isAuthedAdmin() {
        const AUTHED_USER = this.authedUser();
        if (AUTHED_USER == null) return false;
        let isAdmin = REFERENCES[USER_IS_ADMIN_KEY];
        if (isAdmin == null) {
            isAdmin = await this.read(`admins/${AUTHED_USER.uid}`) != null;
            REFERENCES[USER_IS_ADMIN_KEY] = isAdmin;
        }
        return isAdmin;
    }

    /*****************************************************************
     * #buildUserObject(_user);
     * Description:
     *    -> Returns the d
     * Params:
     *  -> '_user': Full user data captured from 'authViaGoogle()';
     *  -> '_extra': Wether extra details should be included
     * Returns: Object containing core user info
     * Throws: N/A
     * *****************************************************************/
    #buildUserObject(_user, _extra = false) {
        return _extra ? {
            email: {
                val: _user.email,
                private: true
            },
            name: {
                val: _user.displayName.replace(/\s/g, ""),
                private: false
            },
            uid: {
                val: _user.uid,
                private: false,
            },
            pfp: {
                val: _user.photoURL,
                private: false
            }
        } : {
            email: _user.email,
            name: _user.displayName.replace(/\s/g, ""),
            uid: _user.uid,
            pfp: _user.photoURL
        }
    }
}
