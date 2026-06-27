import {
    REFERENCES,
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    TERMINAL_INSTANCE,
    GUESS_NUMBER_PAGE_CLASS_KEY
} from '../core/ReferenceStorage.mjs';

/*****************************************************************
* Description:
*   -> Called by running cmd 'gtn guess -${input}'
*   -> Replace ${input} with user-passed argument
    -> Does typechecks on _args[0] before passing it on.
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function handleGuess(_args) {
    const PAGE = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage();
    const GUESS = _args[0];
    if (Number.isNaN(Number(GUESS))) {
        return "Type Error: Please Enter Guess As an Number"
    }
    if (!isCorrectPage()) {
        return "Location Error: "
    }

    return PAGE.checkGuess(GUESS);
}

/*****************************************************************
* Description:
*   -> Called by running the command 'gtn replay'
*****************************************************************/
export async function replayGame() {
    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[GUESS_NUMBER_PAGE_CLASS_KEY]);
    return 'Resetting Game...'
}

/*****************************************************************
* Description:
*   -> Checks if the current page is an instance of GuessNumberPage.mjs
*****************************************************************/
function isCorrectPage() {
    return REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId() === REFERENCES[GUESS_NUMBER_PAGE_CLASS_KEY].ID;
}