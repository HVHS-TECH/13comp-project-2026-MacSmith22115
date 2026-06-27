import {
    FIREBASE_IO_INSTANCE_KEY,
    REFERENCES
} from "../core/ReferenceStorage.mjs";

/*****************************************************************
 * Card.mjs
 * @author MacSmith22115
 * Created: Term #2 2026
 * Description: 
 *      -> Provieds a wrapper for an id, suit and value, used as a playing card.
 ****************************************************************/
export default class Card {
    static TEMPLATES = []; // each 'card' is stored as an object, read from DB

    #id // Shorthand ID, 'c4' for 4 of Clubs, 'ha' for Ace of Hearts, etc
    #suit   // 'hearts', 'clubs', 'spades' or 'diamonds'
    #value  // 2-14 (2 being low, 14 being Ace [Ace-High])

    /*****************************************************************
    * @param {String} _id - Element to read inputs from
    * @param {String} _suit - The cards
    * @param {Integer} _value - Cards numberical value. 
    *****************************************************************/
    constructor(_id, _suit, _value) {
        this.#id = _id;
        this.#suit = _suit;
        this.#value = _value;
    }


    /*****************************************************************
    * Description:
    *   ->  Reads card data from database and caches it into TEMPLATES
    *****************************************************************/
    static async loadTemplates() {
        Card.TEMPLATES = Object.values(await REFERENCES[FIREBASE_IO_INSTANCE_KEY].read('/cards'));
    }


    /*****************************************************************
    * Params: 
    *   '_template': Object of card template, containing id, suit and value 
    * Description:
    *   ->  Creates a new instance of Card.mjs from a template base obj
    *****************************************************************/
    static from(_template) {
        if (_template.id == null || _template.suit == null || _template.value == null) {
            console.error(`Failed to Construct Card: Field was Null`);
            return;
        }
        return new Card(_template.id, _template.suit, _template.value);
    }

    /*****************************************************************
    * Params: 
    *   '_id': Shorthand ID of card to find in cache
    * Description:
    *   ->  Returns the card template from the cache which id matches _id
    *****************************************************************/
    static getTemplate(_id) {
        return Card.TEMPLATES.find(_card => {
            return _card.id == _id;
        });
    }

    getId() {
        return this.#id;
    }

    getSuit() {
        return this.#suit;
    }

    getValue() {
        return this.#value
    }
}