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
 * @extends Page
 * Description: 
 *  -> The Registration Page collates information given and creats a user account.
 ****************************************************************/
export default class RegistrationPage extends Page {
    static ID = 'registration_page';

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed, in this instance it:
    *       -> Caches initial registration data
    *       -> Creates a new terminal instance and prints txt to it
    *****************************************************************/
    onDisplay() {
        const AUTH = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser(true);
        Object.assign(REFERENCES[REGISTRATION_CACHE], AUTH);
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr(`Captured Info... [${AUTH.name.val}, ${AUTH.email.val}]`);
        REFERENCES[TERMINAL_INSTANCE].printStr("Use 'register ${data} -${input}' To enter data");
        REFERENCES[TERMINAL_INSTANCE].printStr("EG 'register age -17' Will Register age as 17");
        REFERENCES[TERMINAL_INSTANCE].printStr("Use 'register confirm' To Finalize Registration...");
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being removed
    *   -> In this instance the following is done:
    *       -> Termianl instance is unregistered.
    *****************************************************************/
    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    /*****************************************************************
    * Description:
    *   -> creates the html elements required for the page
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
    * Description:
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return RegistrationPage.ID;
    }
}