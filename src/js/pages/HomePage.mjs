// Imports
import Page from './Page.mjs';
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HEARTS_LOBBY_BROWSER_PAGE_CLASS_KEY,
    PROFILE_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE,
    ADMIN_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';
import Terminal from '../core/Terminal.mjs';

/*****************************************************************
 * HomePage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 2/3/26
 * @extends Page
 * Description: 
 *  -> Used to access games, profile details, and more
 ****************************************************************/
export default class HomePage extends Page {
    static ID = 'home_page'; // Page ID
    static #HEARTS_PLAY_BUTTON_ID = 'hearts_play';
    static #ADMIN_PAGE_BUTTON_ID = 'admin_page_btn';
    static #PROFILE_PAGE_BUTTON_ID = 'profile_page_btn';

    #cache = {};

    /*****************************************************************
    * preDisplay();
    * Description:
    *   -> Runs Code before the page is displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async preDisplay() {
        this.#cache.user = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
        this.#cache.isAdmin = await REFERENCES[FIREBASE_IO_INSTANCE_KEY].isAuthedAdmin();
    }

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay() {
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);

        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
        TERMINAL.printElement(this.createElement("img", {
            src: this.#cache.user.pfp
        }));
        TERMINAL.printStr(`Welcome ${this.#cache.user.name}`);
        TERMINAL.printStr("Navigate By Clicking Below")
        TERMINAL.printElement(this.createElement("div", { id: "terminal-buttons-div" }));

        TERMINAL.printElement(
            this.createElement("button", {
                textContent: "[Play Hearts]",
                onclick: () => {
                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_BROWSER_PAGE_CLASS_KEY])
                }
            }), 'terminal-buttons-div');

        TERMINAL.printElement(
            this.createElement("button", {
                textContent: "[Profile]",
                onclick: () => {
                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[PROFILE_PAGE_CLASS_KEY])
                }
            }
            ), 'terminal-buttons-div');

        if (this.#cache.isAdmin) {
            TERMINAL.printElement(
                this.createElement("button", {
                    textContent: "[Admin]",
                    onclick: () => {
                        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[ADMIN_PAGE_CLASS_KEY])
                    }
                }
                ), 'terminal-buttons-div');
        }
    }

    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
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
                        }),
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
        return HomePage.ID;
    }
}