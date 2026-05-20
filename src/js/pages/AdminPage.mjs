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

export default class AdminPage extends Page {
    static ID = 'admin_page';
    selectedUser = null;

    preDisplay(){
    }

    async onDisplay(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const IS_ADMIN = FBIO.isAuthedAdmin();
        if (!IS_ADMIN) {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            return;
        }

        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].systemPrint(`"With Great Power Come Great Responsibility"`);
    }

    getId(){
        return AdminPage.ID;
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                textContent: "Admin Page"
            }),
            this.createElement('input', {
                type: 'text',
                id: Terminal.TERMINAL_INPUT_ELEMENT_ID
            }),
            this.createElement('p', {
                id: Terminal.TERMINAL_OUTPUT_ELEMENT_ID
            })
        ])
    }
}