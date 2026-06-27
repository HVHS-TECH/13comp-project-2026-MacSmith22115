import Page from "./Page.mjs";
import {
    REFERENCES,
    PAGE_MANAGER_INSTANCE_KEY,
    HEARTS_LOBBY_PAGE_CLASS_KEY,
    FIREBASE_IO_INSTANCE_KEY
} from "../core/ReferenceStorage.mjs";
import LobbySession from "../game/LobbySession.mjs";

/*****************************************************************
 * HeartsLobbyBrowserPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * @extends Page
 * Description: 
 *  -> Acts as a lobby browser for 'Hearts'
 *  -> Either join or create a lobby
 ****************************************************************/
export default class HeartsLobbyBrowserPage extends Page {
    static ID = "hearts_lobby_browser_page";
    static #CREATE_LOBBY_BUTTON_ID = "create-lobby-button";
    static #ACTIVE_LOBBY_LIST_ID = 'active-lobby-list';
    #fbListeners; // Firebase event listeners, refrence stored for removal upon page removal
    #lobbyListVersion = 0; // Prevents race condition

    /*****************************************************************
    * Description:
    *   -> Runs Initalization Code on the page being displayed
    *   -> In this instance the following is done:
    *       -> Event listeners are registered to the DB to build the server list and leaderboard
    *****************************************************************/
    async onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        this.#fbListeners = FBIO.registerListeners({
            [`lobbies`]: async () => {
                this.buildServerList();
            },
            ['scoreboard']: async () => {
                this.buildLeaderboard();
            }
        })
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being removed (not displayed)
    *   -> In this instance the following is done:
    *       -> DB listeners are unregistered.
    *****************************************************************/
    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#fbListeners);
    }

    /*****************************************************************
    * Description:
    *   -> Reads the server list from DB
    *   -> Removes All servers without players
    *   -> Itterates through remaining servers, for each one:
    *       -> Check if 
    *****************************************************************/
    async buildServerList() {
        const VERSION = ++this.#lobbyListVersion;
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY_LIST = document.getElementById(HeartsLobbyBrowserPage.#ACTIVE_LOBBY_LIST_ID);
        while (LOBBY_LIST.lastChild) {
            LOBBY_LIST.lastChild.remove();
        }
        const SERVERS = await FBIO.read(`/lobbies`);
        if (VERSION !== this.#lobbyListVersion) return;
        if (SERVERS != null) {
            for (const [_serverId, _serverData] of Object.entries(SERVERS)) {
                if (_serverData.players == null) {
                    await FBIO.remove(`lobbies/${_serverId}`)
                    continue;
                }
                const FLAGS = _serverData.flags ?? {};
                if (!FLAGS.lobbyOpen) continue;
                const SERVER_HOST_UID = _serverData.players[0];
                const HOST_DATA = await FBIO.read(`users/${SERVER_HOST_UID}/public`);
                if (VERSION !== this.#lobbyListVersion) return;
                const WRAPPER_DIV = this.createElement('div', { className: "server-entry" }, [
                    this.createElement('img', { src: HOST_DATA.pfp }),
                    this.createElement('p', { textContent: HOST_DATA.name }),
                    this.createElement('button', {
                        textContent: "[Join]",
                        onclick: async () => {
                            const LOBBY_SESSION = new LobbySession();
                            LOBBY_SESSION.joinLobby(_serverId, () => {
                                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY]);
                            })
                        }
                    })
                ]);
                LOBBY_LIST.appendChild(WRAPPER_DIV);
            }
        }
    }

    /*****************************************************************
    * Description:
    *   -> Removes all current leaderboard entries
    *   -> Then reads the database for scores
    *   -> Then iterates through that and builds the leaderboard
    *****************************************************************/
    async buildLeaderboard() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LEADERBOARD_READ = await FBIO.read('scoreboard/hearts') ?? {};
        const PLAYERS = Object.keys(LEADERBOARD_READ);
        const PARENT_ELEMENT = document.getElementById('leaderboard-col');

        document.querySelectorAll('.leaderboard-entry').forEach(_entry => _entry.remove())
        for (const [_uid, _score] of Object.entries(LEADERBOARD_READ)) {
            const USER = await this.getUserDetails(_uid);
            const SCORE_ELEMENT = this.createElement('p', {
                textContent: `${USER.name} : ${_score}`,
                className: 'leaderboard-entry'
            })
            PARENT_ELEMENT.appendChild(SCORE_ELEMENT);
        }

    }

    /*****************************************************************
    * Description:
    *   -> Reads the public data for the user associated with _uid
    * Params:
    *   -> '_uid': UID of user to get details of.
    *****************************************************************/
    async getUserDetails(_uid) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const RESULT = await FBIO.read(`users/${_uid}/public`);
        return RESULT;
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
                this.createElement("div", {
                    className: "col"
                }, [
                    this.createElement("h3", {
                        textContent: "Join A Lobby:",
                        className: "join-lobby-title"
                    }),
                    this.createElement("div", {
                        className: "join-lobby-div"
                    }, [
                        this.createElement('ul', {
                            id: HeartsLobbyBrowserPage.#ACTIVE_LOBBY_LIST_ID
                        })
                    ]),
                    this.createElement("div", {
                        className: "create-lobby-div"
                    }, [
                        this.createElement('h3', { textContent: "Or" }),
                        this.createElement("button", {
                            id: HeartsLobbyBrowserPage.#CREATE_LOBBY_BUTTON_ID,
                            textContent: "[Create Lobby]",
                            onclick: async () => {
                                const LOBBY_SESSION = new LobbySession();
                                LOBBY_SESSION.createLobby(() => {
                                    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY]);
                                });
                            }
                        })
                    ]),
                ]),
                this.createElement("div", {
                    className: "col"
                }, [
                    this.createElement("h1", {
                        id: 'title',
                        textContent: "Hearts Lobby Browser",
                    })
                ]),
                this.createElement("div", {
                    className: "col",
                    id: 'leaderboard-col'
                }, [
                    this.createElement("h1", { textContent: "Leaderboard:" })
                ]),
            ])
        ])
    }

    /*****************************************************************
    * Description:
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return HeartsLobbyBrowserPage.ID;
    }
}
