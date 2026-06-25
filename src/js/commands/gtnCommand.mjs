import {
    REFERENCES, 
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    TERMINAL_INSTANCE,
    GUESS_NUMBER_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

export async function handleGuess(_args) {
    const PAGE = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage();
    const GUESS = _args[0];
    if (Number.isNaN(Number(GUESS))){
        return "Type Error: Please Enter Guess As an Number"
    }
    if (!isCorrectPage()){
        return "Location Error: "
    }

    return PAGE.checkGuess(GUESS);
}

export async function replayGame() {
    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[GUESS_NUMBER_PAGE_CLASS_KEY]);
    return 'Resetting Game...'
}

function isCorrectPage(){
    return REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId() === REFERENCES[GUESS_NUMBER_PAGE_CLASS_KEY].ID;
}