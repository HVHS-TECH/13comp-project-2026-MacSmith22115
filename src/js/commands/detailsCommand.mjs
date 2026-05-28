import {REFERENCES, FIREBASE_IO_INSTANCE_KEY, REGISTRATION_CACHE, TERMINAL_INSTANCE} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

async function attemptGet(_field){
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser();
    let msg;
    let read = null;
    if (USER != null){
        read = await FBIO.read(`users/${USER.uid}/${_field}`);
        msg = `Read User's ${_field}: ${read}`;
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return {msg, read};
}

async function attemptSet(_field, _data) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser()
    let msg;
    if (USER != null){
        await FBIO.update(`users/${USER.uid}`, {
            [_field] : _data
        })
        msg = `Updated User's ${_field}: ${_data}`;
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return msg;
}

export async function getName() {
    return (await attemptGet('name')).msg;
}

export async function getEmail() {
    return (await attemptGet('email')).msg;
}

export async function getPfp() {
    return (await attemptGet('pfp')).msg;
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