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
 * AdminPage.mjs
 * @author MacSmith22115
 * Created: Term #2 2026
 * @extends Page
 * Description: 
 *  -> Accessable ONLY by users flagged as 'admin' by DB
 *  -> Provides a space for admins to change and view data of all other users
 *  -> Admins can only be added or removed via firebase console
 ****************************************************************/
export default class AdminPage extends Page {
    static ID = 'admin_page';
    selectedUser = null;  // The activly selected user to execute CMD's on


    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being displayed
    *   -> In this instance the following is done:
    *       -> User is checked for admin flag in DB.
    *       -> If flag not found, user is sent back to home page.
    *       -> Register a new terminal, providing the input and output elements. 
    *****************************************************************/
    async onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const IS_ADMIN = FBIO.isAuthedAdmin();
        if (!IS_ADMIN) {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            return;
        }

        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr(`"With Great Power Come Great Responsibility"`);
        INPUT.focus();
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
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return AdminPage.ID;
    }

    /*****************************************************************
    * Description:
    *   -> creates the html elements required for the page
    * Returns: An html element
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
}