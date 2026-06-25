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
import HeartsGamePage from "./HeartsGamePage.mjs";
import Terminal from "../core/Terminal.mjs";

export default class HeartsRoundOverPage extends Page {
    static ID = "hearts_round_over_page";
    static #TITLE_ID = 'main-title';
    static #NEW_ROUND_BUTTON_ID = 'new-round-button';
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
        REFERENCES[TERMINAL_INSTANCE].printStr("Round Over!");
        REFERENCES[TERMINAL_INSTANCE].printStr(`Current Placings & Points:`);
        await this.printRoundStats();
        REFERENCES[TERMINAL_INSTANCE].printStr(`New Round Starts When Any Player Hits Button Below...`);
        this.printElements();
    }

    async printRoundStats() {
        const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const SCORES = await LOBBY.getPoints(true);
        for (let placing = 0; placing < (SCORES.length); placing++){
            
            const PLAYER_TO_SCORE_OBJ = SCORES[placing];
            const SCORE = PLAYER_TO_SCORE_OBJ.score;
            const PLAYER_UID = PLAYER_TO_SCORE_OBJ.player;
            const PLAYER_NAME = this.#players[PLAYER_UID].name;
            TERMINAL.printStr(`#${placing + 1}: ${PLAYER_NAME} @ ${SCORE} Points`);
        }
    }

    printElements() {
        REFERENCES[TERMINAL_INSTANCE].printElement(this.createElement("div", { id: "terminal-buttons-div" }));
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        REFERENCES[TERMINAL_INSTANCE].printElement(
            this.createElement('button', {
                id: HeartsRoundOverPage.#NEW_ROUND_BUTTON_ID,
                textContent: '[New Round]',
                onclick: async () => {
                    await this.resetGame();
                }
            }), "terminal-buttons-div");
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/flags/gameStarted`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                if (!_data) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_GAME_PAGE_CLASS_KEY]);
            }
        });
    }

    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    async resetGame() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PAGE_CLASS = REFERENCES[HEARTS_GAME_PAGE_CLASS_KEY];
        const CACHE = LOBBY.generateCache();
        const DECK = new Deck(...Card.TEMPLATES.map(_card => _card.id));
        const PLAYERS = (Object.values(LOBBY.getLobbyCache().players));
        const HANDS = Deck.assignHands(DECK.deal(
            PLAYERS.length,
            true,
            Utils.HEARTS_PRIORITY_REMOVAL_CARDS,
            Utils.HEARTS_PROTECTED_CARDS
        ).hands, PLAYERS);
        const LEADING_PLAYER = HeartsGamePage.find3Cubs(HANDS);
        const LEADING_PLAYER_INDEX = PLAYERS.indexOf(LEADING_PLAYER);
        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: LEADING_PLAYER,
            startIndex: LEADING_PLAYER_INDEX,
            flags: {
                gameStarted: true,
                lobbyOpen: false,
                heartsBroken: false
            },
            hands: HANDS
        }, () => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(PAGE_CLASS);
        })
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
        return HeartsRoundOverPage.ID;
    }
}