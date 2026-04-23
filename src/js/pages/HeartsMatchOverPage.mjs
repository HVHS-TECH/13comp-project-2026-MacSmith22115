import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    HEARTS_GAME_PAGE_CLASS_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Deck from "../game/Deck.mjs";
import Card from "../game/Card.mjs";

export default class HeartsMatchOverPage extends Page {
    static #ID;
    static #HTML_TITLE_ID = 'main_title';
    static #HTML_HOMEPAGE_BUTTON_ID = 'homepage_btn';
    static #HTML_LOBBY_BUTTON_ID = 'lobby_btn';
    #firebaseListeners;

    onDisplay(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}`]: async (_data) => {
                if (_data != null) return;
                REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            },
        });
    }

    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    async backToLobby(){

    }

    async backToHomepage(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
        await LOBBY.closeLobby();
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                textContent: "Match Over!",
                id: HeartsMatchOverPage.#HTML_TITLE_ID
            }),
            this.createElement('button', {
                id: HeartsMatchOverPage.#HTML_HOMEPAGE_BUTTON_ID,
                textContent: "To Homepage (Dispand Lobby)",
                onclick: async () => await this.backToHomepage()
            }),
            this.createElement('button', {
                id: HeartsMatchOverPage.#HTML_LOBBY_BUTTON_ID,
                textContent: "To Lobby (New Game)",
                onclick: async () => await this.backToLobby()
            })
        ])
    }

    getId(){
        return HeartsMatchOverPage.#ID;
    }
}