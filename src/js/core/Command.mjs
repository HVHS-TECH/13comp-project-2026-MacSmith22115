export default class Command {
    static REGISTRATION_DETAILS = new Command({
        'get': () => {
            console.log('get');
        }
    }, {
        'set': () => {
            console.log('set');
        }
    });
    
    // Use to aid in parsing of commands with parameters? 


    #params;

    constructor(..._params) {
        this.#params = _params;
    }

    attemptParse(_command){

    }
}