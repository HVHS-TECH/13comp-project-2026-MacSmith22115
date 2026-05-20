import {REFERENCES, FIREBASE_IO_INSTANCE_KEY, REGISTRATION_CACHE} from "../../../core/ReferenceStorage.mjs";

export default async function () {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser();
    let msg;

    if (USER != null){
        const AGE = await FBIO.read(`users/${USER.uid}/age`);
        msg = AGE;
    } else {
        msg = 'Login Error: Currently Not Logged In'
    }
    return msg;
}