import Page from "./Page.mjs";
import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    LOBBY_SESSION_INSTANCE_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";
import Card from "../game/Card.mjs";

export default class HeartsGamePage extends Page {
    static #ID = 'hearts-game-page';
    static #PLAY_CARD_BUTTON_ID = 'play-card-button';
    static #TURN_TITLE = 'turn-title';
    static #HAND_LIST_ID = 'hand-list';
    static #PLAYED_CARDS_LIST_ID = 'played_cards_list';
    #firebaseListeners;

    playCard(_card){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const USER_UID = FBIO.authedUser().uid;
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_ID = LOBBY.getLobbyId();
        if (!LOBBY.isMyTurn()){
            alert('It Is Not Your Turn.');
            return;
        }
        FBIO.remove(`lobbies/${LOBBY_ID}/hands/${USER_UID}/${_card}`, async () => {
            const ROUND_DATA = await LOBBY.getRoundData();
            if (!ROUND_DATA.playedCards) ROUND_DATA.playedCards = {};
            if (!ROUND_DATA.leadingSuit) ROUND_DATA.leadingSuit = Card.getTemplate(_card).suit;
            ROUND_DATA.playedCards[FBIO.authedUser().uid] = _card;
            FBIO.update(`lobbies/${LOBBY_ID}`, {
                roundData: ROUND_DATA
            })
            this.markTurnOver();
        });

    }

    markTurnOver(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const PLAYERS = Object.values(LOBBY.getLobbyCache().players);
        const NEXT_PLAYER = Utils.getNextElement(PLAYERS, PLAYERS.indexOf(LOBBY.getLobbyCache().turn));
        const NEXT_PLAYER_INDEX = PLAYERS.indexOf(NEXT_PLAYER);
        let markRoundOver = false;
        if (PLAYERS.indexOf(LOBBY.getLobbyCache().turn) == PLAYERS.length - 1){
            markRoundOver = true;
        }

        const FLAGS = LOBBY.getLobbyCache().flags;
        FLAGS.roundOver = markRoundOver;
        FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
            turn: NEXT_PLAYER,
            flags: FLAGS
        });
    }

    
    onTurnStart(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const LOBBY_FLAGS = LOBBY.getLobbyCache().flags;
        if (LOBBY_FLAGS.roundOver){
            LOBBY_FLAGS.roundOver = false;
            FBIO.update(`lobbies/${LOBBY.getLobbyId()}`, {
                flags: LOBBY_FLAGS
            }, async () => {
                await this.onRoundOver();
                await FBIO.remove(`lobbies/${LOBBY.getLobbyId()}/roundData`);
            })
        }
    }

    async onRoundOver(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const ROUND_DATA = LOBBY.getLobbyCache().roundData
        const PLAYED_CARDS_IDS = ROUND_DATA.playedCards;
        const LEADING_SUIT = ROUND_DATA.leadingSuit;

        const PLAYED_CARDS = [];
        for (const _card of Object.values(PLAYED_CARDS_IDS)){
            const TEMPLATE = Card.getTemplate(_card);
            const CARD = Card.from(TEMPLATE);
            PLAYED_CARDS.push(CARD);
        }

        const SCORES = {}
        for (const [_player, _cardId] of Object.entries(PLAYED_CARDS_IDS)){
            const CARD = Card.from(Card.getTemplate(_cardId));
            if (CARD.getSuit() == 'hearts' || CARD.getId() == 'sq') {
                let score = 1;
                if (CARD.getId() == 'sq') score = 13;
                SCORES[_player] = score;
            }
        }

        const WINNING_CARD = this.compareCards(LEADING_SUIT, ...Object.values(PLAYED_CARDS));
        const WINNING_PLAYER = await Utils.getKeyByValue(PLAYED_CARDS_IDS, WINNING_CARD.getId());


        let points = (await LOBBY.getPoints())[WINNING_PLAYER] ?? 0;     
        for (const [_player, _cardId] of Object.entries(PLAYED_CARDS_IDS)){
            const CARD = Card.from(Card.getTemplate(_cardId));
            if (CARD.getSuit() == 'hearts' || CARD.getId() == 'sq') {
                if (CARD.getId() == 'sq') {
                    points += 13;
                } else {
                    points += 1;
                }
            }
        }
        console.log(`Points for ${WINNING_PLAYER} is now ${points}`);

        await FBIO.update(`lobbies/${LOBBY.getLobbyId()}/points`, {
            [WINNING_PLAYER]: points
        })
    }

    compareCards(_leadingSuit, ..._cards){
        let topCard = null;
        _cards.forEach((_card) => {
            if (_card.getSuit() != _leadingSuit) return;
            if (!topCard || _card.getValue() > topCard.getValue()){
                topCard = _card;
            }
        })
        return topCard;
    }

    onTurnChange(){
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        const MY_TURN = LOBBY.isMyTurn();
        document.getElementById(HeartsGamePage.#TURN_TITLE).textContent = 
            `It ${MY_TURN? "Is" : "Isn't"} My Turn`
        if (MY_TURN) this.onTurnStart();
    }

    displayHand(){
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

    displayPlayedCards(){
        const PLAYED_CARDS_ELEMENT = document.getElementById(HeartsGamePage.#PLAYED_CARDS_LIST_ID);
        while (PLAYED_CARDS_ELEMENT.lastChild){
            PLAYED_CARDS_ELEMENT.lastChild.remove();
        }
        console.log('displayed played cards');
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        
        let playedCards;
        try {
            playedCards = LOBBY.getLobbyCache().roundData.playedCards;
        } catch (_error){
            playedCards = {};
        }

        for (const [_player, _card] of Object.entries(playedCards)){
            PLAYED_CARDS_ELEMENT.appendChild(this.createElement('h5', {
                textContent: `${_player} : ${_card}`
            }))
        }
    }

    onDisplay(){
        const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
        const LOBBY = REFERENCES[LOBBY_SESSION_INSTANCE_KEY];
        this.#firebaseListeners = FBIO.registerListeners({
            [`lobbies/${LOBBY.getLobbyId()}/turn`] : async (_data) => {
                await LOBBY.generateCache();
                if (_data == null) return;
                this.onTurnChange();
                this.displayHand();
            },
            [`lobbies/${LOBBY.getLobbyId()}/roundData/playedCards`]: async (_data) => {
                await LOBBY.generateCache();
                this.displayPlayedCards();
            }
        });
    }

    onRemove(){
        REFERENCES[FIREBASE_IO_INSTANCE_KEY].unregisterListeners(this.#firebaseListeners);
    }

    getHTML(){
        return this.createElement('div', {}, [
            this.createElement('h1', {
                id: HeartsGamePage.#TURN_TITLE
            }),
            this.createElement('ul', {
                id: HeartsGamePage.#HAND_LIST_ID
            }),
            this.createElement('h1',{
                textContent: 'Played Cards...'
            }),
            this.createElement('ul', {
                id:HeartsGamePage.#PLAYED_CARDS_LIST_ID
            })
        ])
    }

    getId(){
        return HeartsGamePage.#ID;
    }
}