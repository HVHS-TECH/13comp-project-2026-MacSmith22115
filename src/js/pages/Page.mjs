/*****************************************************************
 * Page.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 26/2/26
 * Description: 
 *  -> Parent Class, providing 
 ****************************************************************/
export default class Page {
    #element; // HTML 'Section' element where getHTML() is appended to

    /*****************************************************************
    * Description:
    *   -> Creates a HTML 'section' element
    *   -> Sets its id, classlist and innerHTML
    *****************************************************************/
    constructor(){
        this.#element = document.createElement('section');
        this.#element.id = this.getId();
        this.#element.classList.add('page');
        this.#element.innerHTML = this.getHTML();
    }

    
    /*****************************************************************
    * display(_parent);
    * Description:
    *   -> appends this.#element to _parent
    *   -> calls 'onDisplay()'
    *   -> changes website title
    *   -> displays this.#element
    * Params: 
    *   -> '_parent': HTML Element to append page to
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async display(_parent){
        this.#element.style.display = 'none';
        if (this.#element) _parent.append(this.#element);
        this.onDisplay();
        document.title = `13Comp: ${this.getId()}`;
        if (this.#element) this.#element.style.display = 'block';
    }

    /*****************************************************************
    * remove();
    * Description:
    *   -> Calls 'onRemove()' and removes this.#element
    * Params: N/A
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async remove(){
        this.onRemove();
        this.#element.remove();
    }

    
    /*****************************************************************
    * Abstract Methods
    * Description: Ment to be overriden by child classes.
    * Params: N/A
    * Returns: N/A
    * Throws: [getHTML() || getId()] If not overriden by child
    *****************************************************************/
    preDisplay(){}
    onDisplay(){}
    onRemove(){}
    getHTML(){this.#throwError("Extend Page.mjs to Override 'getHTML()' Before Use")}
    getId(){this.#throwError("Extend Page.mjs to Override 'getId()' Before Use")}
    
    /*****************************************************************
    * isSubPage();
    * Description: Wether this page should be displayed as a subpage or not
    * Params: N/A
    * Returns: boolean [false by default, true if overriden by child]
    * Throws: N/A
    *****************************************************************/
    isSubPage(){
        return false
    }

    /*****************************************************************
    * #throwError();
    * Description: Throws and error, stating the message given by _error
    * Params: 
    *   -> '_error': Error Message
    * Returns: N/A
    * Throws: An Error (kinda the point);
    *****************************************************************/
    #throwError(_error){
        throw new Error(`[Page.mjs] An Error Was Thrown: ${_error}`);
    }
}