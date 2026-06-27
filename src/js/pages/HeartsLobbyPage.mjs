import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    HEARTS_GAME_PAGE_CLASS_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import HeartsGamePage from "./HeartsGamePage.mjs";
import Deck from "../game/Deck.mjs";
import Card from "../game/Card.mjs";
import Terminal from "../core/Terminal.mjs";


/*****************************************************************
 * HeartsLobbyPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * @extends Page
 * Description: 
 *  -> Acts as an intermediatry page between the lobby browser and game of 'Hearts
 ****************************************************************/
export default class HeartsLobbyPage extends Page {
    static ID = 'hearts_lobby_page';
    static #PLAYERS_LIST_ID = 'players_list';
    static #START_GAME_BUTTON_ID = 'start_game_button';
    #firebaseListeners;
    #players = {};

    /*****************************************************************
    * Description:
    *   -> Runs Code BEFORE the page is displayed
    *   -> In this instance the following is done:
    *       -> Lobby Cache is generated
    *       -> Player public records are read for each player in the lobby
    *****************************************************************/
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

    /*****************************************************************
    * Description:
    *   -> Reads the cached player and pushes them all to an array before returning it
    *****************************************************************/
    async readPlayersDetails() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const PLAYERS = [];
        Object.values(this.#players ?? {}).forEach(_player => PLAYERS.push(_player));
        return PLAYERS;
    }

