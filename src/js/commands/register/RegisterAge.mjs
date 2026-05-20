import {REFERENCES, FIREBASE_IO_INSTANCE_KEY, REGISTRATION_CACHE} from "../../core/ReferenceStorage.mjs";

export default async function (_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    let msg;
    const USER = FBIO.authedUser();
    if (USER != null){
        REFERENCES[REGISTRATION_CACHE].age = _args[0];
        msg = `Updated Age To... ${_args[0]}`;
    } else {
        msg = 'Permission Denied: Not Logged In';
    }
    return msg;
}