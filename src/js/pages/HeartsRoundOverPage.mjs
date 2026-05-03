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
import HeartsGamePage from "./HeartsGamePage.mjs";

export default class HeartsRoundOverPage extends Page {
    static #ID = "hearts-round-over-page";
    static #TITLE_ID = 'main-title';
    static #NEW_ROUND_BUTTON_ID = 'new-round-button';
    #firebaseListeners;


    onDisplay(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/flags/gameStarted`] : async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                if (!_data) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_GAME_PAGE_CLASS_KEY]);
            }
        });
    }

    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    async resetGame(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PAGE_CLASS = REFERENCES[HEARTS_GAME_PAGE_CLASS_KEY];
        const CACHE = LOBBY.generateCache();
        const DECK = new Deck(...Card.TEMPLATES.map(_card => _card.id));
        const PLAYERS = (Object.values(LOBBY.getLobbyCache().players));
        const HANDS = Deck.assignHands(DECK.deal(PLAYERS.length, true).hands, PLAYERS);
        const LEADING_PLAYER = HeartsGamePage.find3Cubs(HANDS);
        const LEADING_PLAYER_INDEX = PLAYERS.indexOf(LEADING_PLAYER);

        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: LEADING_PLAYER,
            startIndex: LEADING_PLAYER_INDEX,
            flags: {
                gameStarted: true,
                lobbyOpen: false
            },
            hands: HANDS
        }, () => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(PAGE_CLASS);
        })
    }


    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: HeartsRoundOverPage.#TITLE_ID,
                textContent: "Round Over!"
            }),
            this.createElement('button', {
                id: HeartsRoundOverPage.#NEW_ROUND_BUTTON_ID,
                textContent: 'New Round',
                onclick: async () => {
                    await this.resetGame();
                }
            })
        ])
    }

    getId(){
        return HeartsRoundOverPage.#ID;
    }
}