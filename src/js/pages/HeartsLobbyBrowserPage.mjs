import Page from "./Page.mjs";
import {
    REFERENCES,
    PAGE_MANAGER_INSTANCE_KEY,
    FIREBASE_IO_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    REGISTRATION_PAGE_CLASS_KEY,
} from "../core/ReferenceStorage.mjs";

export default class HeartsLobbyBrowserPage extends Page {
    static #ID = "hearts_lobby";
    static #CREATE_LOBBY_BUTTON_ID = "create-lobby-button";
    #serverId = null;
    #serverCache = null;

    #createServer() {
        const SERVER_UID = crypto.randomUUID();
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const PLAYER_UID = FBIO.authedUser();
        FBIO.update(
            `servers`,
            {
                [SERVER_UID]: {
                    players: [PLAYER_UID],
                    turn: PLAYER_UID,
                },
            },
            () => {
                this.#cacheServer();
            },
        );
    }

    #joinServer(_serverId) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const SERVER = FBIO.read(`servers/${_serverId}`);
    }

    async #cacheServer() {
        if (this.#serverId != null) {
            this.#serverCache = await REFERENCES[FIREBASE_IO_INSTANCE_KEY].read(
                `servers/${this.#serverId}`,
            );
        }
    }

    onDisplay() {
        document.getElementById(
            HeartsLobbyBrowserPage.#CREATE_LOBBY_BUTTON_ID,
        ).onclick = () => {};
    }

    getHTML() {
        return this.createElement("div", {}, [
            this.createElement("h1", {
                id: title,
                textContent: "Hearts Lobby Browser",
            }),
            this.createElement("button", {
                id: HeartsLobbyBrowserPage.#CREATE_LOBBY_BUTTON_ID,
                textContent: "Create Lobby",
            }),
        ]);
    }

    getId() {
        return HeartsLobbyBrowserPage.#ID;
    }
}
