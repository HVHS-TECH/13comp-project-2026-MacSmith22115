// Imports
import Page from "./Page.mjs";
import {
    REFERENCES,
    PAGE_MANAGER_INSTANCE_KEY,
    HEARTS_LOBBY_PAGE_CLASS_KEY
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
    static #ID = "hearts_lobby";
    static #CREATE_LOBBY_BUTTON_ID = "create-lobby-button";
    static #JOIN_LOBBY_BUTTON_ID = 'join-lobby-button';

    /*****************************************************************
    * onDisplay();
    * Description:
    *   -> Runs Code on the page being displayed
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    onDisplay() {
        document.getElementById(HeartsLobbyBrowserPage.#CREATE_LOBBY_BUTTON_ID).onclick = async () => {
            const LOBBY_SESSION = new LobbySession();
            LOBBY_SESSION.createLobby(() => {
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY]);
            });
        };
        document.getElementById(HeartsLobbyBrowserPage.#JOIN_LOBBY_BUTTON_ID).onclick = async () => {
            const LOBBY_SESSION = new LobbySession();
            const LOBBY_UID = prompt('Enter Target Lobby Id');
            LOBBY_SESSION.joinLobby(LOBBY_UID, () => {
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_LOBBY_PAGE_CLASS_KEY]);
            })
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
            this.createElement("button", {
                id: HeartsLobbyBrowserPage.#JOIN_LOBBY_BUTTON_ID,
                textContent: 'Join Lobby'
            })
        ]);
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
        return HeartsLobbyBrowserPage.#ID;
    }
}
