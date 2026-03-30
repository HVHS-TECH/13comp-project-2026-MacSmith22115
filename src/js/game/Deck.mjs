/*****************************************************************
 * Deck.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 7/3/26
 * Description: 
 *      -> Acts as a pile of playing cards cards
 *      -> Contains methods for shuffling, dealing and drawing of cards
 *      -> Ment for use with 'Card.mjs', but #cards can be an array of any datatype.
 ****************************************************************/
export default class Deck {
    #cards = [];

    /*****************************************************************
    * @param _cards - An Array representing all cards in the deck, passed as multiple parameters.
    *****************************************************************/
    constructor(..._cards){
        this.#cards = _cards;
        this.shuffle();
    }

    /*****************************************************************
    * shuffle();
    * Description:
    *   -> Uses the Fisher-Yates shuffling method to randomly mix up the cards in the deck
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    shuffle(){
        let cards = this.#cards;
        for (let i = cards.length - 1; i > 0; i--){
            const RAND_INDEX = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[RAND_INDEX]] = [cards[RAND_INDEX], cards[i]];
        }
    }

    /*****************************************************************
    * deal(_count, _splitRemainder = false);
    * Description:
    *   -> Acts as a wrapper, simpliying logic split based on deal method.  
    * Params: 
    *   -> '_count': How many hands to deal for
    *   -> '_splitRemainder': Wether Cards should ALL be dealt, or if remaining cards are splitf from the deck
    * Returns: Object containing an array of hands dealt, and an array of remaining cards.
    * Throws: N/A
    *****************************************************************/
    deal(_count, _splitRemainder = false){
        return _splitRemainder ? this.#dealEqual(_count) : this.#dealAll(_count);
    }

    /*****************************************************************
    * #dealEqual(_count);
    * Description:
    *   -> Deals an even number of cards to each hand, therefor producing a list of remainder cards
    * Params: '_count': How many hands to deal
    * Returns: Object containing an array of hands dealt, and an array of remaining cards.
    * Throws: N/A
    *****************************************************************/
    #dealEqual(_count){
        const HANDS = Array.from({length: _count}, () => ({}));
        const TOTAL_CARDS = this.size();
        const PER_HAND = Math.floor(TOTAL_CARDS / _count);
        const REMAINDER_COUNT = TOTAL_CARDS % _count;
        for (let dealRound = 0; dealRound < PER_HAND; dealRound++){
            for (let playerIndex = 0; playerIndex < _count; playerIndex++){
                const CARD = this.drawCard();
                HANDS[playerIndex][CARD] = CARD;
            }
        }
        const REMAINDER_CARDS = [];
        for (let i = 0; i < REMAINDER_COUNT; i++){
            REMAINDER_CARDS.push(this.drawCard());
        }
        return {hands: HANDS, remainder: REMAINDER_CARDS};
    }
    
    /*****************************************************************
    * #dealAll(_count);
    * Description:
    *   -> Deals ALL cards in the deck to the hands, can produce un-equal hand sizes
    * Params: '_count': How many hands to deal
    * Returns: Object containing an array of hands dealt, and an array of remaining cards (0).
    * Throws: N/A
    *****************************************************************/
    #dealAll(_count){
        const HANDS = Array.from({length: _count}, () => ({}));
        let playerIndex = 0;
        while(!this.isEmpty()){
            const CARD = this.drawCard();
            HANDS[playerIndex][CARD] = CARD;
            playerIndex = (playerIndex + 1) % _count;
        }
        return {hands: HANDS, remainder: []};
    }

    /*****************************************************************
    * drawCards(_count);
    * Description:
    *   -> Draws '_count' number of cards from the top of the deck, removing them when drawn
    * Params: '_count': How many cards to draw
    * Returns: Array containing drawn cards
    * Throws: N/A
    *****************************************************************/
    drawCards(_count){
        const CARDS = [];
        while (CARDS.length < _count){
            CARDS.push(this.#cards.pop());
        }
        return CARDS;
    }

    /*****************************************************************
    * drawCard();
    * Description:
    *   -> Draws The Top card on the deck.
    * Params: N/A
    * Returns: Top Card of the deck
    * Throws: N/A
    *****************************************************************/
    drawCard(){
        return this.drawCards(1)[0];
    }

    /*****************************************************************
    * isEmpty();
    * Description:
    *   -> Computes wether this instance of 'Deck' has any held cards
    * Params: N/A
    * Returns: Boolean, True if there are no cards, False if cards are present
    * Throws: N/A
    *****************************************************************/
    isEmpty(){
        return this.size() <= 0;
    }

    /*****************************************************************
    * getCards();
    * Description:
    *   -> Returns an array of cards held within the deck
    * Params: N/A
    * Returns: Array of Cards
    * Throws: N/A
    *****************************************************************/
    getCards(){
        return this.#cards;
    }

    /*****************************************************************
    * size();
    * Description:
    *   -> Shorthand way to get how many cards are held in the deck
    * Params: N/A
    * Returns: Int of how many cards the deck is holding
    * Throws: N/A
    *****************************************************************/
    size(){
        return this.#cards.length;
    }
}