import Page from './Page.mjs';
import {REFERENCES, FIREBASE_IO_INSTANCE_KEY, AUTHED_USER_KEY} from '../core/ReferenceStorage.mjs';

export default class HomePage extends Page{
    static #ID = 'home_page'; // Page ID
    #authedUser = null;
    
    preDisplay(){
        this.#authedUser = REFERENCES[AUTHED_USER_KEY];
    }

    onDisplay(){
        document.getElementById('title').innerHTML = `Hello, ${this.#authedUser.name}`
        document.getElementById('user-pfp').src = this.#authedUser.pfp;
    }

    getHTML(){
        return `
            <div>
                <h1 id='title'></h1>
                <img id='user-pfp'>
            </div>
        `
    }

    getId(){
        return HomePage.#ID;
    }
}