export default class PageManager {
    #displayedPages = {
        main : null,
        sub : []
    }
    #rootElement;

    constructor(_rootElement){
        this.#rootElement = _rootElement;
    }

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

    getMainPage(){
        return this.#getDisplayedPages().main;
    }

    getSubPages(){
        return this.#getDisplayedPages().sub;
    }

    getElement(_id){
        return document.getElementById(_id);
    }

    #getDisplayedPages(){
        return this.#displayedPages;
    }
}