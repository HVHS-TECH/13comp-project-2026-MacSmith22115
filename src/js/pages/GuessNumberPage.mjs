import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    HEARTS_ROUND_OVER_PAGE_CLASS_KEY,
    HEARTS_MATCH_OVER_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Card from "../game/Card.mjs";
import Terminal from "../core/Terminal.mjs";

/*****************************************************************
 * GuessNumberPage.mjs
 * @author MacSmith22115
 * Created: Term #2 2026
 * @extends Page
 * Description: 
 *  -> Page for 2nd game, 'Guess the Number'
 ****************************************************************/
export default class GuessNumberPage extends Page {
    static ID = "guess_number_page";

    static #RAND_NUM_KEY = 'randNum'; // Key of the random number in #gameData
    static #GUESSES_KEY = 'guesses'; // Key of past guesses in #gameData
    #gameData = {}

    /*****************************************************************
    * Description:
    *   -> Creats a random int between _min and _max
    * Params:
    *   -> '_min': Min int
    *   -> '_max': Max int
    *****************************************************************/
    createRandomNum(_min, _max) {
        return Math.floor(Math.random() * (_max - _min + 1)) + _min;
    }

    /*****************************************************************
    * Description:
    *   -> Checks if the players guess matches the random number
    * Params:
    *   -> '_guess': the player inputted guess
    *****************************************************************/
    checkGuess(_guess) {
        const RAND_NUM = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#RAND_NUM_KEY, () => {
            return -1;
        })
        if (RAND_NUM === -1) {
            return 'Code Error: Random Number Not Found, Please Restart Page';
        }

        const GUESSES = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#GUESSES_KEY, () => []);
        GUESSES.push(_guess);
        this.#gameData[GuessNumberPage.#GUESSES_KEY] = GUESSES;

        if (_guess != RAND_NUM) {
            return this.calcDiff(_guess, RAND_NUM);
        }
        this.onCorrectGuess();
        return "Enter 'gtn replay' To Start New Game";
    }

    /*****************************************************************
    * Description:
    *   -> Prints to the terminal that the user got the number right
    *****************************************************************/
    onCorrectGuess() {
        const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
        const NUM = GuessNumberPage.safeGet(this.#gameData);
        const GUESS_COUNT = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#GUESSES_KEY, () => []).length;
        TERMINAL.printStr(`You Guessed The Correct Number (${NUM}) In ${GUESS_COUNT} Guesses`);
    }

    /*****************************************************************
    * Description:
    *   -> Calculates the difference between the user guess and random number
    * Params: 
    *   -> '_guess': User-inputed guess
    *   -> '_rand': Game generated Random number
    *****************************************************************/
    calcDiff(_guess, _rand) {
        const ABS_DIFF = Math.abs(_rand - _guess);
        let str = "Code Error: Seeing This Means Code Broke...";

        if (ABS_DIFF >= 30) {
            str = `Freezing`
        } else if (ABS_DIFF >= 20) {
            str = `Cold`
        } else if (ABS_DIFF >= 10) {
            str = `Warm`
        } else if (ABS_DIFF >= 5) {
            str = `Hot`
        } else {
            str = `Burning`
        }
        return str;
    }

    /*****************************************************************
    * Description:
    *   -> tries to get _field from _obj
    *   -> Returns the result of the func _fallback if _field was null in _obj
    * Params:
    *   -> '_obj': Object to try get _field from
    *   -> '_field': Key to try get fron _obj
    *   -> '_fallback': Func to call if _field was not found in _obj, used to return a set val
    *****************************************************************/
    static safeGet(_obj, _field, _fallback = () => { return -1 }) {
        return _obj[_field] ?? _fallback();
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being displayed
    *   -> In this instance the following is done:
    *       -> Register a new terminal, providing the input and output elements. 
    *       -> Creats a random number and caches it
    *****************************************************************/
    onDisplay() {
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Use 'gtn guess' to guess the random number...")
        this.#gameData[GuessNumberPage.#RAND_NUM_KEY] = this.createRandomNum(1, 100);
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being removed
    *   -> In this instance the following is done:
    *       -> Termianl instance is unregistered.
    *****************************************************************/
    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    /*****************************************************************
    * Description:
    *   -> creates the html elements required for the page
    * Returns: An html element
    *****************************************************************/
    getHTML() {
        return this.createElement('div', {
            className: 'terminal-window'
        }, [
            this.createElement("div", {
                className: "terminal-title-bar"
            }, [
                this.createElement("div", {
                    className: "terminal-title-left-side"
                }, [
                    this.createElement('span', {
                        textContent: "Terminal"
                    })
                ]),
                this.createElement("div", {
                    className: "terminal-title-center-side"
                }, [
                    this.createElement("span", {
                        textContent: "?/13comp-project-2026-MacSmith22115/~",
                        className: "terminal-title-tab"
                    })
                ]),
                this.createElement("div", {
                    className: "terminal-title-right-side"
                }, [
                    this.createElement("div", {
                        className: "terminal-title-buttons"
                    }, [
                        this.createElement("button", {
                            textContent: "X",
                            className: "terminal-logout-button"
                        })
                    ])
                ]),
            ]),

            this.createElement('div', {
                id: 'terminal-content'
            }, [
                this.createElement('div', {
                    id: Terminal.TERMINAL_OUTPUT_ELEMENT_ID
                }),
                this.createElement('div', {
                    className: 'command-line'
                }, [
                    this.createElement('span', {
                        className: 'command-prompt',
                        textContent: '~$'
                    }),
                    this.createElement('input', {
                        type: 'text',
                        className: 'command-input',
                        id: Terminal.TERMINAL_INPUT_ELEMENT_ID,
                        autofocus: true,
                    })
                ])
            ])
        ])
    }

    /*****************************************************************
    * Description:
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return GuessNumberPage.ID;
    }
}