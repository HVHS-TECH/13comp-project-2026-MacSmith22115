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

export default class GuessNumberPage extends Page {
    static ID = "guess_number_page";

    static #RAND_NUM_KEY = 'randNum';
    static #GUESSES_KEY = 'guesses';
    #gameData = {}

    createRandomNum(_min, _max){
        return Math.floor(Math.random() * (_max - _min + 1)) + _min;
    }

    checkGuess(_guess){
        const RAND_NUM = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#RAND_NUM_KEY, () => {
            return -1;
        })
        if (RAND_NUM === -1){
            return 'Code Error: Random Number Not Found, Please Restart Page';
        }
        
        const GUESSES = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#GUESSES_KEY, () => []);
        GUESSES.push(_guess);
        this.#gameData[GuessNumberPage.#GUESSES_KEY] = GUESSES;

        if (_guess != RAND_NUM){
          return this.calcDiff(_guess, RAND_NUM);
        }
        this.onCorrectGuess();
        return "Enter 'gtn replay' To Start New Game";
    }

    onCorrectGuess(){
        const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
        const NUM = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#RAND_NUM_KEY, () => -1);
        const GUESS_COUNT = GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#GUESSES_KEY, () => []).length;
        TERMINAL.printStr(`You Guessed The Correct Number (${NUM}) In ${GUESS_COUNT} Guesses`);
    }

    calcDiff(_guess, _rand){
        const ABS_DIFF = Math.abs(_rand - _guess);
        let str = "Code Error: Seeing This Means Code Broke...";
    
        if (ABS_DIFF >= 30){
            str = `Freezing`
        } else if (ABS_DIFF >= 20){
            str = `Cold`
        } else if (ABS_DIFF >= 10){
            str = `Warm`
        } else if (ABS_DIFF >= 5){
            str = `Hot`
        } else {
            str = `Burning`
        }
        return str;
    }

    static safeGet(_obj, _field, _fallback = () => {return {}}){
        return _obj[_field] ?? _fallback();
    }

    onDisplay() {
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Use 'gtn guess' to guess the random number...")

        this.#gameData[GuessNumberPage.#RAND_NUM_KEY] = this.createRandomNum(1, 100);
        
        
        console.log(GuessNumberPage.safeGet(this.#gameData, GuessNumberPage.#RAND_NUM_KEY, () => {
            return -1;
        }));
    }

    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

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

    getId() {
        return GuessNumberPage.ID;
    }
}