    /*****************************************************************
    * Description:
    *   -> Writes more data to Firebase which is required to the game to function
    *   -> Called once all players are ready
    *   -> Inlcudes dealing of hands, turns, etc
    *****************************************************************/
    writeGameLobby() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const DECK = new Deck(...Card.TEMPLATES.map(_card => _card.id));
        const PLAYERS = (Object.values(LOBBY.getLobbyCache().players));
        const HANDS = Deck.assignHands(DECK.deal(
            PLAYERS.length,
            true,
            Utils.HEARTS_PRIORITY_REMOVAL_CARDS,
            Utils.HEARTS_PROTECTED_CARDS
        ).hands, PLAYERS);
        const LEADING_PLAYER = HeartsGamePage.find3Cubs(HANDS);
        const START_INDEX = PLAYERS.indexOf(LEADING_PLAYER);
        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: LEADING_PLAYER,
            startIndex: START_INDEX,
            flags: {
                gameStarted: true,
                lobbyOpen: false,
                heartsBroken: false,
            },
            hands: HANDS
        })
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being displayed, in this instance it
    *       -> Registers Firebase listeners,
    *       -> Registers terminal instace
    *****************************************************************/
    onDisplay() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (!LOBBY) return;
        this.#firebaseListeners = REFERENCES[FIREBASE_IO_INSTANCE_KEY].registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/players`]: async (_data) => {
                await LOBBY.generateCache();
                if (!_data) return;
                await this.updateIndexs();
                this.renderSlots();
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/gameStarted`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                if (!_data) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(HeartsGamePage);
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/ready`]: async (_data) => {
                await LOBBY.generateCache();
                this.markPlayersReady(_data);
                this.quearyStartGame();
            }
        });
        const INPUT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const OUTPUT = document.getElementById(Terminal.TERMINAL_OUTPUT_ELEMENT_ID);
        REFERENCES[TERMINAL_INSTANCE] = new Terminal(INPUT, OUTPUT);
        REFERENCES[TERMINAL_INSTANCE].printStr("Game Selected: Hearts");
        REFERENCES[TERMINAL_INSTANCE].printStr("Enter 'hearts readyup' to mark as ready'");
        REFERENCES[TERMINAL_INSTANCE].printStr("Game Will Start Once All Ready");
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
    *   -> Updates Player indexes upon a player leavind
    *   -> If player #2 of #4 leaves, this moved indexs 3-4 DOWN one to fill the gap
    *****************************************************************/
    async updateIndexs() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_ID = LOBBY.getLobbyId();
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYER_LIST = Object.values(CACHE.players);
        const SELF_UID = FBIO.authedUser().uid;
        const SELF_INXED = PLAYER_LIST.indexOf(SELF_UID);
        if (SELF_INXED != 0) return;
        FBIO.update(`lobbies/${LOBBY_ID}`, {
            players: PLAYER_LIST
        });

    }

    /*****************************************************************
    * Description:
    *   -> Checks if the game should be started
    *   -> ALL player need to be ready
    *****************************************************************/
    async quearyStartGame() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYERS_LIST = Object.values(CACHE.players);
        const LOBBY_FLAGS = CACHE.flags;
        const READY_LIST = Object.keys(LOBBY_FLAGS.ready ?? {});
        let shouldStart = true;
        PLAYERS_LIST.forEach(_player => {
            if (shouldStart && !READY_LIST.includes(_player)) {
                shouldStart = false;
            }
        })
        if (shouldStart) {
            this.writeGameLobby();
        }
    }

    /*****************************************************************
    * Description:
    *   -> On your client, Reads all player who are ready and renders them as such
    * Params:
    *   -> '_data': Object containing players who are maked as ready
    *****************************************************************/
    async markPlayersReady(_data) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY_SESSION = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (LOBBY_SESSION == null) return;
        const LOBBY_ID = LOBBY_SESSION.getLobbyId();
        const PLAYERS_LIST = Object.values(await FBIO.read(`lobbies/${LOBBY_ID}/players`));
        document.querySelectorAll('.player-ready').forEach(_element => _element.remove());
        if (!_data) return;
        Object.keys(_data).forEach(_uid => {
            const INDEX = PLAYERS_LIST.indexOf(_uid);
            document.getElementById(`player-${INDEX}-slot`).appendChild(this.createElement(
                'p',
                { textContent: 'Ready', classList: 'player-ready' }
            ));
        })
    }

    /*****************************************************************
    * Description:
    *   -> Renders the player slots which sit in the top-right of the page
    *   -> Slots display player who are in the lobby
    *****************************************************************/
    async renderSlots() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY_SESSION = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (LOBBY_SESSION == null) return;
        const LOBBY_ID = LOBBY_SESSION.getLobbyId();
        const READ_RESULT = await FBIO.read(`lobbies/${LOBBY_ID}`);
        if (READ_RESULT == null) return;
        const PLAYERS = await this.readPlayersDetails();
        for (let i = 0; i < 4; i++) {
            const SLOT = document.getElementById(`player-${i}-slot`);
            if (!SLOT) continue;
            SLOT.classList.remove('unfilled-player-slot', 'filled-player-slot');
            while (SLOT.lastChild) {
                SLOT.lastChild.remove();
            }
            if (i > (PLAYERS.length - 1)) {
                SLOT.classList.add('unfilled-player-slot');
                continue;
            }
            const PLAYER = PLAYERS[i];
            const NAME_ELEMENT = this.createElement('p', { textContent: PLAYER.name });
            SLOT.classList.add('filled-player-slot');
            SLOT.appendChild(NAME_ELEMENT);
        }
    }

    /*****************************************************************
    * Description:
    *   -> Fills out a list of players in the lobby
    *****************************************************************/
    async fillTable() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY_SESSION = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (LOBBY_SESSION != null) {
            const LOBBY_UID = LOBBY_SESSION.getLobbyId();
            const LOBBY = await FBIO.read(`lobbies/${LOBBY_UID}`);
            if (LOBBY != null) {
                const LIST = document.getElementById(HeartsLobbyPage.#PLAYERS_LIST_ID);
                while (LIST.lastChild) {
                    LIST.lastChild.remove();
                }
                Object.values(LOBBY.players).forEach((_uid) => {
                    LIST.appendChild(this.createElement('li', {
                        textContent: _uid
                    }));
                })
            }
        }
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code when the page is removed, use to unregister things.
    *       -> In this instance it unregisteres the terminal and firebase listeners
    *****************************************************************/
    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
        REFERENCES[TERMINAL_INSTANCE].unregisterKeydownListener();
        REFERENCES[TERMINAL_INSTANCE] = null;
    }

    /*****************************************************************
    * Description:
    *   -> creates the html elements required for the page
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
                this.createElement('div', { className: 'terminal-column-container' }, [
                    this.createElement('div', { className: 'terminal-lhs' }, [
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
                    ]),
                    this.createElement('div', { className: 'terminal-rhs' }, [
                        this.createElement('div', { className: 'player-slots-container' }, [
                            this.createElement('div', {
                                className: 'player-slot',
                                id: 'player-0-slot'
                            }),
                            this.createElement('div', {
                                className: 'player-slot',
                                id: 'player-1-slot',
                            }),
                            this.createElement('div', {
                                className: 'player-slot',
                                id: "player-2-slot"
                            }),
                            this.createElement('div', {
                                className: 'player-slot',
                                id: 'player-3-slot'
                            })
                        ]),
                        this.createElement('div', { className: 'gamerules-container' }, [

                        ])
                    ]),
                ]),
            ])
        ])
    }

    /*****************************************************************
    * Description:
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return HeartsLobbyPage.ID;
    }
}