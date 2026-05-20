// Imports
import Page from './Page.mjs';
import {
    REFERENCES, 
    FIREBASE_IO_INSTANCE_KEY, 
    PAGE_MANAGER_INSTANCE_KEY, 
    HEARTS_LOBBY_BROWSER_PAGE_CLASS_KEY,
    PROFILE_PAGE_CLASS_KEY,
    ADMIN_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * HomePage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 2/3/26
 * @extends Page
 * Description: 
 *  -> Used to access games, profile details, and more
 ****************************************************************/
export default class HomePage extends Page{
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
    async preDisplay(){
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
    onDisplay(){
        document.getElementById('title').innerHTML = `Hello, ${this.#cache.user.name}, you ${this.#cache.isAdmin ? 'are' : 'are not'} admin`
        document.getElementById('user-pfp').src = this.#cache.user.pfp;

        if (!this.#cache.isAdmin){
            document.getElementById(HomePage.#ADMIN_PAGE_BUTTON_ID).remove();
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
    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: 'title'
            }),
            this.createElement('img', {
                id: 'user-pfp'
            }),
            this.createElement('button', {
                id: HomePage.#HEARTS_PLAY_BUTTON_ID,
                textContent: 'Hearts',
                onclick: () => {
                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_BROWSER_PAGE_CLASS_KEY]);
                }
            }),
            this.createElement('button', {
                id: HomePage.#ADMIN_PAGE_BUTTON_ID,
                textContent: 'Admin Page',
                onclick: () => {
                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[ADMIN_PAGE_CLASS_KEY]);
                }
            }),
            this.createElement('button', {
                id: HomePage.#PROFILE_PAGE_BUTTON_ID,
                textContent: 'Profile Page',
                onclick: () => {
                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[PROFILE_PAGE_CLASS_KEY]);
                }
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
    getId(){
        return HomePage.ID;
    }
}