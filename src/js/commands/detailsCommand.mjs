import {REFERENCES, FIREBASE_IO_INSTANCE_KEY, REGISTRATION_CACHE, TERMINAL_INSTANCE} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

async function attemptGet(_field, _private = true){
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser(true);
    let msg;
    let read = null;
    if (USER != null){  
        const PRIVATE_PATH_MODIFIER = _private ? 'private' : 'public';
        read = await FBIO.read(`users/${USER.uid.val}/${PRIVATE_PATH_MODIFIER}/${_field}`);
        msg = `Read User's ${_field}: ${read}`;
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return {msg, read};
}

async function attemptSet(_field, _data) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser(true);
    const ERRORS = [];
    const IS_VALID_INPUT = Utils.validateInput(_data, ERRORS, Utils[`${_field.toUpperCase()}_VALIDATION_RULE`]);
    let msg;
    if (USER != null){
        if (IS_VALID_INPUT) {
            await FBIO.update(`users/${USER.uid.val}`, {
                [_field] : _data
            })
            msg = `Updated User's ${_field}: ${_data}`;
        } else {
            ERRORS.forEach(_error => REFERENCES[TERMINAL_INSTANCE].printStr(_error));
            msg = `${_field} Validation Error: See Above For Details`;
        }
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return msg;
}

export async function getName() {
    return (await attemptGet('name', false)).msg;
}

export async function getEmail() {
    return (await attemptGet('email')).msg;
}

export async function getPfp() {
    return (await attemptGet('pfp', false)).msg;
}

export async function getAge() {
    return (await attemptGet('age')).msg;
}

export async function getColour() {
    return (await attemptGet('colour')).msg;
}

export async function getPhone() {
    return attemptGet('phone').msg;
}

export async function setName(_args) {
    return attemptSet('name', _args[0]);
}

export async function setEmail(_args) {
    return attemptSet('email', _args[0]);
}

export async function setPfp(_args) {
    return attemptSet('pfp', _args[0]);
}

export async function setAge(_args){
    return attemptSet('age', _args[0]);
}

export async function setColour(_args){
   return attemptSet('colour', _args[0]);
}

export async function setPhone(_args){
    return attemptSet('phone', _args[0]);
}

export async function list() {
    const READ = (await attemptGet('')).result;
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    if (READ != null){
        
    } else {

    }
}