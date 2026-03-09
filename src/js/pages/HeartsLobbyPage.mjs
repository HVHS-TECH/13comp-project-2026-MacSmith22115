// Imports
import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    HEARTS_GAME_PAGE_CLASS_KEY,
    PAGE_MANAGER_INSTANCE_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import HeartsGamePage from "./HeartsGamePage.mjs";
import Deck from "../game/Deck.mjs";


/*****************************************************************
 * HeartsLobbyPage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 7/3/26
 * @extends Page
 * Description: 
 *  -> Acts as an intermediatry page between the lobby browser and game of 'Hearts
 ****************************************************************/
export default class HeartsLobbyPage extends Page{
    static #ID = 'hearts_lobby';
    static #PLAYERS_LIST_ID = 'players_list'; 
    static #START_GAME_BUTTON_ID = 'start_game_button';
    #firebaseListeners;

    writeGameLobby(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const DECK = new Deck(...[1, 2, 3, 4, 5, 6, 7, 8,]);
        const PLAYERS = (Object.values(LOBBY.getLobbyCache().players));
        const HANDS = this.assignHands(DECK.deal(PLAYERS.length, true).hands, PLAYERS);
        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: FBIO.authedUser().uid,
            flags: {
                gameStarted: true,
                lobbyOpen: false
            },
            hands: HANDS
        })
    }

    assignHands(_hands, _players){
         if (_hands.length != _players.length){
             throw new Error(`Player-Hand Count Missmatch`);
        }
        const RESULT = {};
        _hands.forEach(_hand => {
            const INDEX = _hands.indexOf(_hand);
            const PLAYER = _players[INDEX];
            RESULT[PLAYER] = _hand;
        })
        return RESULT;
    }

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay(){
        document.getElementById(HeartsLobbyPage.#START_GAME_BUTTON_ID).onclick = () => {
            this.writeGameLobby();
        }
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (!LOBBY) return;
        this.#firebaseListeners = REFERENCES[FIREBASE_IO_INSTANCE_KEY].registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/players`]: async (_data) => {
                await LOBBY.generateCache();
                if (!_data) return;
                this.fillTable();
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/gameStarted`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                if (!_data) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(HeartsGamePage);
            }
        })
    }

    /*****************************************************************
    * onRemove();
    * Description:
    *   -> Runs Code when the page is removed, use to unregister things.
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    /*****************************************************************
    * fillTable();
    * Description:
    *   -> Dynamicalls Fills out a list of players
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async fillTable(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY_SESSION = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        if (LOBBY_SESSION != null){
            const LOBBY_UID = LOBBY_SESSION.getLobbyId();
            const LOBBY = await FBIO.read(`lobbies/${LOBBY_UID}`);
            if (LOBBY != null){
                const LIST = document.getElementById(HeartsLobbyPage.#PLAYERS_LIST_ID);
                while (LIST.lastChild){
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
    * getHTML();
    * Description:
    *   -> Returns a string containing HTML tags
    * Params: N/A
    * Returns: String of HTML tags
    * Throws: N/A
    *****************************************************************/
    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: 'title',
                textContent: 'You Are In A Lobby'
            }),
            this.createElement('ul', {
                id: HeartsLobbyPage.#PLAYERS_LIST_ID
            }),
            this.createElement('button', {
                id: HeartsLobbyPage.#START_GAME_BUTTON_ID,
                textContent: 'Start Game'
            })
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
    getId(){
        return HeartsLobbyPage.#ID;
    }
}