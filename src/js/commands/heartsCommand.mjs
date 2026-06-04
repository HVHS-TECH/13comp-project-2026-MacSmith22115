import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    TERMINAL_INSTANCE
} from '../core/ReferenceStorage.mjs';

export async function readyUp() {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
    const LOBBY_ID = LOBBY.getLobbyId();
    const USER = FBIO.authedUser();
    
    const READY_FLAGS = await FBIO.read(`lobbies/${LOBBY_ID}/flags/ready`) ?? {};
    READY_FLAGS[USER.uid] = true;
    
    let msg;
    await FBIO.update(`lobbies/${LOBBY_ID}/flags`, {
        ready: READY_FLAGS
    }, async () => {
        REFERENCES[TERMINAL_INSTANCE].printStr("You Have Ready-ed Up!");
        msg = "Enter 'hearts unready' to Unready";
    })
    return msg;
}

export async function unreadyUp() {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
    const LOBBY_ID = LOBBY.getLobbyId();
    const USER = FBIO.authedUser();
    
    const READY_FLAGS = await FBIO.read(`lobbies/${LOBBY_ID}/flags/ready`) ?? {};
    delete READY_FLAGS[USER.uid];
    
    let msg;
    await FBIO.update(`lobbies/${LOBBY_ID}/flags`, {
        ready: READY_FLAGS
    }, async () => {
        REFERENCES[TERMINAL_INSTANCE].printStr("You Are Unready-ed!");
        msg = "Enter 'hearts readyup' to re-ready"
    })
    return msg;
}