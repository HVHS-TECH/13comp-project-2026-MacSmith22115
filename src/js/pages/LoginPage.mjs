// Imports
import Page from './Page.mjs';

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

    getHTML(){
        return `
            <div>
                <h1 id='title'>This Is The Login Page!</h1>
            </div>
        `;
    }

    getId(){
        return LoginPage.#ID;
    }
    
}