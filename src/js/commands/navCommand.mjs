import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    TERMINAL_INSTANCE,
    GUESS_NUMBER_PAGE_CLASS_KEY,
    ADMIN_PAGE_CLASS_KEY,
    REGISTRATION_PAGE_CLASS_KEY,
    HEARTS_LOBBY_PAGE_CLASS_KEY,
    HEARTS_ROUND_OVER_PAGE_CLASS_KEY,
    HEARTS_MATCH_OVER_PAGE_CLASS_KEY,
    HEARTS_GAME_PAGE_CLASS_KEY,
    LOGIN_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';
import Page from '../pages/Page.mjs';

export async function displayPage(_args) {
    const PAGE_REFERNCE_KEY = _args[0];
    console.log('RAN ');
    if (REFERENCES[PAGE_REFERNCE_KEY] == null){
        return "Argument Error: Parsed Argument Was Not A Valid ID";
    }
    const CLASS_REFERENCE = REFERENCES[PAGE_REFERNCE_KEY];

    if (!(CLASS_REFERENCE.prototype instanceof Page)){
        return "Argument Error: Selected Page Not Valid";
    }

    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(CLASS_REFERENCE);
    return "Displaying Selected Page..."
}

export async function listPages() {
    const PAGES = [];
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const IS_ADMIN = await FBIO.isAuthedAdmin();
    const BLACKLISTED_PAGES = [
        REFERENCES[REGISTRATION_PAGE_CLASS_KEY],
        REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY],
        REFERENCES[HEARTS_ROUND_OVER_PAGE_CLASS_KEY],
        REFERENCES[HEARTS_MATCH_OVER_PAGE_CLASS_KEY],
        REFERENCES[HEARTS_GAME_PAGE_CLASS_KEY],
        REFERENCES[LOGIN_PAGE_CLASS_KEY]
    ];
    if (!IS_ADMIN) {
        BLACKLISTED_PAGES.push(REFERENCES[ADMIN_PAGE_CLASS_KEY]);
    }
    for (const [_id, _reference] of Object.entries(REFERENCES)){
        if (!_reference) continue;
        const PROTOTYPE = _reference.prototype;
        if (!PROTOTYPE) continue;
        if (!(PROTOTYPE instanceof Page)) continue;
        if (BLACKLISTED_PAGES.includes(_reference)) continue;
        REFERENCES[TERMINAL_INSTANCE].printStr(_id);
    }
    return "All Accessable Page's Ids Have Been Listed..."

}