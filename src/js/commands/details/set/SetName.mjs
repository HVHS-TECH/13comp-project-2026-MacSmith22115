import {REFERENCES, FIREBASE_IO_INSTANCE_KEY} from "../../../core/ReferenceStorage.mjs";

export default async function (_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    let msg;
    const USER = FBIO.authedUser();
    if (USER != null){
        const UID = USER.uid;
        await FBIO.update(`users/${UID}`, {
            name: _args[0]
        }, async () => {
            msg = `Updated Name To... ${_args[0]}`
        })
    } else {
        msg = 'Permission Denied: Not Logged In'
    }
    return msg;
}