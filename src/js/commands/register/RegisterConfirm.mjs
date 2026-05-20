import {
    REFERENCES, 
    FIREBASE_IO_INSTANCE_KEY, 
    REGISTRATION_CACHE, 
    HOME_PAGE_CLASS_KEY, 
    PAGE_MANAGER_INSTANCE_KEY
} from "../../core/ReferenceStorage.mjs";
import Utils from "../../core/Utils.mjs";

export default async function (_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    let msg;
    const USER = FBIO.authedUser();
    if (USER != null){
        const UID = USER.uid;
        await FBIO.update(`users/${UID}`, REFERENCES[REGISTRATION_CACHE], async () => {
            msg = `Confirmed Registration`;
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
        })
    } else {
        msg = 'Permission Denied: Not Logged In'
    }
    return msg;
}
