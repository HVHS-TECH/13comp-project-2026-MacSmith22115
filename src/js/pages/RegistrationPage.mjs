// Imports
import Page from './Page.mjs';
import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY, 
    FIREBASE_IO_INSTANCE_KEY, 
    HOME_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * RegistrationPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 28/2/26
 * @extends Page
 * Description: 
 *  -> The Registration Page collates information given and creats a user account.
 ****************************************************************/
export default class RegistrationPage extends Page {
    static #ID = 'registration_page'; // Page ID
    static #REGISTER_BUTTON_ID = 'register_button'; // ID of register button

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay(){
        document.getElementById(RegistrationPage.#REGISTER_BUTTON_ID).onclick = async () => {
            const USER = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
            this.writeAccount(USER.uid, USER.name, USER.pfp);
        }
    }

    /*****************************************************************
    * writeAccount(_uid, _name, _pfp)
    * Description:
    *   -> Writes user's details to the database as an account
    * Params: 
    *   -> '_uid': User's UID.
    *   -> '_name': User's Name.
    *   -> '_pfp': String Link to User's Profile Picture.
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async writeAccount(_uid, _name, _pfp){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].update(`users/${_uid}`, {
            name: _name,
            pfp: _pfp
        }, () => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
        })
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
                <h1 id='title'>Register...</h1>
                <button id='${RegistrationPage.#REGISTER_BUTTON_ID}'>Register...</button>
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
        return RegistrationPage.#ID;
    }
}