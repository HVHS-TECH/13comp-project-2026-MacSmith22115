// Imports
import Page from './Page.mjs';
import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY, 
    FIREBASE_IO_INSTANCE_KEY, 
    HOME_PAGE_CLASS_KEY,
    REGISTRATION_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE
} from '../core/ReferenceStorage.mjs';
import Terminal from '../core/Terminal.mjs';

/*****************************************************************
 * LoginPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 28/2/26
 * @extends Page
 * Description: 
 *  -> The login page, used to auth with google
 ****************************************************************/
export default class LoginPage extends Page {      
    static #ID = 'login_page'; // Page ID
    static #TERMINAL_INPUT_ID = 'terminal_input';
    static #TERMINAL_OUTPUT_ID = 'terminal_output';

    static #keydownListener = (_event) => {
        if (_event.key !== 'Enter') return;
        const ELEMENT = document.getElementById(LoginPage.#TERMINAL_INPUT_ID)
        if (ELEMENT.value == '') return;
        console.log('passed');
        REFERENCES[TERMINAL_INSTANCE].readInput();
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
        const INPUT = document.getElementById(LoginPage.#TERMINAL_INPUT_ID);
        const OUTPUT = document.getElementById(LoginPage.#TERMINAL_OUTPUT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        document.addEventListener('keydown', LoginPage.#keydownListener);
    }

    onRemove(){
        document.removeEventListener('keydown', LoginPage.#keydownListener);
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    /*****************************************************************
    * attemptLogin();
    * Description:
    *   -> Authenticats your google account, and collects user data.
    *   -> Reads database for the user's record
    *   -> Displays Homepage, or Registrations Page, depending if record was found
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async attemptLogin(){
        const FIREBASE_IO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const USER = await FIREBASE_IO.authViaGoogle();
        const USER_RECORD = await FIREBASE_IO.read(`users/${USER.uid}`);
        const PAGE_KEY = USER_RECORD != null ? HOME_PAGE_CLASS_KEY : REGISTRATION_PAGE_CLASS_KEY; // Check if user data exists
        const PAGE_CLASS = REFERENCES[PAGE_KEY];
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(PAGE_CLASS);
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
        return this.createElement('div', {}, [            
            this.createElement('h1', {
                id: 'title',
                textContent: 'This Is The Login Page!'
            }),
            this.createElement('input', {
                type: 'text',
                id: LoginPage.#TERMINAL_INPUT_ID
            }),
            this.createElement('p', {
                id: LoginPage.#TERMINAL_OUTPUT_ID
            })
        ])
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
        return LoginPage.#ID;
    }
}