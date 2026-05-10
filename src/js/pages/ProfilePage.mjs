import Page from './Page.mjs';
import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY, 
    FIREBASE_IO_INSTANCE_KEY, 
    HOME_PAGE_CLASS_KEY,
    REGISTRATION_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

export default class ProfilePage extends Page {
    static #ID = "profile_page";

    getId(){
        return ProfilePage.#ID;
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                textContent: "Profile Page"
            })
        ])
    }
}