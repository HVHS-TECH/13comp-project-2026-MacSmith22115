import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    HEARTS_GAME_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Deck from "../game/Deck.mjs";
import Card from "../game/Card.mjs";
import Terminal from "../core/Terminal.mjs";
export default class HeartsMatchOverPage extends Page {
    static ID = 'hearts_match_over_page';
    static #HTML_TITLE_ID = 'main_title';
    static #HTML_HOMEPAGE_BUTTON_ID = 'homepage_btn';
    static #HTML_LOBBY_BUTTON_ID = 'lobby_btn';
    #firebaseListeners;
    #players = {};

    async preDisplay() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        await LOBBY.generateCache();
        const PLAYERS = Object.values(LOBBY.getLobbyCache().players);
        for (let i = 0; i < PLAYERS.length; i++) {
            const PLAYER = PLAYERS[i];
            const PUBLIC_RECORDS = await REFERENCES[FIREBASE_IO_INSTANCE_KEY].read(`users/${PLAYER}/public`);
            this.#players[PLAYER] = PUBLIC_RECORDS;
        }
    }

    async onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Match Over!");
        REFERENCES[TERMINAL_INSTANCE].printStr('FINAL Scores & Placings:');
        await this.printRoundStats();
        REFERENCES[TERMINAL_INSTANCE].printStr(
            'Global Points Earned for This Game is the Player Count Minus Your Placing'
        );
        REFERENCES[TERMINAL_INSTANCE].printStr('Pressing on the Button Below will exit for all players');
        this.printElements();
        this.writeGlobalPoints();
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}`]: async (_data) => {
                if (_data != null) return;
                REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            },
        });
    }

    getRankedScore(_globalPointsObj, _playerEntry) {
        const MAP = new Map();
        const PLAYER_COUNT = Object.entries(_globalPointsObj).length; // TODO: Won't count players who don't score... to fix
        let returnVal = 0;
        for (const [_placing, _data] of Object.entries(_globalPointsObj)) {
            if (_data === _playerEntry) {
                returnVal = PLAYER_COUNT - _placing;
            }
        }
        return returnVal;
    }

    async writeGlobalPoints() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const POINTS = await LOBBY.getPoints(true);
        const MAP = new Map();
        const TURN = CACHE.turn;
        if (FBIO.authedUser().uid === TURN) {
            for (const [_placing, _data] of Object.entries(POINTS)) {
                const PLAYER = _data.player;
                const RANKED_SCORE = this.getRankedScore(POINTS, _data);
                const OLD_TOTAL_SCORE = await FBIO.read(`/scoreboard/hearts/${PLAYER}`);

                await FBIO.update(`/scoreboard/hearts`, {
                    [PLAYER]: (OLD_TOTAL_SCORE + RANKED_SCORE)
                });
            }
        }
    }

    async printRoundStats() {
        const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const SCORES = await LOBBY.getPoints(true);
        for (let placing = 0; placing < (SCORES.length); placing++) {

            const PLAYER_TO_SCORE_OBJ = SCORES[placing];
            const SCORE = PLAYER_TO_SCORE_OBJ.score;
            const PLAYER_UID = PLAYER_TO_SCORE_OBJ.player;
            const PLAYER_NAME = this.#players[PLAYER_UID].name;
            TERMINAL.printStr(`#${placing + 1}: ${PLAYER_NAME} @ ${SCORE} Points`);
        }
    }



    printElements() {
        REFERENCES[TERMINAL_INSTANCE].printElement(this.createElement("div", { id: "terminal-buttons-div" }));
        REFERENCES[TERMINAL_INSTANCE].printElement(
            this.createElement('button', {
                id: HeartsMatchOverPage.#HTML_HOMEPAGE_BUTTON_ID,
                textContent: "[To Homepage] (Dispand Lobby)",
                onclick: async () => await this.backToHomepage()
            }), "terminal-buttons-div");
    }

    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    async backToHomepage() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
        await LOBBY.closeLobby();
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
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
        return HeartsMatchOverPage.ID;
    }
}