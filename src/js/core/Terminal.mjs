export default class Terminal {
    #outputElement;
    #inputElement;
    #commands = {};

    constructor(_input, _output, ..._commandSets = []){
        this.#inputElement = _input;
        this.#outputElement = _output;
        _commandSets.forEach(_set => this.registerCommandSet(_set));
    }


    printOutput(_output){

    }

    readInput(){
        const INPUT = this.#inputElement.value;
        this.executeCmd(INPUT);
    }

    executeCmd(_input){
        const WORDS = _input.split(' ');
        console.log(WORDS);
        for (const [_setUUID, _set] of Object.entries(this.#commands)){
            const COMMANDS = Object.keys(_set);
            for (const command of COMMANDS) {
                if (command == WORDS[0]){
                    const CALLBACK = _set[command];
                    const PARAMETERS = WORDS.slice(1);
                    CALLBACK(PARAMETERS);
                }
            }
        }
    }

    registerCommandSet(_set){
        this.#commands[_set.getUUID()] = _set.getCmds();
    }

    unregisterCommandSet(_set){
        delete this.#commands[_set.getUUID()];
    }

}