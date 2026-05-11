export default class CommandSet {
    static CORE = new CommandSet('95feb77e-4461-4033-80f7-e3bc17113445', {
        'details': (_parameters) => {
            console.log(_parameters);
            
        },
        'register': (_parameters) => {
            console.log('no');
        }
    });
    static ADMIN = new CommandSet('b42dd539-edc0-4a67-bbb4-eb73d1d7a417', {
        'user': (_parameters) => {
            console.log('hello world');
        }
    })

    #uuid;
    #commands;

    constructor(_uuid, _commands){
        this.#uuid = _uuid;
        this.#commands = _commands;
    }

    getCmds(){
        return this.#commands;
    }

    getUUID(){
        return this.#uuid;
    }
}