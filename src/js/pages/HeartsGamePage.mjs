import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    HEARTS_ROUND_OVER_PAGE_CLASS_KEY,
    HEARTS_MATCH_OVER_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Card from "../game/Card.mjs";
import Terminal from "../core/Terminal.mjs";

/*****************************************************************
 * HeartsGamePage.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * @extends Page
 * Description: 
 *  -> Provides MOST logic for Hearts game
 ****************************************************************/
export default class HeartsGamePage extends Page {
    static ID = 'hearts_game_page';
    static #TURN_TITLE = 'turn-title';
    static #HAND_LIST_ID = 'hand-list';
    static #PLAYED_CARDS_LIST_ID = 'played_cards_list';
    static #CLOSE_LOBBY_BUTTON_ID = 'close_lobby_button';
    static #SCORES_LIST_ID = 'scores_list;'
    #firebaseListeners;
    #players = {};

    /*****************************************************************
    * Description:
    *   -> Called when player clickes on a card
    *   -> Removes the card from their hand
    *   -> Checks if it should be considered the leading suit or as hearts broken
    *   -> Marks turn over
    * Params:
    *   -> '_card': ID of card played
    *****************************************************************/
    async playCard(_card) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const USER_UID = FBIO.authedUser().uid;
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_ID = LOBBY.getLobbyId();
        const CACHE = LOBBY.getLobbyCache();
        const FLAGS = CACHE.flags;
        if (!LOBBY.isMyTurn()) {
            alert('It Is Not Your Turn.');
            return;
        }
        this.displayHand(false);
        await FBIO.remove(`lobbies/${LOBBY_ID}/hands/${USER_UID}/${_card}`, async () => {
            const TRICK_DATA = await LOBBY.getTrickData();
            const CARD_TEMPLATE = Card.getTemplate(_card);
            if (!TRICK_DATA.playedCards) TRICK_DATA.playedCards = {};
            if (!TRICK_DATA.leadingSuit) TRICK_DATA.leadingSuit = CARD_TEMPLATE.suit;
            TRICK_DATA.playedCards[FBIO.authedUser().uid] = _card;
            await FBIO.update(`lobbies/${LOBBY_ID}`, {
                trickData: TRICK_DATA
            })
            if (!FLAGS.heartsBroken) {
                await FBIO.update(`lobbies/${LOBBY_ID}/flags`, {
                    heartsBroken: CARD_TEMPLATE.suit == 'hearts'
                })
            }
            await this.logAction(`${this.#players[USER_UID].name} Played ${_card}`);
            await this.markTurnOver();
        });
    }

    /*****************************************************************
    * Description:
    *   -> Either updates the turn to the next person in Firebase, or...
    *   -> Triggers the end of the trick
    *****************************************************************/
    async markTurnOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYERS = Object.values(CACHE.players);
        const NEXT_PLAYER = Utils.getNextElement(PLAYERS, PLAYERS.indexOf(CACHE.turn));
        const NEXT_PLAYER_INDEX = PLAYERS.indexOf(NEXT_PLAYER);
        const START_INDEX = CACHE.startIndex;
        if (NEXT_PLAYER_INDEX == START_INDEX) {
            await this.onTrickOver();
        } else {
            await FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
                turn: NEXT_PLAYER
            })
        }
    }

    /*****************************************************************
    * Description:
    *   -> Contains LOTS of logic around winning cards, players and points 
    *   -> But basically it computes a winning player from all the cards
    *   -> Then starts a new trick
    *   -> Checks for and can trigger end of round or match
    *****************************************************************/
    async onTrickOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const TRICK_DATA = LOBBY.getLobbyCache().trickData;
        const CACHE = LOBBY.getLobbyCache();
        const LOBBY_ID = LOBBY.getLobbyId();
        if (TRICK_DATA) {
            const PLAYED_CARDS_IDS = TRICK_DATA.playedCards;
            const LEADING_SUIT = TRICK_DATA.leadingSuit;
            const PLAYED_CARDS = [];
            for (const _card of Object.values(PLAYED_CARDS_IDS)) {
                const TEMPLATE = Card.getTemplate(_card);
                const CARD = Card.from(TEMPLATE);
                PLAYED_CARDS.push(CARD);
            }
            const PLAYERS = Object.values(CACHE.players);
            const WINNING_CARD = this.compareCards(LEADING_SUIT, ...Object.values(PLAYED_CARDS));
            const WINNING_PLAYER = await Utils.getKeyByValue(PLAYED_CARDS_IDS, WINNING_CARD.getId());
            const WINNING_PLAYER_NAME = this.#players[WINNING_PLAYER].name ?? "?";
            const WINNING_PLAYER_INDEX = PLAYERS.indexOf(WINNING_PLAYER);
            const GAINED_POINTS = await this.scorePoints(LOBBY, FBIO, WINNING_PLAYER, PLAYED_CARDS_IDS);
            await FBIO.remove(`lobbies/${LOBBY.getLobbyId()}/trickData`);
            await this.logAction(`${WINNING_PLAYER_NAME} Lost The Trick: Gained ${GAINED_POINTS} Points`);
            await this.logAction(`It is Now ${WINNING_PLAYER_NAME}'s Turn...`);
            await FBIO.update(`/lobbies/${LOBBY_ID}`, {
                startIndex: WINNING_PLAYER_INDEX,
                turn: WINNING_PLAYER
            }, () => {
                this.displayHand(LOBBY.isMyTurn());
                this.updateTurnIndicator();
            })
            await LOBBY.generateCache();
            if (this.shouldEndRound()) {
                LOBBY.markRoundOver(FBIO);
            } else if (await this.shouldEndMatch()) {
                this.endMatch();
            }
        }
    }

    /*****************************************************************
    * Description:
    *   -> Checks if the match should end
    *   -> If any player had >= 100 points the match is considered 'over'
    *****************************************************************/
    async shouldEndMatch() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const POINTS = await LOBBY.getPoints();
        let shouldEnd = false;
        for (const [_uid, _score] of Object.entries(POINTS)) {
            //if (!shouldEnd && _score >= 100) {
            if (!shouldEnd && _score >= 1) { // TODO: Change to 100 for real
                shouldEnd = true;
            }
        }
        return shouldEnd;
    }

    /*****************************************************************
    * Description:
    *   -> Updates flag 'matchOver' to true, this triggers a firebase listener
    *****************************************************************/
    async endMatch() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        FBIO.update(`/lobbies/${LOBBY.getLobbyId()}/flags`, {
            matchOver: true
        })
    }

    /*****************************************************************
    * Description:
    *   -> Checks if the round should be over
    *   -> If no hands are present in the firebase cache then the round 
    *      is over as no player have cards
    *****************************************************************/
    shouldEndRound() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const HANDS = LOBBY.getLobbyCache().hands;
        return HANDS == null;
    }

    /*****************************************************************
    * Description:
    *   -> Iterates through played cards, summing their points
    *   -> Writes the sum new points and the old points to the winning player
    * Params:
    *   -> '_lobby': The instance of LobbySession.mjs
    *   -> '_fbio': Instance of FirebaseIO.mjs
    *   -> '_winningPlayer': The player who won the trick
    *   -> '_playedCards': Obj of cards in the trick, mapped to players who played them
    *****************************************************************/
    async scorePoints(_lobby, _fbio, _winningPlayer, _playedCards) {
        let newPoints = 0;
        let oldPoints = (await _lobby.getPoints())[_winningPlayer] ?? 0;
        for (const [_player, _cardId] of Object.entries(_playedCards)) {
            const CARD = Card.from(Card.getTemplate(_cardId));
            if (CARD.getSuit() == 'hearts' || CARD.getId() == 'sq') {
                if (CARD.getId() == 'sq') {
                    newPoints += 13;
                } else {
                    newPoints += 1;
                }
            }
        }
        await _fbio.update(`lobbies/${_lobby.getLobbyId()}/points`, {
            [_winningPlayer]: (oldPoints + newPoints)
        });
        return newPoints;
    }


    /*****************************************************************
    * Description:
    *   -> Iterates through the played cards and finds the card of the highest value and is on-suit
    * Params:
    *   -> '_leadingSuit': The leading suit for the trick (the suit of the first played card)
    *   -> '..._cards': Arr of played cards, if passed as an arr you must us '...' to spread it first
    *****************************************************************/
    compareCards(_leadingSuit, ..._cards) {
        let topCard = null;
        _cards.forEach((_card) => {
            if (_card.getSuit() != _leadingSuit) return;

            if (!topCard || _card.getValue() > topCard.getValue()) {
                topCard = _card;
            }
        })
        return topCard;
    }

    /*****************************************************************
    * Description:
    *   -> Ran on the turn flag in Firebase changeing
    *   -> Re-renders hand (might have changed)
    *   -> updates the turn indicator
    *****************************************************************/
    async onTurnChange() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const MY_TURN = LOBBY.isMyTurn();
        this.displayHand(MY_TURN);
        document.getElementById('turn-indicator-text').textContent = (`${MY_TURN ? "" : "Not"} Your Turn`).trim();
        this.updateTurnIndicator();
    }

    /*****************************************************************
    * Description:
    *   -> Turn indicator is in top-left of page
    *   -> Tall bar = that player's turn
    *   -> Normal-sized bar = neutral/rest state
    *   -> Small bar = Person who started the trick
    *   -> This just marks each bar with its respective classes for styling
    *****************************************************************/
    async updateTurnIndicator() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYERS_LIST = Object.values(CACHE.players);
        const TURN = CACHE.turn;
        const CURRENT_INDEX = PLAYERS_LIST.indexOf(TURN);
        const START_INDEX = CACHE.startIndex;
        for (let i = 0; i < 4; i++) {
            const ELEMENT = document.getElementById(`player-${i}-turn-slot`);
            if (ELEMENT == null) continue;
            ELEMENT.classList.remove('current-slot', 'start-slot');
            if (i == CURRENT_INDEX) {
                ELEMENT.classList.add('current-slot');
                ELEMENT.classList.remove('normal-slot');
            } else if (i == START_INDEX) {
                ELEMENT.classList.add('start-slot');
                ELEMENT.classList.remove('normal-slot');
            } else {
                ELEMENT.classList.add('normal-slot');
            }
        }
    }

    /*****************************************************************
    * Description:
    *   -> Iterates through _hand, checking if any cards are onsuit with _leading
    * Params:
    *   - '_hand': You hand of cards
    *   - '_leading': Suit of the leading card
    *****************************************************************/
    canPlayOnsuit(_hand, _leading) {
        let val = false;
        _hand.forEach(_card => {
            const CARD = Card.getTemplate(_card);
            if (!val && CARD.suit == _leading) val = true;
        })
        return val;
    }

    /*****************************************************************
    * Description:
    *   -> Renders all cards in your hand
    *   -> First removes all, then stores many things in constants, such as
    *       -> the leading suit
    *       -> hearts broken?
    *       -> if you can play onSuit
    *       -> etc
    *   -> Iterates through your hand, rendering each card
    *       -> checks if the card is playeabe at the current time
    * Param:
    *   -> '_myTurn': Bool, Wether it is your turn or not
    *****************************************************************/
    async displayHand(_myTurn) {
        const LIST_ELEMENT = document.getElementById('card-grid');
        while (LIST_ELEMENT.firstChild) {
            LIST_ELEMENT.firstChild.remove();
        }
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache().hands ?? {};
        const HAND = Object.values(CACHE[FBIO.authedUser().uid] ?? {});
        const TRICK_DATA = await LOBBY.getTrickData();
        const LEADING_SUIT = TRICK_DATA.leadingSuit;
        const HAND_INCLUDES_C3 = HAND.includes('c3');
        const HEARTS_BROKEN = LOBBY.getLobbyCache().flags.heartsBroken ?? false;
        const ONLY_HEARTS = this.hasOneSuit(HAND, 'hearts');
        let canOnSuit = this.canPlayOnsuit(HAND, LEADING_SUIT);
        HAND.forEach(_card => {
            const CARD = Card.getTemplate(_card);
            const SUIT = CARD.suit;
            const CAN_PLAY = this.canPlayCard(CARD, SUIT, LEADING_SUIT, HAND_INCLUDES_C3, _myTurn, canOnSuit, HEARTS_BROKEN, ONLY_HEARTS);
            const ELEMENT = this.createElement('div', {
                textContent: _card,
                className: 'card',
                onclick: () => {
                    if (CAN_PLAY) this.playCard(_card)
                }
            });
            ELEMENT.classList.add(`${CAN_PLAY ? 'play' : 'unplay'}able-card`);
            LIST_ELEMENT.appendChild(ELEMENT);
        });
    }

    /*****************************************************************
    * Description:
    *   -> Checks if _hand contains ONLY cards of _suit
    * Params:
    *   -> '_hand': Hand of cards to check
    *   -> '_suit': Suit to check if hand contains only of
    *****************************************************************/
    hasOneSuit(_hand, _suit) {
        let val = true;
        _hand.forEach(_card => {
            if (!val) return;
            const CARD = Card.getTemplate(_card);
            if (CARD.suit != _suit) {
                val = false;
                return;
            }
        })
        return val;
    }

    /*****************************************************************
    * Description:
    *   -> Checks if _card is playable at the current time.... 
    *   -> This follows the rules of hearts, but effectivly you can play a card if its...
    *       -> Your turn
    *       -> If its c3 you HAVE to play it
    *       -> If you can play on-suit with _leadingSuit, you MUST
    *       -> you cann't play a heart unless hearts are broken, OR you haven nothing else
    *       -> etc
    * Params:
    *   -> '_card': Obj, Card in question
    *   -> '_suit': Str, Suit of card in question
    *   -> '_leadingSuit': Str, Leading suit (suit of first played card)
    *   -> '_hasC3': Bool, wether your hand contains the 3 of clubs
    *   -> '_myTurn': Bool, if it is your turn
    *   -> '_canPlayOnsuit': Bool, if you can play on-suit
    *   -> '_heartsBroken': Bool, if hearts have been broken (if a heart has been played before this round)
    *   -> '_onlyHearts': Bool, if your hand ONLY has hearts
    *****************************************************************/
    canPlayCard(_card, _suit, _leadingSuit, _hasC3, _myTurn, _canPlayOnsuit, _heartsBroken, _onlyHearts) {
        if (_myTurn) {
            if (_hasC3) {
                return _card.id == 'c3';
            } else {
                if (_leadingSuit != null && _leadingSuit != undefined) {
                    if (_canPlayOnsuit) {
                        let isOnSuit = _suit == _leadingSuit;
                        return isOnSuit;
                    } else {
                        return true;
                    }
                } else {
                    if (_onlyHearts) {
                        return true;
                    }
                    if (_heartsBroken) {
                        return true;
                    } else {
                        return _suit != 'hearts';
                    }
                }
            }
        } else {
            return false;
        }
    }

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
    *   -> Adds the txt in the notepad input to the notepad
    * Param:
    *   -> '_str', Str to add to the notepad
    *****************************************************************/
    addToNotepad(_str) {
        const OUTPUT_ELEMENT = document.getElementById("notepad-output");
        const NEW_LINE_ELEMENT = this.createElement('p', {
            className: 'notepad-line',
            textContent: _str
        });
        OUTPUT_ELEMENT.appendChild(NEW_LINE_ELEMENT)
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being displayed, in this instance it
    *       -> Sets up event listeners for HTML elements and Firebase
    *       -> Removes unneeded player turn indicator slots
    *****************************************************************/
    onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PLAYERS = Object.values(LOBBY.getLobbyCache().players);
        for (let i = 0; i < 4; i++) {
            const MAX_PLAYER_INDEX = PLAYERS.length - 1;
            const ELEMENT = document.getElementById(`player-${i}-turn-slot`);
            if (i > MAX_PLAYER_INDEX) {
                ELEMENT.remove()
                continue;
            };
            const PLAYER = this.#players[PLAYERS[i]];
            const NAME_ELEMENT = this.createElement('p', {
                textContent: PLAYER.name,
                className: 'player-slot-name'
            })
            ELEMENT.appendChild(NAME_ELEMENT);
        }
        document.getElementById("notepad-input").addEventListener('keyup', (_event) => {
            if (_event.key === 'Enter') {
                this.addToNotepad(document.getElementById("notepad-input").value);
                document.getElementById("notepad-input").value = '';
            }
        });
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}`]: async (_data) => {
                if (_data != null) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
                REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
            },
            [`lobbies/${LOBBY.getLobbyId()}/players`]: async (_data) => {
                if (_data == null || _data == undefined) return;
                const SELF_UID = FBIO.authedUser().uid;
                const OLD_CACHE = LOBBY.getLobbyCache();
                const OLD_PLAYERS_LIST = Object.values(OLD_CACHE.players);
                const OLD_LENGTH = OLD_PLAYERS_LIST.length;
                await LOBBY.generateCache();
                const NEW_CACHE = LOBBY.getLobbyCache();
                const NEW_PLAYERS_LIST = Object.values(NEW_CACHE.players)
                const NEW_LENGTH = NEW_PLAYERS_LIST.length;
                if (!NEW_PLAYERS_LIST.indexOf(SELF_UID) == 0) return;
                if (NEW_LENGTH < OLD_LENGTH) {
                    LOBBY.closeLobby();
                }
            },
            [`lobbies/${LOBBY.getLobbyId()}/turn`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                await this.onTurnChange();
            },
            [`lobbies/${LOBBY.getLobbyId()}/trickData/playedCards`]: async (_data) => {
                await LOBBY.generateCache();
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/roundOver`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null || !_data) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_ROUND_OVER_PAGE_CLASS_KEY]);
            },
            [`lobbies/${LOBBY.getLobbyId()}/points`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                this.displayScores();
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/matchOver`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null || _data == false) return;
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_MATCH_OVER_PAGE_CLASS_KEY]);
            },
            [`lobbies/${LOBBY.getLobbyId()}/logs`]: async (_data) => {
                await LOBBY.generateCache();
                this.buildLogs(_data);
            }
        });
    }

    /*****************************************************************
    * Description:
    *   -> Displays the score of each player next to their respective player slot
    *****************************************************************/
    async displayScores() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYER_LIST = Object.values(CACHE.players);
        const SCORES = await LOBBY.getPoints(true);
        document.querySelectorAll('.hearts-score').forEach(_element => _element.remove());
        for (let i = 0; i < 4; i++) {
            const SLOT_ELEMENT = document.getElementById(`player-${i}-turn-slot`);
            if (SLOT_ELEMENT == null || SLOT_ELEMENT == undefined) continue;
            const PLAYER = PLAYER_LIST[i];
            if (PLAYER == null || PLAYER == undefined) continue;
            const SCORE_ENTRY = SCORES.find(_entry => _entry.player == PLAYER);
            if (SCORE_ENTRY == null || SCORE_ENTRY == undefined) continue;
            const SCORE = SCORE_ENTRY.score;
            if (SCORE == null || SCORE == undefined) continue;
            const SCORE_ELEMENT = this.createElement('p', {
                textContent: `${SCORE} Points`,
                className: 'hearts-score'
            })
            SLOT_ELEMENT.appendChild(SCORE_ELEMENT);
        }
    }

    /*****************************************************************
    * Description:
    *   -> Writes to firebase that the round is over, this triggers a firebase listener
    *****************************************************************/
    async writeRoundOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        FBIO.update(`/lobbies/${LOBBY.getLobbyId()}/flags`, {
            gameStarted: false
        });
    }

    /*****************************************************************
    * Description:
    *   -> Runs Code on the page being removed, in this instance it
    *       -> Unregisters firebase listeners
    *****************************************************************/
    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    /*****************************************************************
    * Description:
    *   -> Iterates through each player's hands, trying to find who has the 3 of clubs
    *   -> C3 Starts the game
    * Params:
    *   -> '_hands': ALL player hands
    *****************************************************************/
    static find3Cubs(_hands) {
        let returnVal = null;
        for (const [_player, _hand] of Object.entries(_hands)) {
            const CARD_IDS = Object.values(_hand);
            if (CARD_IDS.includes('c3')) {
                returnVal = _player
            }
        }
        return returnVal;
    }

    /*****************************************************************
    * Description:
    *   -> Removes old logs, then adds new ones from _data
    * Params:
    *   -> '_data': Obj containing new logs
    *****************************************************************/
    buildLogs(_data) {
        const PARENT_ELEMENT = document.getElementById('action-log-output');
        while (PARENT_ELEMENT.lastChild) {
            PARENT_ELEMENT.lastChild.remove();
        }
        Object.values(_data ?? {}).forEach(_log => {
            const LOG_ELEMENT = this.createElement('p', {
                className: 'action-log-entry',
                textContent: `> ${_log}`
            })
            PARENT_ELEMENT.appendChild(LOG_ELEMENT);
        })
    }

    /*****************************************************************
    * Description:
    *   -> Checks how many logs are allowed, and how many already exist
    *   -> Pushes new log to arr of logs
    *   -> Removes old logs till at max capacity
    *   -> Updates Firebase with new Arr
    * Params:
    *   -> '_str': Str log of an action which occured
    *****************************************************************/
    async logAction(_str) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_ID = LOBBY.getLobbyId();
        const PLAYER_COUNT = (LOBBY.getLobbyCache().players ?? []).length;
        const MIN_LOGS = 4;
        const ALLOWED_LOGS = Math.max(PLAYER_COUNT + 1, MIN_LOGS);
        const LOGS = Object.values(await FBIO.read(`lobbies/${LOBBY_ID}/logs`) ?? {});
        LOGS.push(_str);
        while (LOGS.length > ALLOWED_LOGS) {
            LOGS.shift();
        }
        await FBIO.update(`lobbies/${LOBBY_ID}`, {
            logs: LOGS
        });
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
                this.createElement('div', { className: 'terminal-row-container' }, [
                    this.createElement('div', { className: 'top-row' }, [
                        this.createElement('div', { className: 'lhs' }, [
                            this.createElement('div', { className: 'player-slots' }, [
                                this.createElement('div', {
                                    className: 'player-slot',
                                    id: 'player-0-turn-slot'
                                }, [
                                    this.createElement('div', {
                                        className: 'player-slot-bar'
                                    })
                                ]),
                                this.createElement('div', {
                                    className: 'player-slot',
                                    id: 'player-1-turn-slot'
                                }, [
                                    this.createElement('div', {
                                        className: 'player-slot-bar'
                                    })
                                ]),
                                this.createElement('div', {
                                    className: 'player-slot',
                                    id: 'player-2-turn-slot'
                                }, [
                                    this.createElement('div', {
                                        className: 'player-slot-bar'
                                    })
                                ]),
                                this.createElement('div', {
                                    className: 'player-slot',
                                    id: 'player-3-turn-slot'
                                }, [
                                    this.createElement('div', {
                                        className: 'player-slot-bar'
                                    })
                                ]),
                            ])
                        ]),
                        this.createElement('div', { className: 'cent' }, [
                            this.createElement('div', { className: 'turn-indicator-container' }, [
                                this.createElement('h1', { id: 'turn-indicator-text' })
                            ]),
                            this.createElement('div', {
                                id: "action-log-output"
                            })
                        ]),
                        this.createElement('div', { className: 'rhs' }, [
                            this.createElement('div', { className: "chat-container" }, [
                                this.createElement('h1', { className: "chat-title", textContent: "Instructions" }),
                                this.createElement('div', { className: "chat-content" })
                            ]),
                        ])
                    ]),
                    this.createElement('div', { className: 'bottom-row' }, [
                        this.createElement('div', { className: 'lhs' }, [
                            this.createElement("div", {
                                className: 'notepad-container'
                            }, [
                                this.createElement('h4', { className: 'notepad-title', textContent: "Notepad" }),
                                this.createElement('div', { id: "notepad-output", id: "notepad-output" }),
                                this.createElement('span', { textContent: "> " }, [
                                    this.createElement('input', { className: "notepad-input", id: "notepad-input" })
                                ])
                            ]),
                        ]),
                        this.createElement('div', { className: 'rhs' }, [
                            this.createElement('div', { id: 'card-grid' }, [
                                this.createElement('div', { className: 'card' }, [
                                    this.createElement('p', { textContent: 'Card' })
                                ]),
                                this.createElement('div', { className: 'card' }, [
                                    this.createElement('p', { textContent: 'Card' })
                                ]),
                                this.createElement('div', { className: 'card' }, [
                                    this.createElement('p', { textContent: 'Card' })
                                ]),
                                this.createElement('div', { className: 'card' }, [
                                    this.createElement('p', { textContent: 'Card' })
                                ])
                            ])
                        ]),
                    ])
                ]),
            ]),
        ])
    }

    /*****************************************************************
    * Description:
    *   -> Returns a string ID of the page
    *****************************************************************/
    getId() {
        return HeartsGamePage.ID;
    }
}