import { PAGE_MANAGER_INSTANCE_KEY, REFERENCES, TERMINAL_INSTANCE } from "./ReferenceStorage.mjs";
import Utils from "./Utils.mjs";
export default class Terminal {
    #outputElement;
    #inputElement;
    keydownListener = null;

    static TERMINAL_INPUT_ELEMENT_ID = 'terminal_import';
    static TERMINAL_OUTPUT_ELEMENT_ID = 'terminal_output';

    constructor(_input, _output) {
        this.#inputElement = _input;
        this.#outputElement = _output;
        this.registerKeydownListener();
    }

    createElements() {
        const PAGE = document.getElementById(REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId());

        const ELEMENT = Utils.createElement('div', {
            className: 'terminal-window'
        }, [
            Utils.createElement("div", {
                className: "terminal-title-bar"
            }, [
                Utils.createElement("div", {
                    className: "terminal-title-left-side"
                }, [
                    Utils.createElement('span', {
                        textContent: "Terminal"
                    })
                ]),
                Utils.createElement("div", {
                    className: "terminal-title-center-side"
                }, [
                    Utils.createElement("span", {
                        textContent: "?/13comp-project-2026-MacSmith22115/~",
                        className: "terminal-title-tab"
                    })
                ]),
                Utils.createElement("div", {
                    className: "terminal-title-right-side"
                }, [
                    Utils.createElement("div", {
                        className: "terminal-title-buttons"
                    }, [
                        Utils.createElement("button", {
                            textContent: "X",
                            className: "terminal-logout-button"
                        })
                    ])
                ]),
            ]),

            Utils.createElement('div', {
                id: 'terminal-content'
            }, [
                Utils.createElement('div', {
                    id: Terminal.TERMINAL_OUTPUT_ELEMENT_ID
                }),
                Utils.createElement('div', {
                    className: 'command-line'
                }, [
                    Utils.createElement('span', {
                        className: 'command-prompt',
                        textContent: '~$'
                    }),
                    Utils.createElement('input', {
                        type: 'text',
                        className: 'command-input',
                        id: Terminal.TERMINAL_INPUT_ELEMENT_ID,
                        autofocus: true,
                    })
                ])
            ])
        ])

        PAGE.appendChild(ELEMENT);
    }

    registerKeydownListener() {
        this.keydownListener = (_event) => {
            if (_event.key !== 'Enter') return;
            const ELEMENT = REFERENCES[TERMINAL_INSTANCE].getInputElement();
            if (ELEMENT.value == '') return;
            REFERENCES[TERMINAL_INSTANCE].readInput();
        }
        document.addEventListener('keydown', this.keydownListener);
    }

    unregisterKeydownListener() {
        document.removeEventListener('keydown', this.keydownListener);
        this.keydownListener = null;
    }

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

    printElement(_element, _appendToId = null){
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

    printStr(_string) {
        const ELEMENT = document.createElement('p');
        ELEMENT.innerHTML = _string;
        this.#outputElement.appendChild(ELEMENT);
        document.getElementById('terminal-content').scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }

    readInput() {
        const INPUT = this.#inputElement.value;
        this.#inputElement.value = '';
        this.logCmd(INPUT);
        this.executeCmd(INPUT.trim());
    }

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



    async executeCmd(_input) {
        const SPLIT_INPUT = _input.toLowerCase().split(' ');
        const JSON = await Utils.fetchJSON(`commands/${SPLIT_INPUT[0]}_command.json`);
        if (JSON == null) {
            this.printStr(`Syntax Error: Command '${SPLIT_INPUT[0]}' Not Found`);
            return;
        }
        if (!JSON.pages.includes(REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().getId())) {
            this.printStr(`Location Error: Command '${SPLIT_INPUT[0]}' Can't Be User Here`);
            return;
        }
        const COMMAND = this.computeCommand(SPLIT_INPUT, JSON.args);
        const FUNC = COMMAND.func;
        const USER_ARGS = COMMAND.captured;
        const RESULT = await (await import(`../commands/${SPLIT_INPUT[0]}Command.mjs`))[FUNC](USER_ARGS);
        this.printStr(RESULT);
    }

    getInputElement() {
        return this.#inputElement;
    }

    getOutputElement() {
        return this.#outputElement;
    }
}