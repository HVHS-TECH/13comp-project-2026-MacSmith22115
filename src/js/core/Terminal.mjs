// imports
import { LOGIN_PAGE_CLASS_KEY, PAGE_MANAGER_INSTANCE_KEY, REFERENCES, TERMINAL_INSTANCE } from "./ReferenceStorage.mjs";
import Utils from "./Utils.mjs";

/*****************************************************************
 * Terminal.mjs
 * @author MacSmith22115
 * Created: Term #2 2026
 * Description: 
 *      -> Acts as a command line interface, providing methods for command excution, etc
 ****************************************************************/
export default class Terminal {
    #outputElement; // HTML element to append outputs to
    #inputElement;  // HTML element to read inputs from
    keydownListener = null; // Event listener, stored to unregister later.
    #cmdHistory = [];   // List of cmds used
    #cmdHistoryIndex = -1; // Current index in list of used cmds, used for history scrolling
    static TERMINAL_INPUT_ELEMENT_ID = 'terminal_import';
    static TERMINAL_OUTPUT_ELEMENT_ID = 'terminal_output';

    /*****************************************************************
    * @param {HTMLElement} _input - Element to read inputs from
    * @param {HTMLElement} _output  - Element to append elements to.
    *****************************************************************/
    constructor(_input, _output) {
        this.#inputElement = _input;
        this.#outputElement = _output;
        this.registerKeydownListener();
    }

