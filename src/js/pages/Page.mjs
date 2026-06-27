/*****************************************************************
 * Page.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
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
    constructor() {
        this.#element = document.createElement('section');
        this.#element.id = this.getId();
        this.#element.classList.add('page');
        this.#element.append(this.getHTML());
    }


    /*****************************************************************
    * Description:
    *   -> appends this.#element to _parent
    *   -> calls 'onDisplay()'
    *   -> changes website title
    *   -> displays this.#element
    * Params: 
    *   -> '_parent': HTML Element to append page to
    *****************************************************************/
    async display(_parent) {
        this.#element.style.display = 'none';
        if (this.#element) _parent.append(this.#element);
        this.onDisplay();
        document.title = `13Comp: ${this.getId()}`;
        if (this.#element) this.#element.style.display = 'block';
    }

    /*****************************************************************
    * Description:
    *   -> Calls 'onRemove()' and removes this.#element
    *****************************************************************/
    async remove() {
        this.onRemove();
        this.#element.remove();
    }

    /*****************************************************************
    * Abstract Methods
    * Description: Ment to be overriden by child classes.
    * Throws: [getHTML() || getId()] If not overriden by child
    *****************************************************************/
    async preDisplay() { }
    async onDisplay() { }
    onRemove() { }
    getHTML() { this.#throwError("Extend Page.mjs to Override 'getHTML()' Before Use") }
    getId() { this.#throwError("Extend Page.mjs to Override 'getId()' Before Use") }

    /*****************************************************************
    * Description: Wether this page should be displayed as a subpage or not
    * Returns: boolean [false by default, true if overriden by child]
    *****************************************************************/
    isSubPage() {
        return false
    }

    /*****************************************************************
    * Description: Throws and error, stating the message given by _error
    * Params: 
    *   -> '_error': Error Message
    * Throws: An Error (kinda the point);
    *****************************************************************/
    #throwError(_error) {
        throw new Error(`[Page.mjs] An Error Was Thrown: ${_error}`);
    }

    /*****************************************************************
   * Description:
   *   -> Creates an HTML element
   * Params: 
   *   -> '_tag': Str, typeof element, etc 'p', 'button', 'img', etc
   *   -> '_attributes': Obj of things to add to the element, E.G 'textContent', 'onClick', etc
   *   -> '_children': Arr of more HTML elements to append as children to this one
   * Returns: HTML Element
   *****************************************************************/
    createElement(_tag, _attributes = {}, _children = []) {
        const ELEMENT = document.createElement(_tag);
        Object.assign(ELEMENT, _attributes);
        _children.forEach(_child => ELEMENT.append(_child));
        return ELEMENT;
    }
}