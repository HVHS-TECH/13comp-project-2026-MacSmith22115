// Imports
import Page from './Page.mjs';
import {REFERENCES, PAGE_MANAGER_INSTANCE_KEY, FIREBASE_IO_INSTANCE_KEY, HOME_PAGE_CLASS_KEY, AUTHED_USER_KEY} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * LoginPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 26/2/26
 * @extends Page
 * Description: 
 *  -> The login page, used to auth with google
 ****************************************************************/
export default class LoginPage extends Page {
    static #ID = 'login_page'; // Page ID
    static #LOGIN_BUTTON_ID = 'login_button';

    onDisplay(){
        document.getElementById(LoginPage.#LOGIN_BUTTON_ID).onclick = this.attemptLogin.bind(this);
    }

    async attemptLogin(){
        REFERENCES[AUTHED_USER_KEY] = await REFERENCES[FIREBASE_IO_INSTANCE_KEY].authViaGoogle();
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
    }

    getHTML(){
        return `
            <div>
                <h1 id='title'>This Is The Login Page!</h1>
                <button id='${LoginPage.#LOGIN_BUTTON_ID}'>Login...</button>
            </div>
        `;
    }

    getId(){
        return LoginPage.#ID;
    }
    
}