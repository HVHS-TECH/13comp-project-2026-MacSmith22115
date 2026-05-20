import { PAGE_MANAGER_INSTANCE_KEY, REFERENCES, TERMINAL_INSTANCE } from "./ReferenceStorage.mjs";
import Utils from "./Utils.mjs";
export default class Terminal {
    #outputElement;
    #inputElement;
    keydownListener = null;

    static TERMINAL_INPUT_ELEMENT_ID = 'terminal_import';
    static TERMINAL_OUTPUT_ELEMENT_ID = 'terminal_output';

    constructor(_input, _output){
        this.#inputElement = _input;
        this.#outputElement = _output;
        this.registerKeydownListener();
    }

    static createIO(){
        const CURRENT_PAGE = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage();
        //CURRENT_PAGE.createElement('')
    }

    registerKeydownListener(){
        this.keydownListener = (_event) => {
            if (_event.key !== 'Enter') return;
            const ELEMENT = REFERENCES[TERMINAL_INSTANCE].getInputElement();
            if (ELEMENT.value == '') return;
            REFERENCES[TERMINAL_INSTANCE].readInput();
        }
        document.addEventListener('keydown', this.keydownListener);
    }

    unregisterKeydownListener(){
        document.removeEventListener('keydown', this.keydownListener);       
        this.keydownListener = null;
    }

    printCmdOutput(_output){
        let msg = `~$ ${_output}`;

        const ELEMENT = document.createElement('p');
        ELEMENT.innerHTML = msg;
        this.#outputElement.appendChild(ELEMENT);

        this.#inputElement.value = "";
    }

    systemPrint(_string){
        const ELEMENT = document.createElement('p');
        ELEMENT.innerHTML = _string;
        this.#outputElement.appendChild(ELEMENT);
    }

    readInput(){
        const INPUT = this.#inputElement.value;
        this.#inputElement.value = '';
        this.executeCmd(INPUT.trim());
    }

    computeCommand(_args, _tree, _depth = 0, _captured = []){
        if (_depth >= _args.length){
            return _tree["*"] !== undefined ? {path: _tree["*"], captured: _captured} : null;
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
            return;
        }
        const COMMAND = this.computeCommand(SPLIT_INPUT, JSON.args);
        const PATH = COMMAND.path;
        const ARGS = COMMAND.captured;

        const MODULE = await import(`../commands/${PATH}`);
        this.systemPrint(await MODULE.default(ARGS));
    }

    getInputElement(){
        return this.#inputElement;
    }

    getOutputElement(){
        return this.#outputElement;
    }
}