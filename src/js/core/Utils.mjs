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
        if (isNaN(_input)) {
            _errors.push('Inputted Age Was Not A Number...')
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
    * Description:
    *   -> Gets the element with an index of (_index + 1)
    *   -> If _index is the last element, gets the first element.
    * Params: 
    *   -> '_array': Target Array.
    *   -> '_index': Current Index, will get next element
    * Returns: Next Element in the array, 'looping' to the start if given the last index.
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
   * Description:
   *   -> Fetches and parses, and returns a JSON file on the client
   * Params: 
   *   -> '_path': String Path of targeted JSON
   * Returns: JSON Object of fetched JSON
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
   * Description:
   *   -> Finds the key associated with a given value in an object.
   * Params: 
   *   -> '_object': Object to search
   *   -> '_value': Value associated with key to find
   * Returns: Key associated with the given value
   *****************************************************************/
    static async getKeyByValue(_object, _value) {
        return Object.keys(_object).find(_key => _object[_key] == _value);
    }


    /*****************************************************************
   * Description:
   *   -> Sorts and arr of of objects by _field in an asending order.
   * Params: 
   *   -> '_array': Array of Objects to sort
   *   -> '_field': Field of data in each object to sort by
   * Returns: Array of sorted objects by _field
   *****************************************************************/
    static sortObjsAscending(_array, _field) {
        return _array.sort((_a, _b) => _a[_field] - _b[_field]);
    }


    /*****************************************************************
   * Description:
   *   -> Checks if _obj (object) has and fields (thus not an empty '{}')
   * Params: 
   *   -> '_obj': Object to check for keys
   *****************************************************************/
    static isObjEmpty(_obj) {
        return Object.keys(_obj).length === 0;
    }


    /*****************************************************************
   * Description:
   *   -> Takes an object and maps each key : value to [key, value], then pushed to an array
   * Params: 
   *   -> '_obj': Object to map key-value pairs to arrays
   * Returns: Array of Arrays, where each inner array is [key, value]
   *****************************************************************/
    static objToArr(_obj) {
        return Object.entries(_obj).map(([_key, _value]) => ({ _key, _value }));
    }


    /*****************************************************************
   * Description:
   *   -> Checks if an object has _field associated with it
   * Params: 
   *   -> '_obj': Object to check for _field
   *   -> '_field': key to check for in _obj
   *****************************************************************/
    static objHasField(_obj, _field) {
        return Object.hasOwn(_obj, _field);
    }

    /*****************************************************************
   * Description:
   *   -> Checks if _input is valid according to _ruleCallback
   *   -> If _ruleCallback isn't passed as a param, this will ALWAYS result in 'true'
   * Params: 
   *   -> '_input': Any datatype, but this will be validated
   *   -> '_errors': Array of errors, any more found will be pushed to here 
   *   -> '_ruleCallback': function which will check if _input is valid, defaults to 'true'
   * Returns: T/F, wether _input was valid
   *****************************************************************/
    static validateInput(_input, _errors = [], _ruleCallback = (_input, _errors) => { return true }) {
        const VALID = _ruleCallback(_input, _errors);
        return VALID;
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
    static createElement(_tag, _attributes = {}, _children = []) {
        const ELEMENT = document.createElement(_tag);
        Object.assign(ELEMENT, _attributes);
        _children.forEach(_child => ELEMENT.append(_child));
        return ELEMENT;
    }
}   