    /*****************************************************************
    * Description:
    *   -> Registers an event listener to the page which listens for a keydown 
    *   -> If they key is the 'enter' key, read the value of #inputElement.
    *   -> If the up/down arrows are pressed, you traverse up/down the cmd history
    *****************************************************************/
    registerKeydownListener() {
        this.keydownListener = (_event) => {
            const KEY = _event.key;
            if (KEY !== 'Enter' && KEY !== 'ArrowUp' && KEY !== 'ArrowDown') return;
            const ELEMENT = this.getInputElement();
            switch (KEY) {
                case 'Enter':
                    if (ELEMENT.value == '') return;
                    this.readInput();
                    break;
                default:
                    this.scrollCmdHistory(KEY === 'ArrowUp' ? true : false);
                    break;
            }
        }
        document.addEventListener('keydown', this.keydownListener);
    }

    
    /*****************************************************************
    * Description:
    *   -> Called to navigate through the cmd history with arrow keys
    * Params: 
    *   -> '_scrollUp': T/F indicating direction of history scroll
    *****************************************************************/
    scrollCmdHistory(_scrollUp){
        const CURRENT_INDEX = this.#cmdHistoryIndex;
        const HISTORY = this.#cmdHistory;
        const DIR_VAL = _scrollUp ? 1 : -1;
        if (HISTORY[this.#cmdHistoryIndex + DIR_VAL] == null) return;
        this.#cmdHistoryIndex += DIR_VAL;
        this.getInputElement().value = HISTORY[this.#cmdHistoryIndex];
        console.log(HISTORY);
        console.log(`INDEX: ${this.#cmdHistoryIndex}`);
    }

    /*****************************************************************
    * Description:
    *   -> Unregister keydown listener
    *****************************************************************/
    unregisterKeydownListener() {
        document.removeEventListener('keydown', this.keydownListener);
        this.keydownListener = null;
    }

    /*****************************************************************
    * Params:
    *   '_cmd': String To Log
    * Description:
    *   -> This logs the inputted command to the output element
    *   -> Allows you to see past commands you entered
    *****************************************************************/
    logCmd(_cmd) {
        const INPUT_ELEMENT = document.getElementById(Terminal.TERMINAL_INPUT_ELEMENT_ID);
        const LINE = document.createElement('div');
        const INPUT = _cmd.trim();
        LINE.className = "command-line";
        LINE.innerHTML = `<span class="command-prompt">~$ </span><span class="command-input-text">${INPUT}</span>`;
        this.#outputElement.appendChild(LINE);
        this.#inputElement.value = '';
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }

    /*****************************************************************
    * Params: 
    *   '_element': HTML Element to log
    *   '_appendToId': Optional Param, HTML Element to append _element too.
    * Description:
    *   -> prints an html element to the terminal
    *   -> Optional to append to an existing element.
    *****************************************************************/
    printElement(_element, _appendToId = null) {
        if (_appendToId == null) {
            this.#outputElement.appendChild(_element);
        } else {
            document.getElementById(_appendToId).appendChild(_element);
        }
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }

    /*****************************************************************
    * Params: 
    *   '_string': String to print
    * Description:
    *   -> Prints a string to the terminal output element
    *****************************************************************/
    printStr(_string) {
        const ELEMENT = document.createElement('p');
        ELEMENT.innerHTML = _string;
        this.#outputElement.appendChild(ELEMENT);
        document.getElementById('terminal-content')?.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }


    /*****************************************************************
    * Params: N/A
    * Description:
    *   -> Reads the current value of the #inputElement
    *   -> Calls method to execute the command
    *****************************************************************/
    readInput() {
        const INPUT = this.#inputElement.value;
        this.#inputElement.value = '';
        this.logCmd(INPUT);
        this.#cmdHistory.push(INPUT);
        this.executeCmd(INPUT.trim());
    }

    /*****************************************************************
    * Params: 
    *   '_args': Array of words collected from the input element
    *   '_tree': JSON Object of the command tree, is trimmed during this function
    *   '_depth': Index relationg to current targeted entry in _args
    *   '_captured': Array containing user-inputed data, e.g -17 in 'register age -17'
    * Description:
    *   ->  Uses Recursion to traverse down _tree, which is a JSON Object
    *   -> Effectivly checks if an array of words is expected in _tree
    *****************************************************************/
    computeCommand(_args, _tree, _depth = 0, _captured = []) {
        if (_depth >= _args.length) {
            return _tree["*"] !== undefined ? { func: _tree["*"], captured: _captured } : null;
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


    /*****************************************************************
    * Params: 
    *   '_input': string collected from input element
    * Description: 
    *   -> Manipulates the input and fetches a file using first word of input.
    *   -> Resolves input into a function name, and a list of user-inputted arguments
    *   -> Calls the command's function and prints the output to the terminal.
    *****************************************************************/
    async executeCmd(_input) {
        let SPLIT_INPUT = _input.toLowerCase().split(' ').filter(_entry => _entry.trim() !== '');
        const CMD_JSON_PATH = `commands/${SPLIT_INPUT[0]}_command.json`;
        const CURRENT_PAGE_ID = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId();
        
        if (!(await Utils.jsonExists(CMD_JSON_PATH))){
            this.printStr(`Syntax Error: Command ${SPLIT_INPUT} Not Found`);
            return;
        }

        const COMMAND_JSON = await Utils.fetchJSON(CMD_JSON_PATH, false);

        if (COMMAND_JSON == null) {
            this.printStr(`Syntax Error: File For'${CMD_JSON_PATH}' Not Found`);
            return;
        }

        if (!COMMAND_JSON.pages == null) {
            if (!COMMAND_JSON.pages.includes(CURRENT_PAGE_ID)) {
                this.printStr(`Location Error: Command '${SPLIT_INPUT[0]}' Can't Be User Here`);
                return;
            }
        } else if (CURRENT_PAGE_ID === REFERENCES[LOGIN_PAGE_CLASS_KEY].ID) {
            if (SPLIT_INPUT[0] != 'login') {
                this.printStr("Permission Error: All Commands Other Than 'login google' Are Blocked Before Login");
                return;
            }
        }

        const COMMAND = this.computeCommand(SPLIT_INPUT, COMMAND_JSON.args);

        if (COMMAND == null){
            this.printStr(`Syntax Error: Command '${SPLIT_INPUT.toString().replaceAll(',', ' ') }' Not Valid`);
            return;
        }
           
        const FUNC = COMMAND.func;
        const USER_ARGS = COMMAND.captured;
        const RESULT = await (await import(`../commands/${SPLIT_INPUT[0]}Command.mjs`))[FUNC](USER_ARGS);
        this.printStr(RESULT);
    }

    /*****************************************************************
    * Description: 
    *   -> Returns the input HTML element
    *****************************************************************/
    getInputElement() {
        return this.#inputElement;
    }

    /*****************************************************************
    * Description: 
    *   -> Returns the output HTML element
    *****************************************************************/
    getOutputElement() {
        return this.#outputElement;
    }
}