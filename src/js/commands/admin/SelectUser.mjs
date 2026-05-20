import {
    REFERENCES, 
    FIREBASE_IO_INSTANCE_KEY, 
    REGISTRATION_CACHE, 
    HOME_PAGE_CLASS_KEY, 
    PAGE_MANAGER_INSTANCE_KEY,
    ADMIN_PAGE_CLASS_KEY
} from "../../core/ReferenceStorage.mjs";
import Utils from "../../core/Utils.mjs";

export default async function (_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    let msg;

    const IS_ADMIN = await FBIO.isAuthedAdmin();
    const IS_PAGE_ADMIN = PG_MANAGER.getMainPage().getId() === REFERENCES[ADMIN_PAGE_CLASS_KEY].ID;

    if (IS_PAGE_ADMIN){
        const PAGE_INS = PG_MANAGER.getMainPage();
        PAGE_INS.selectedUser = 'no';
    }
    return msg;
}
