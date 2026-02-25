import Page from './Page.mjs';

export default class LoginPage extends Page {
    static #ID = 'login_page';

    getHTML(){
        return `
            <div>
                <h1 id='title'>This Is The Login Page!</h1>
            </div>
        `;
    }

    getId(){
        return LoginPage.#ID;
    }
    
}