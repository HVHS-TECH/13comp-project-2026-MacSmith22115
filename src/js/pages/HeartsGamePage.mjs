import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    HEARTS_ROUND_OVER_PAGE_CLASS_KEY,
    HEARTS_MATCH_OVER_PAGE_CLASS_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Card from "../game/Card.mjs";

// Match -> The game session
// Round -> The individual game, played untill all cards are used. 
// Trick -> 1 'round' of cards played by each player

export default class HeartsGamePage extends Page {
    static #ID = 'hearts-game-page';
    static #TURN_TITLE = 'turn-title';
    static #HAND_LIST_ID = 'hand-list';
    static #PLAYED_CARDS_LIST_ID = 'played_cards_list';
    static #CLOSE_LOBBY_BUTTON_ID = 'close_lobby_button';
    static #SCORES_LIST_ID = 'scores_list;'
    #firebaseListeners;

    playCard(_card) {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const USER_UID = FBIO.authedUser().uid;
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_ID = LOBBY.getLobbyId();
        if (!LOBBY.isMyTurn()) {
            alert('It Is Not Your Turn.');
            return;
        }
        FBIO.remove(`lobbies/${LOBBY_ID}/hands/${USER_UID}/${_card}`, async () => {
            const TRICK_DATA = await LOBBY.getTrickData();
            if (!TRICK_DATA.playedCards) TRICK_DATA.playedCards = {};
            if (!TRICK_DATA.leadingSuit) TRICK_DATA.leadingSuit = Card.getTemplate(_card).suit;
            TRICK_DATA.playedCards[FBIO.authedUser().uid] = _card;
            FBIO.update(`lobbies/${LOBBY_ID}`, {
                trickData: TRICK_DATA
            })
            this.markTurnOver();
        });

    }

    markTurnOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PLAYERS = Object.values(LOBBY.getLobbyCache().players);
        const NEXT_PLAYER = Utils.getNextElement(PLAYERS, PLAYERS.indexOf(LOBBY.getLobbyCache().turn));

        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: NEXT_PLAYER
        });
    }


    // Add Logic For New Round;
    async onTurnStart() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const CACHE = LOBBY.getLobbyCache();
        const PLAYERS = Object.values(CACHE.players);
        const PLAYER_INDEX = PLAYERS.indexOf(CACHE.turn);
        if (PLAYER_INDEX == 0) {
            await this.onTrickOver();
            await FBIO.remove(`lobbies/${LOBBY.getLobbyId()}/trickData`, () => {
                console.log('rmd')
            });
        }
    }

    async onTrickOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const TRICK_DATA = LOBBY.getLobbyCache().trickData;
        if (TRICK_DATA) {
            const PLAYED_CARDS_IDS = TRICK_DATA.playedCards;
            const LEADING_SUIT = TRICK_DATA.leadingSuit;

            const PLAYED_CARDS = [];
            for (const _card of Object.values(PLAYED_CARDS_IDS)) {
                const TEMPLATE = Card.getTemplate(_card);
                const CARD = Card.from(TEMPLATE);
                PLAYED_CARDS.push(CARD);
            }

            const SCORES = {}
            for (const [_player, _cardId] of Object.entries(PLAYED_CARDS_IDS)) {
                const CARD = Card.from(Card.getTemplate(_cardId));
                if (CARD.getSuit() == 'hearts' || CARD.getId() == 'sq') {
                    let score = 1;
                    if (CARD.getId() == 'sq') score = 13;
                    SCORES[_player] = score;
                }
            }

            const WINNING_CARD = this.compareCards(LEADING_SUIT, ...Object.values(PLAYED_CARDS));
            const WINNING_PLAYER = await Utils.getKeyByValue(PLAYED_CARDS_IDS, WINNING_CARD.getId());
            await this.scorePoints(LOBBY, FBIO, WINNING_PLAYER, WINNING_CARD, PLAYED_CARDS_IDS);
            await LOBBY.generateCache();
            if (await this.shouldEndRound()) {
                LOBBY.markRoundOver(FBIO);
            } else if (await this.shouldEndMatch()){
                await this.endMatch();
            }
        }
    }

    async shouldEndMatch(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const POINTS = await LOBBY.getPoints();
        let shouldEnd = false;
        for (const [_uid, _score] of Object.entries(POINTS)){
            if (!shouldEnd && _score >= 2) {
                shouldEnd = true;
            }
        }
        return shouldEnd;
    }

    async endMatch(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        await FBIO.update(`/lobbies/${LOBBY.getLobbyId()}/flags`, {
            matchOver: true
        })
    }
    
    async onMatchOver(){
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_MATCH_OVER_PAGE_CLASS_KEY]);
    }

    async shouldEndRound() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const HANDS = LOBBY.getLobbyCache().hands;
        let endRound = false;
        Object.values(HANDS).forEach(_hand => {
            const HAND_SIZE = Object.values(_hand).length;
            console.log(HAND_SIZE);
            if (HAND_SIZE == 24 && !endRound){
                endRound = true;
            }
        })

        return endRound;
    }

    async scorePoints(_lobby, _fbio, _winningPlayer, _winningCard, _playedCards) {
        let points = (await _lobby.getPoints())[_winningPlayer] ?? 0;
        for (const [_player, _cardId] of Object.entries(_playedCards)) {
            const CARD = Card.from(Card.getTemplate(_cardId));
            if (CARD.getSuit() == 'hearts' || CARD.getId() == 'sq') {
                if (CARD.getId() == 'sq') {
                    points += 13;
                } else {
                    points += 1;
                }
            }
        }
        await _fbio.update(`lobbies/${_lobby.getLobbyId()}/points`, {
            [_winningPlayer]: points
        });
    }

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

    onTurnChange() {
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const MY_TURN = LOBBY.isMyTurn();
        document.getElementById(HeartsGamePage.#TURN_TITLE).textContent =
            `It ${MY_TURN ? "Is" : "Isn't"} My Turn`
        if (MY_TURN) this.onTurnStart();
    }

    displayHand() {
        const LIST_ELEMENT = document.getElementById(HeartsGamePage.#HAND_LIST_ID);
        while (LIST_ELEMENT.firstChild) {
            LIST_ELEMENT.firstChild.remove();
        }
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const HAND = Object.values(LOBBY.getLobbyCache().hands[FBIO.authedUser().uid]);
        HAND.forEach(_card => {
            LIST_ELEMENT.appendChild(this.createElement('li', {}, [
                this.createElement('button', {
                    textContent: _card,
                    onclick: () => this.playCard(_card)
                })
            ]))
        });
    }

    displayPlayedCards() {
        const PLAYED_CARDS_ELEMENT = document.getElementById(HeartsGamePage.#PLAYED_CARDS_LIST_ID);
        if (PLAYED_CARDS_ELEMENT != null && PLAYED_CARDS_ELEMENT.lastChild != null) {
            while (PLAYED_CARDS_ELEMENT.lastChild) {
                PLAYED_CARDS_ELEMENT.lastChild.remove();
            }
        }
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        let playedCards;
        try {
            playedCards = LOBBY.getLobbyCache().trickData.playedCards;
        } catch (_error) {
            playedCards = {};
        }
        for (const [_player, _card] of Object.entries(playedCards)) {
            PLAYED_CARDS_ELEMENT.appendChild(this.createElement('h5', {
                textContent: `${_player} : ${_card}`
            }))
        }
    }

    onDisconnect() {
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
        REFERENCES[LOBBY_SESSION_INSTANCE_KEY] = null;
    }

    onDisplay() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}`]: async (_data) => {
                if (_data != null) return;
                this.onDisconnect();
            },
            [`lobbies/${LOBBY.getLobbyId()}/turn`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                this.onTurnChange();
                this.displayHand();
            },
            [`lobbies/${LOBBY.getLobbyId()}/trickData/playedCards`]: async (_data) => {
                await LOBBY.generateCache();
                this.displayPlayedCards();
            },
            [`lobbies/${LOBBY.getLobbyId()}/flags/roundOver`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null || !_data) return;
                this.onRoundOver();
            },
            [`lobbies/${LOBBY.getLobbyId()}/points`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                this.displayScores();
            }, 
            [`lobbies/${LOBBY.getLobbyId()}/flags/matchOver`]: async (_data) => {
                await LOBBY.generateCache();
                if (_data == null || _data == false) return;
                this.onMatchOver();
            }
        });
    }

    async displayScores() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const HTML_LIST = document.getElementById(HeartsGamePage.#SCORES_LIST_ID);

        while (HTML_LIST.lastChild) {
            HTML_LIST.lastChild.remove();
        }

        const SCORES = await LOBBY.getPoints(true);
        SCORES.forEach(_entry => {
            const ELEMENT = this.createElement('li', {}, [
                this.createElement('h5', {
                    textContent: `${_entry.player} : ${_entry.score}`,
                    id: `scores_${_entry.player}_${_entry.score}`
                })
            ]);
            HTML_LIST.appendChild(ELEMENT);
        })
    }


    onRoundOver() {
        alert('roundOver');
        REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HEARTS_ROUND_OVER_PAGE_CLASS_KEY]);
    }

    triggerRoundOver() {

    }

    triggerNewMatch() {

    }

    resetMatch() {

    }

    // Points == bad...
    // Therefor rank people from < to > points. 
    // Give each position a set number of points
    // Perhaps max points equals num of players minus 1, then decrement to last place (0 score)?
    async writeRoundOver() {
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        //const POINTS = LOBBY.getPoints();
        console.log('wrote points to leaderboard');
        FBIO.update(`/lobbies/${LOBBY.getLobbyId()}/flags`, {
            gameStarted: false
        });
        //LOBBY.closeLobby();
    }

    async writeGlobalPoints(){

    }

    onRemove() {
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    getHTML() {
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: HeartsGamePage.#TURN_TITLE
            }),
            this.createElement('ul', {
                id: HeartsGamePage.#HAND_LIST_ID
            }),
            this.createElement('h1', {
                textContent: 'Played Cards...'
            }),
            this.createElement('ul', {
                id: HeartsGamePage.#PLAYED_CARDS_LIST_ID
            }),
            this.createElement('h1', {
                textContent: 'Points:'
            }),
            this.createElement('ul', {
                id: HeartsGamePage.#SCORES_LIST_ID
            }),
            this.createElement('button', {
                id: HeartsGamePage.#CLOSE_LOBBY_BUTTON_ID,
                textContent: "Exit Lobby",
                onclick: async () => {
                    await REFERENCES[LOBBY_SESSION_INSTANCE_KEY].closeLobby();
                }
            })
        ])
    }

    getId() {
        return HeartsGamePage.#ID;
    }
}