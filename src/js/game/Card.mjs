import { FIREBASE_IO_INSTANCE_KEY, REFERENCES } from "../core/ReferenceStorage.mjs";

export default class Card {
    static TEMPLATES = [];

    #id
    #suit
    #value

    constructor(_id, _suit, _value){
        this.#id = _id;
        this.#suit = _suit;
        this.#value = _value;
    }

    static async loadTemplates(){
        this.TEMPLATES = Object.values(await REFERENCES[FIREBASE_IO_INSTANCE_KEY].read('/cards'));
    }

    static from(_template){
        if (_template.id == null || _template.suit == null || _template.value == null){
            console.error(`Failed to Construct Card: Field was Null`);
            return;
        }
        return new Card(_template.id, _template.suit, _template.value);
    }

    static writeAll(){
        const CARDS = []

        for (let i = 1; i < 14; i++){
            let suit = 'h';
            let value = i;
            let sufix = value;
            if (value == 11) sufix = 'j';
            if (value == 12) sufix = 'q';
            if (value == 13) sufix = 'k';
            if (value == 1) sufix = 'a';
            let id = suit + sufix;
            CARDS.push({
                suit: 'hearts',
                value: i,
                id: id,
                texture: `${id}.png`
            });
        }

        for (let i = 1; i < 14; i++){
            let suit = 'c';
            let value = i;
            let sufix = value;
            if (value == 11) sufix = 'j';
            if (value == 12) sufix = 'q';
            if (value == 13) sufix = 'k';
            if (value == 1) sufix = 'a';
            let id = suit + sufix;
            CARDS.push({
                suit: 'clubs',
                value: i,
                id: id,
                texture: `${id}.png`
            });
        }

        for (let i = 1; i < 14; i++){
            let suit = 's';
            let value = i;
            let sufix = value;
            if (value == 11) sufix = 'j';
            if (value == 12) sufix = 'q';
            if (value == 13) sufix = 'k';
            if (value == 1) sufix = 'a';
            let id = suit + sufix;
            CARDS.push({
                suit: 'spades',
                value: i,
                id: id,
                texture: `${id}.png`
            });
        }

        for (let i = 1; i < 14; i++){
            let suit = 'd';
            let value = i;
            let sufix = value;
            if (value == 11) sufix = 'j';
            if (value == 12) sufix = 'q';
            if (value == 13) sufix = 'k';
            if (value == 1) sufix = 'a';
            let id = suit + sufix;

            CARDS.push({
                suit: 'diamonds',
                value: i,
                id: id,
                texture: `${id}.png`
            });
            
        }
        console.log(CARDS);

        CARDS.forEach(_card => {
            let id = _card.id;
            REFERENCES[FIREBASE_IO_INSTANCE_KEY].update('/cards', {
                [id]: _card
            }, () => {
                console.log('wrote Cards');
            })
        }) 
    }

    static writeCard(){

    }

    static getTemplate(_id){
        console.log(Card.TEMPLATES);
        return Card.TEMPLATES.find(_card => {
            _card.id == _id;
        });
    }

    getId(){
        return this.#id;
    }

    getSuit(){
        return this.#suit;
    }

    getValue(){
        return this.#value
    }
    
    compare(){

    }
}