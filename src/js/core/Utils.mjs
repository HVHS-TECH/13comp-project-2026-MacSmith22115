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
    * Description:
    *   -> Static arrow function for validation of user-inputed names
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static NAME_VALIDATION_RULE = (_input, _errors) => {
        let valid = true;
        const REGEX = /^[^\s]+$/;

        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No Name Found");
            return false;
        }
        const LENGTH = _input.length;
        if (LENGTH < 2) {
            _errors.push('Name Contains Too Few Characters, Min 2');
            if (valid) valid = false;
        } else if (LENGTH > 100) {
            _errors.push('Name Contains Too Many Characters, Max 100');
            if (valid) valid = false;
        }
        if (!REGEX.test(_input)) {
            _errors.push('Name Can Not Contain Whitespaces.');
            if (valid) valid = false;
        }
        if (!isNaN(_input)) {
            _errors.push('Name Can Not Consist Only Of Numbers.');
            if (valid) valid = false;
        }
        return valid;
    };


    /*****************************************************************
    * Description:
    *   -> Static arrow function for validation of user-inputed emails
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static EMAIL_VALIDATION_RULE = (_input, _errors) => {
        let valid = true;
        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No Email Found");
            return false;
        }
        return valid;
    };


    /*****************************************************************
    * Description:
    *   -> Static arrow function for validation of user-inputed pfp's
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static PFP_VALIDATION_RULE = (_input, _errors) => {
        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No PfP Found");
            return false;
        }
        return true;
    };


    /*****************************************************************
    * Description:
    *   -> Static arrow function for validation of user-inputed ages
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static AGE_VALIDATION_RULE = (_input, _errors) => {
        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No Age Found");
            return false;
        }
        let valid = true;
        if (_input > 116) {
            _errors.push('Age Too Large, Please Enter Below 116');
            if (valid) valid = false;
        }
        return valid;
    };


    /*****************************************************************
    * Description:
    *   -> Static arrow function for validation of user-inputed colours
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static COLOUR_VALIDATION_RULE = (_input, _errors) => {
        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No Colour Found");
            return false;
        }
        return true;
    };


    /*****************************************************************
    * Description:
    *   -> Static arrow function for validation of user-inputed phone numbers
    * Params: 
    *   -> '_input': Data to validate
    *   -> '_errors': Arr of pre-existing errors, more are pushed to it if encounted
    *****************************************************************/
    static PHONE_VALIDATION_RULE = (_input, _errors) => {
        if (_input == null || _input == undefined) {
            _errors.push("Nullpointer Exception: No Phone Found");
            return false;
        }
        return true;
    };

    // List of cards to remove FIRST when dealing hearts, lower indexes are removed first
    static HEARTS_PRIORITY_REMOVAL_CARDS = ['d2', 'c2'];

    // List of Playing cards protected from removal when dealing hearts
    static HEARTS_PROTECTED_CARDS = [
        'ha',
        'hk',
        'hq',
        'hj',
        'h10',
        'h9',
        'h8',
        'h7',
        'h6',
        'h5',
        'h4',
        'h3',
        'h2',
        'sq'
    ];

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
    static getNextElement(_array, _index) {
        return _array[(_index + 1) % _array.length];
    }

    /*****************************************************************
    * Description:
    *   -> Checks if a json is found at _path
    * Params: 
    *   -> '_path': Str path (includes filename) to check if exists
    *****************************************************************/
    static async jsonExists(_path) {
        const FULL_PATH = `./src/json/${_path}`;
        try {
            const RESPONSE = await fetch(FULL_PATH, { method: 'HEAD' });
            return RESPONSE.ok;
        } catch (_error) {
            return false;
        }
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
    static async fetchJSON(_path, _logErrors = true) {
        const FULL_PATH = `./src/json/${_path}`;
        try {
            const RESPONSE = await fetch(FULL_PATH);
            if (!RESPONSE.ok && _logErrors) {
                throw new Error(`Encounted HTTP Error Fetching JSON @ ${FULL_PATH}: ${RESPONSE.status}`);
            }
            const DATA = await RESPONSE.json();
            return DATA;
        } catch (_error) {
            if (_logErrors) console.error(`Failed To Fetch Or Parse JSON @ ${FULL_PATH}: ${_error}`);
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
    static async getKeyByValue(_object, _value) {
        return Object.keys(_object).find(_key => _object[_key] == _value);
    }

    static sortObjsAscending(_array, _field) {
        return _array.sort((_a, _b) => _a[_field] - _b[_field]);
    }

    static isObjEmpty(_obj) {
        return Object.keys(_obj).length === 0;
    }

    static objToArr(_obj) {
        return Object.entries(_obj).map(([_key, _value]) => ({ _key, _value }));
    }

    static objHasField(_obj, _field) {
        return Object.hasOwn(_obj, _field);
    }

    static validateInput(_input, _errors = [], _ruleCallback = () => { return true }) {
        const VALID = _ruleCallback(_input, _errors);
        return VALID;
    }

    static createElement(_tag, _attributes = {}, _children = []) {
        const ELEMENT = document.createElement(_tag);
        Object.assign(ELEMENT, _attributes);
        _children.forEach(_child => ELEMENT.append(_child));
        return ELEMENT;
    }
}   