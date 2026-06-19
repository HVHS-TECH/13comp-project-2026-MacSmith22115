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
    static ID = 'login_page'; // Page ID
    static #TERMINAL_INPUT_ID = 'terminal_input';
    static #TERMINAL_OUTPUT_ID = 'terminal_output';

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async onDisplay() {
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Terminal [Version 0.0.22.2]")
        REFERENCES[TERMINAL_INSTANCE].printStr("(!c) Macklyn Smith. No Rights Reserved")
        REFERENCES[TERMINAL_INSTANCE].printStr("Use 'login google' To Continue...")
    }

    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
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
    async attemptLogin() {
        const FIREBASE_IO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const USER = await FIREBASE_IO.authViaGoogle();
        const USER_RECORD = await FIREBASE_IO.read(`users/${USER.uid.val}`);
        const PAGE_KEY = USER_RECORD != null ? HOME_PAGE_CLASS_KEY : REGISTRATION_PAGE_CLASS_KEY; // Check if user data exists
        const PAGE_CLASS = REFERENCES[PAGE_KEY];
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(PAGE_CLASS);
    }

    /*****************************************************************
    * getHTML();
    * Description:
    *   -> creates the html elements required for the page
    * Params: N/A
    * Returns: An html element
    * Throws: N/A
    *****************************************************************/
    getHTML() {
        return this.createElement('div', {
            className: 'terminal-window'
        }, [
            this.createElement("div", {
                className: "terminal-title-bar"
            }, [
                this.createElement("div", {
                    className: "terminal-title-left-side"
                }, [
                    this.createElement('span', {
                        textContent: "Terminal"
                    })
                ]),
                this.createElement("div", {
                    className: "terminal-title-center-side"
                }, [
                    this.createElement("span", {
                        textContent: "?/13comp-project-2026-MacSmith22115/~",
                        className: "terminal-title-tab"
                    })
                ]),
                this.createElement("div", {
                    className: "terminal-title-right-side"
                }, [
                    this.createElement("div", {
                        className: "terminal-title-buttons"
                    }, [
                        this.createElement("button", {
                            textContent: "X",
                            className: "terminal-logout-button"
                        })
                    ])
                ]),
            ]),

            this.createElement('div', {
                id: 'terminal-content'
            }, [
                this.createElement('div', {
                    id: Terminal.TERMINAL_OUTPUT_ELEMENT_ID
                }),
                this.createElement('div', {
                    className: 'command-line'
                }, [
                    this.createElement('span', {
                        className: 'command-prompt',
                        textContent: '~$'
                    }),
                    this.createElement('input', {
                        type: 'text',
                        className: 'command-input',
                        id: Terminal.TERMINAL_INPUT_ELEMENT_ID,
                        autofocus: true,
                    })
                ])
            ])
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
        return LoginPage.ID;
    }
}