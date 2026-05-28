import {
    REFERENCES, 
    FIREBASE_IO_INSTANCE_KEY, 
    REGISTRATION_CACHE,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";


export async function registerName(_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const AUTHED = isAuthed();
    if (AUTHED) REFERENCES[REGISTRATION_CACHE].name = _args[0];
    const str = AUTHED ? `Updated Name To... ${_args[0]}` : `Permission Denied: Not Logged In`;
    return str;
}

export async function registerAge(_args){
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const AUTHED = isAuthed();
    if (AUTHED) REFERENCES[REGISTRATION_CACHE].age = _args[0];
    return AUTHED ? `Registered Age... ${_args[0]}` : `Permission Error: Not Logged In`;
}

export async function registerPhone(_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const AUTHED = isAuthed();
    if (AUTHED) REFERENCES[REGISTRATION_CACHE].phone = _args[0];
    return AUTHED ? `Registered Phone... ${_args[0]}` : `Permission Error: Not Logged In`;
}

export async function registerColour(_args){
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const AUTHED = isAuthed();
    if (AUTHED) REFERENCES[REGISTRATION_CACHE].colour = _args[0];
    return AUTHED ? `Registered Colour... ${_args[0]}` : `Permission Error: Not Logged In`;    
}

export async function registerConfirm(){
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const AUTHED = isAuthed();
    if (AUTHED){
        const UID = FBIO.authedUser().uid;
        validateData(REFERENCES[REGISTRATION_CACHE]);
        await FBIO.update(`users/${UID}`, REFERENCES[REGISTRATION_CACHE], async () => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
        })
    }
    return AUTHED ? `Writing Details to Firebase...` : 'Permission Denied: Not Logged In';
}

async function validateData(_data) {
    const ERRORS = [];
    let valid = true;
    //TODO this could return true if phone is true, even if name is false;
    valid = Utils.validateInput(_data.name, ERRORS, Utils.NAME_VALIDATION_RULE);
    valid = Utils.validateInput(_data.email, ERRORS, Utils.EMAIL_VALIDATION_RULE);
    valid = Utils.validateInput(_data.pfp, ERRORS, Utils.PFP_VALIDATION_RULE);
    valid = Utils.validateInput(_data.age, ERRORS, Utils.AGE_VALIDATION_RULE);
    valid = Utils.validateInput(_data.colour, ERRORS, Utils.COLOUR_VALIDATION_RULE);
    valid = Utils.validateInput(_data.phone, ERRORS, Utils.PHONE_VALIDATION_RULE);
    return valid;
}

async function validate(_field, _errors = [], _ruleCallback){
    if (_field != null){
        const VALID = _ruleCallback(_errors);
        return true;
    } else {
        _errors.push(`Registration Error: ${_field} Not Found`);
        return false;
    }
}

async function isAuthed() {
    
    const USER = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
    return USER != null;
}