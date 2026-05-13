import { PAGE_MANAGER_INSTANCE_KEY, REFERENCES } from "./ReferenceStorage.mjs";
import Utils from "./Utils.mjs";
export default class Terminal {
    #outputElement;
    #inputElement;
    
    static #COMMAND_FUNCS = {
        "adc8ed62-3bb9-4282-8153-8cd64389ac68": async (_args) => {
            return "Got Name";
        }, 
        "7acdfd73-1bb9-4ff2-b4dd-afd50be64342": async (_args) => {
            return "Got Age";
        }, 
        "83f10a3d-3dc6-45ec-bbfc-0341482aaf57": async (_args) => {
            return `Set Name To ${_args}`;
        },
        "371498ea-5da6-4ad2-89a4-4ff29b28bc74": async (_args) => {
            REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().attemptLogin();
            return 'Login w Google';
        }
    }

    constructor(_input, _output){
        this.#inputElement = _input;
        this.#outputElement = _output;
    }

    printOutput(_output){
        let msg = `Mac:~$ ${_output}`;

        const ELEMENT = document.createElement('p');
        ELEMENT.innerHTML = msg;
        this.#outputElement.appendChild(ELEMENT);

        this.#inputElement.value = "";
    }

    readInput(){
        const INPUT = this.#inputElement.value;
        this.executeCmd(INPUT);
    }

    computeCommand(_args, _tree, _depth = 0, _captured = []){
        if (_depth >= _args.length){
            return _tree["*"] !== undefined ? {uuid: _tree["*"], captured: _captured} : null;
        }
        const ARG = _args[_depth];

        if (_tree[ARG] !== undefined) {
            return this.computeCommand(_args, _tree[ARG], _depth + 1, _captured);
        }
        if (_tree["-"] !== undefined) {
            return ARG.startsWith('-') ? this.computeCommand(_args, _tree['-'], _depth + 1, [..._captured, ARG.substring(1)]) : null;
        }
        return null;
    }

    async executeCmd(_input){
        const SPLIT_INPUT = _input.split(' ');
        const JSON = await Utils.fetchJSON(`commands/${SPLIT_INPUT[0]}_command.json`);
        if (!JSON.pages.includes(REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId())) {
            console.log('no');
            return;
        }
        const COMMAND = this.computeCommand(SPLIT_INPUT, JSON.args);
        this.printOutput(await Terminal.#COMMAND_FUNCS[COMMAND.uuid](COMMAND.captured));
    }
}