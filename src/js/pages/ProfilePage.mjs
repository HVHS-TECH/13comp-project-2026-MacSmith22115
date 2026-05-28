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

export default class ProfilePage extends Page {
    static ID = "profile_page";

    async onDisplay(){
        const AUTH = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].systemPrint(`Viewing Details for ${AUTH.name}`);
    }

    getId(){
        return ProfilePage.ID;
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                textContent: "Profile Page"
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
}