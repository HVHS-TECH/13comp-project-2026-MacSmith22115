export default class Page {
    #element; 

    constructor(){
        this.#element = document.createElement('section');
        this.#element.id = this.#getId();
        this.#element.classList.add('page');
        this.#element.innerHTML = this.#getHTML();
    }

    async display(_parent){
        this.#element.style.display = 'none';
        if (this.#element) _parent.append(this.#element);
        this.onDisplay();
        document.title = `13Comp: ${this.#getId()}`;
        if (this.#element) this.#element.style.display = 'block';
    }

    async remove(){
        this.onRemove();
        this.#element.remove();
    }

    preDisplay(){}
    onDisplay(){}
    onRemove(){}
    #getHTML(){this.#throwError("Extend Page.mjs to Override 'getHTML()' Before Use")}
    #getId(){this.#throwError("Extend Page.mjs to Override 'getHTML()' Before Use")}
    
    isSubPage(){
        return false
    }

    #throwError(_error){
        throw new Error(`[Page.mjs] An Error Was Thrown: ${_error}`);
    }
}