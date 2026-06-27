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
 * Created: Term #2 2026
 * @extends Page
 * Description: 
 *  -> The profile page, used to view and edit your own account details
 ****************************************************************/
export default class ProfilePage extends Page {
    static ID = "profile_page";

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being displayed, in this intance it:  
    *       -> Registers a new terminal and prints text to it
    *****************************************************************/
    async onDisplay() {
        const AUTH = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr(`Viewing Details for ${AUTH.name}`);
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
        return ProfilePage.ID;
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
}