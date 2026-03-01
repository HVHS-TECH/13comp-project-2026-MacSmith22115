// Imports
import Page from './Page.mjs';
import {REFERENCES, FIREBASE_IO_INSTANCE_KEY} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * HomePage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 28/2/26
 * @extends Page
 * Description: 
 *  -> Used to access games, profile details, and more
 ****************************************************************/
export default class HomePage extends Page{
    static #ID = 'home_page'; // Page ID
    #cache = {}; // Cached Data

    /*****************************************************************
    * preDisplay();
    * Description:
    *   -> Runs Code before the page is displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    preDisplay(){
        this.#cache.user = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
    }

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay(){
        document.getElementById('title').innerHTML = `Hello, ${this.#cache.user.name}`
        document.getElementById('user-pfp').src = this.#cache.user.pfp;
    }

    /*****************************************************************
    * getHTML();
    * Description:
    *   -> Returns a string containing HTML tags
    * Params: N/A
    * Returns: String of HTML tags
    * Throws: N/A
    *****************************************************************/
    getHTML(){
        return `
            <div>
                <h1 id='title'></h1>
                <img id='user-pfp'>
            </div>
        `
    }

    /*****************************************************************
    * getId();
    * Description:
    *   -> Returns a string ID of the page
    * Params: N/A
    * Returns: String ID
    * Throws: N/A
    *****************************************************************/
    getId(){
        return HomePage.#ID;
    }
}