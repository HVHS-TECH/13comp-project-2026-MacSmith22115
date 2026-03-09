import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

export default class HeartsGamePage extends Page {
    static #ID = 'hearts-game-page';
    static #PLAY_CARD_BUTTON_ID = 'play-card-button';
    static #TURN_TITLE = 'turn-title';
    static #CARDS_LIST_ID = 'cards-list';
    #firebaseListeners;

    playCard(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (!LOBBY.isMyTurn()){
            alert('It Is Not Your Turn.');
            return;
        }
        this.markTurnOver();
    }

    markTurnOver(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PLAYERS = Object.values(LOBBY.getLobbyCache().players);
        const NEXT_PLAYER = Utils.getNextElement(PLAYERS, PLAYERS.indexOf(LOBBY.getLobbyCache().turn));

        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: NEXT_PLAYER
        });
    }

    onTurnChange(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        document.getElementById(HeartsGamePage.#TURN_TITLE).textContent = 
            `It ${LOBBY.isMyTurn() ? "Is" : "Isn't"} My Turn`
    }

    onDisplay(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const HAND = Object.values(LOBBY.getLobbyCache().hands[FBIO.authedUser().uid]);
        const LIST_ELEMENT = document.getElementById(HeartsGamePage.#CARDS_LIST_ID);
        HAND.forEach(_card => {
            LIST_ELEMENT.appendChild(this.createElement('li', {
                textContent: _card
            }))
        });

        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/turn`] : async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                this.onTurnChange();
            }
        });

        document.getElementById(HeartsGamePage.#PLAY_CARD_BUTTON_ID).onclick = () => {
            this.playCard();
        }
    }

    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('button', {
                id: HeartsGamePage.#PLAY_CARD_BUTTON_ID,
                textContent: 'Play Card'
            }),
            this.createElement('h1', {
                id: HeartsGamePage.#TURN_TITLE
            }),
            this.createElement('ul', {
                id: HeartsGamePage.#CARDS_LIST_ID
            })
        ])
    }

    getId(){
        return HeartsGamePage.#ID;
    }
}