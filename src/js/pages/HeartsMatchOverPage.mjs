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

    onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Match Over!");
        REFERENCES[TERMINAL_INSTANCE].printStr("This Is WORK-IN-PROGRESS...");
        REFERENCES[TERMINAL_INSTANCE].printStr('Here Will Be Final Scores, etc.')
        REFERENCES[TERMINAL_INSTANCE].printElement(this.createElement("div", { id: "terminal-buttons-div" }));
        REFERENCES[TERMINAL_INSTANCE].printElement(
            this.createElement('button', {
                id: HeartsMatchOverPage.#HTML_HOMEPAGE_BUTTON_ID,
                textContent: "[To Homepage] (Dispand Lobby)",
                onclick: async () => await this.backToHomepage()
            }), "terminal-buttons-div");
        this.writeGlobalPoints();
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}`]: async (_data) => {
                if (_data != null) return;
                REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            },
        });
    }

    onRemove() {
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    async writeGlobalPoints() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();

        const POINTS = await LOBBY.getPoints(true);

        const MAP = new Map();

        const TURN = CACHE.turn;
        if (FBIO.authedUser().uid === TURN) {
            console.log('ABOUT TO SCORE POINTS')
            for (const [_placing, _data] of Object.entries(POINTS)) {
                const PLAYER = _data.player;
                const RANKED_SCORE = this.getRankedScore(POINTS, _data);
                const OLD_TOTAL_SCORE = await FBIO.read(`/scoreboard/hearts/${PLAYER}`);

                await FBIO.update(`/scoreboard/hearts`, {
                    [PLAYER]: (OLD_TOTAL_SCORE + RANKED_SCORE)
                }, () => console.log(`Scored Points for ${PLAYER}`));
            }
        }
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

    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    async backToLobby() {

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