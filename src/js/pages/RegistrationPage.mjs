// Imports
import Page from './Page.mjs';
import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY, 
    FIREBASE_IO_INSTANCE_KEY, 
    HOME_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

/*****************************************************************
 * RegistrationPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 28/2/26
 * @extends Page
 * Description: 
 *  -> The Registration Page collates information given and creats a user account.
 ****************************************************************/
export default class RegistrationPage extends Page {
    static #ID = 'registration_page'; // Page ID
    static #REGISTER_BUTTON_ID = 'register_button'; // ID of register button
    static #REGISTER_FORM_ID = 'register_form';
    static #REGISTER_INPUT_NAME = 'register_input_name';
    static #REGISTER_INPUT_AGE = 'register_input_age';
    static #REGISTER_INPUT_PHONE = 'register_input_phone';
    static #REGISTER_INPUT_PRONOUN = 'register_input_pronoun';

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay(){
        document.getElementById(RegistrationPage.#REGISTER_FORM_ID).addEventListener('submit', (_event) => {
            _event.preventDefault();
            this.attemptRegisteration();
        })
    }

    attemptRegisteration(){
        const USER = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
        
        const USER_DETAILS = this.collateInputs();

        if (this.validateInputs(USER_DETAILS)){
            Object.assign(USER_DETAILS, USER);
            this.writeAccount(USER_DETAILS);
        }
    }
    
    collateInputs(){
        const INPUTS = {};
        const FORM = document.getElementById(RegistrationPage.#REGISTER_FORM_ID);
        const RAW_DATA = new FormData(FORM);
        
        const RAW_NAME = RAW_DATA.get(RegistrationPage.#REGISTER_INPUT_NAME);
        const RAW_AGE = RAW_DATA.get(RegistrationPage.#REGISTER_INPUT_AGE);
        const RAW_PHONE = RAW_DATA.get(RegistrationPage.#REGISTER_INPUT_PHONE);
        const RAW_PRONOUN = RAW_DATA.get(RegistrationPage.#REGISTER_INPUT_PRONOUN);

        INPUTS.name = RAW_NAME;
        INPUTS.age = RAW_AGE;
        INPUTS.phone = RAW_PHONE;
        INPUTS.pronoun = RAW_PRONOUN;

        return INPUTS;
    }

    validateInputs(_inputs){
        return true;
    }



    /*****************************************************************
    * writeAccount(_uid, _name, _pfp)
    * Description:
    *   -> Writes user's details to the database as an account
    * Params: 
    *   -> '_uid': User's UID.
    *   -> '_name': User's Name.
    *   -> '_pfp': String Link to User's Profile Picture.
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async writeAccount(_details){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].update(`users/${_details.uid}`, _details, () => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
        })
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
            this.createElement('form', {
                id: RegistrationPage.#REGISTER_FORM_ID
            }, [
                this.createElement('label', {
                    for: RegistrationPage.#REGISTER_INPUT_NAME,
                    textContent: 'Username'
                }),
                this.createElement('input', {
                    type: 'text',
                    id: RegistrationPage.#REGISTER_INPUT_NAME,
                    name: RegistrationPage.#REGISTER_INPUT_NAME
                }),
                this.createElement('label', {
                    for: RegistrationPage.#REGISTER_INPUT_AGE,
                    textContent: 'Age'
                }),
                this.createElement('input', {
                    type: 'text',
                    id: RegistrationPage.#REGISTER_INPUT_AGE,
                    name: RegistrationPage.#REGISTER_INPUT_AGE
                }),
                this.createElement('label', {
                    for: RegistrationPage.#REGISTER_INPUT_PHONE,
                    textContent: 'Phone Number'
                }),
                this.createElement('input', {
                    type: 'text',
                    id: RegistrationPage.#REGISTER_INPUT_PHONE,
                    name: RegistrationPage.#REGISTER_INPUT_PHONE
                }),
                this.createElement('label', {
                    for: RegistrationPage.#REGISTER_INPUT_PRONOUN,
                    textContent: 'Perfered Pronouns'
                }),
                this.createElement('input', {
                    type: 'text',
                    id: RegistrationPage.#REGISTER_INPUT_PRONOUN,
                    name: RegistrationPage.#REGISTER_INPUT_PRONOUN
                }),
                this.createElement('input', {
                    type: 'submit',
                    textContent: 'Register...'
                })
            ]),


            this.createElement('h1', {
                id: 'title',
                textContent: 'Register...'
            }),
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
        return RegistrationPage.#ID;
    }
}