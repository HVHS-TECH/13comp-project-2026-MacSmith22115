// Imports
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
 * Last Edited: 2/3/26
 * @extends Page
 * Description: 
 *  -> Acts as a lobby browser for 'Hearts'
 *  -> Either join or create a lobby
 ****************************************************************/
export default class HeartsLobbyBrowserPage extends Page {
    static ID = "hearts_lobby_browser_page";
    static #CREATE_LOBBY_BUTTON_ID = "create-lobby-button";
    static #ACTIVE_LOBBY_LIST_ID = 'active-lobby-list';
    #fbListeners;
    #lobbyListVersion = 0;  
    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Initalization Code on the page being displayed
    *   -> Used to assign onclicks to buttons, and fill out the list of lobbies.
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        document.getElementById(HeartsLobbyBrowserPage.#CREATE_LOBBY_BUTTON_ID).onclick = async () => {
            const LOBBY_SESSION = new LobbySession();
            LOBBY_SESSION.createLobby(() => {
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY]);
            });
        };
        this.#fbListeners = FBIO.registerListeners({
            [`lobbies`]: async () => {
                this.buildServerList();
            },
            ['scoreboard']: async () => {
                this.buildLeaderboard();
            }
        })
    }

    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#fbListeners);
    }

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
                if (_serverData.players == null){
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

    async getUserDetails(_uid) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const RESULT = await FBIO.read(`users/${_uid}/public`);
        return RESULT;
    }

    /*****************************************************************
    * getHTML();
    * Description:
    *   -> Returns a string containing HTML tags
    * Params: N/A
    * Returns: String of HTML tags
    * Throws: N/A
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
                        }),
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
    * getId();
    * Description:
    *   -> Returns a string ID of the page
    * Params: N/A
    * Returns: String ID
    * Throws: N/A
    *****************************************************************/
    getId() {
        return HeartsLobbyBrowserPage.ID;
    }
}
