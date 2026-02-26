/*****************************************************************
 * PageManager.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 26/2/26
 * Description: 
 *  -> Provides Methods for managing the display of pages.
 *  -> Tracks currently displayed pages.
 ****************************************************************/
export default class PageManager {
    #rootElement; // HTML Element that displayed pages are appended to.

    // Currently Displayed Pages
    #displayedPages = {
        main : null,
        sub : []
    }

    /*****************************************************************
    * @param {HTMLElement} _rootElement - HTML Element to append pages to
    *****************************************************************/
    constructor(_rootElement){
        this.#rootElement = _rootElement;
    }

    /*****************************************************************
    * displayPage(_class);
    * Description:
    *   -> Creates an instance of _class.
    *   -> Removes currently displayed page/s
    *   -> Displays the instance of _class
    * Params: 
    *   -> '_class': Class reference to display (Must inherit 'Page.mjs');
    * Returns: N/A
    * Throws: N/A
    *****************************************************************/
    async displayPage(_class){
        const PAGE = new _class();
        await PAGE.preDisplay();
        if (!PAGE.isSubPage()){
            if (this.getMainPage()){
                await this.getMainPage().remove();
            }
            for (const subpage of this.getSubPages()){
                await subpage.remove();
            }
            this.#displayedPages.main = PAGE;
        }
        await PAGE.display(this.#rootElement);
    }

    /*****************************************************************
     * getMainPage()
     * Description: Returns the currently displayed main page
     * Params: N/A
     * Returns: Currently displayed main page
     * Throws: N/A
    *****************************************************************/
    getMainPage(){
        return this.#getDisplayedPages().main;
    }

    /*****************************************************************
     * getSubPages()
     * Description: Returns the currently displayed sub pages
     * Params: N/A
     * Returns: Array of Subpages
     * Throws: N/A
    *****************************************************************/
    getSubPages(){
        return this.#getDisplayedPages().sub;
    }

    /*****************************************************************
     * getElement(_id)
     * Description: Returns an HTML element with a specified ID
     * Params: 
     *  -> '_id': Id of HTML element to get
     * Returns: HTML Element
     * Throws: N/A
    *****************************************************************/
    getElement(_id){
        return document.getElementById(_id);
    }

    /*****************************************************************
     * getDisplayedPages()
     * Description: Returns an object of currently displayed pages
     * Params: N/A
     * Returns: All the currently displayed pages
     * Throws: N/A
    *****************************************************************/
    #getDisplayedPages(){
        return this.#displayedPages;
    }
}