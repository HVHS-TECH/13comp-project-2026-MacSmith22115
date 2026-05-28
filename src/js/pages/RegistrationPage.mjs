// Imports
import Page from './Page.mjs';
import {
    REFERENCES,
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE,
    REGISTRATION_CACHE
} from '../core/ReferenceStorage.mjs';
import Terminal from '../core/Terminal.mjs';

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
    static ID = 'registration_page'; // Page ID

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay() {
        const AUTH = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
        Object.assign(REFERENCES[REGISTRATION_CACHE], AUTH);
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].systemPrint(`Captured Info... [${AUTH.name}, ${AUTH.email}]`);
        REFERENCES[TERMINAL_INSTANCE].systemPrint("Use 'details set ${catagory} -${data}'");

        for (const [_field, _value] of Object.entries(REFERENCES[REGISTRATION_CACHE])){
            REFERENCES[TERMINAL_INSTANCE].systemPrint(`Gathered ${_field} from Google: ${_value}`);
        }
    }

    /*****************************************************************
    * getHTML();
    * Description:
    *   -> Returns a string containing HTML tags
    * Params: N/A
    * Returns: String of HTML tags
    * Throws: N/A
    *****************************************************************/
    getHTML() {
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: 'title',
                textContent: 'Register...'
            }),
            this.createElement('p', {
                id: Terminal.TERMINAL_OUTPUT_ELEMENT_ID
            }),
            this.createElement('input', {
                type: 'text',
                id: Terminal.TERMINAL_INPUT_ELEMENT_ID
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
    getId() {
        return RegistrationPage.ID;
    }
}