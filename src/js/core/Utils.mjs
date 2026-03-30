/*****************************************************************
 * Utils.mjs
 * @author MacSmith22115
 * Created: Term #1 2026
 * Last Edited: 7/3/26
 * Description: 
 *  -> Provides Common Static Utility Methods
 ****************************************************************/
export default class Utils {

    /*****************************************************************
    * getNextElement(_array, _index);
    * Description:
    *   -> Gets the element with an index of (_index + 1)
    *   -> If _index is the last element, gets the first element.
    * Params: 
    *   -> '_array': Target Array.
    *   -> '_index': Current Index, will get next element
    * Returns: Next Element in the array, 'looping' to the start if given the last index.
    * Throws: N/A
    *****************************************************************/
    static getNextElement(_array, _index){
        return _array[(_index + 1) % _array.length];
    }

    /*****************************************************************
    * fetchJSON(_path);
    * Description:
    *   -> Fetches and parses, and returns a JSON file on the client
    * Params: 
    *   -> '_path': String Path of targeted JSON
    * Returns: JSON Object of fetched JSON
    * Throws: Error if encounted while fetching the JSON.
    *****************************************************************/
    static async fetchJSON(_path){
        try {
            const RESPONSE = await fetch(_path);
            if (!RESPONSE.ok) {
                throw new Error(`Encounted HTTP Error Fetching JSON @ ${_path}: ${RESPONSE.status}`);
            }
            const DATA = await RESPONSE.json();
            return DATA;
        } catch (_error) {
            console.error(`Failed To Fetch Or Parse JSON @ ${_path}: ${_error}`);
        }
    }

     /*****************************************************************
    * getKeyByValue(_path);
    * Description:
    *   -> Finds the key associated with a given value in an object.
    * Params: 
    *   -> '_object': Object to search
    *   -> '_value': Value associated with key to find
    * Returns: Key associated with the given value
    * Throws: N/A
    *****************************************************************/
    static async getKeyByValue(_object, _value){
        return Object.keys(_object).find(_key => _object[_key] == _value);
    }

    static sortObjsAscending(_array, _field){
        return _array.sort((_a, _b) => _a[_field] - _b[_field]);
    }

    static isObjEmpty(_obj){
        return Object.keys(_obj).length === 0;
    }

    static objToArr(_obj){
        return Object.entries(_obj).map(([_key, _value]) => ({_key, _value}));
    }
}   