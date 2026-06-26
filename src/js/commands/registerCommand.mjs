import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    REGISTRATION_CACHE,
    PAGE_MANAGER_INSTANCE_KEY,
    HOME_PAGE_CLASS_KEY,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

/*****************************************************************
* Description:
*   -> Attempts to cache _input to REFERENCES under _field
* Params:
*   -> '_field': Name of key in REFERENCES to cache to
*   -> '_input': Data to cache
*   -> '_private': Wether the cache should be marked as private or public for database writing
*****************************************************************/
async function tryPutCache(_field, _input, _private = true) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    const AUTHED = isAuthed();
    const ERRORS = [];
    const IS_VALID_INPUT = Utils.validateInput(_input, ERRORS, Utils[`${_field.toUpperCase()}_VALIDATION_RULE`]);
    let msg;
    if (AUTHED) {
        if (IS_VALID_INPUT) {
            msg = `Updated User's ${_field}: ${_input}`;
            REFERENCES[REGISTRATION_CACHE][_field] = { val: _input, private: _private };
        } else {
            msg = `${_field} Validation Error: See Above For Details`;
            ERRORS.forEach(_error => TERMINAL.printStr(_error));
        }
    } else {
        msg = 'Permission Error: Login Required';
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'register name -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function registerName(_args) {
    return tryPutCache('name', _args[0], false);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'register age -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function registerAge(_args) {
    return tryPutCache('age', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'register phone -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function registerPhone(_args) {
    return tryPutCache('phone', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'register colour -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function registerColour(_args) {
    return tryPutCache('colour', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'register confirm'
*   -> Collects and collates cached data and writes it to Firebase
*****************************************************************/
export async function registerConfirm() {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    const AUTHED = isAuthed();
    const CACHE = REFERENCES[REGISTRATION_CACHE];
    let msg;
    const ERRORS = [];
    if (AUTHED) {
        const VALIDATION = await validateData(CACHE);
        if (VALIDATION.valid) {
            const UID = FBIO.authedUser().uid;
            const PRIVATE = {};
            const PUBLIC = {};
            for (const [_key, _value] of Object.entries(CACHE)){
                if (_value.private) {
                    PRIVATE[_key] = _value.val;
                } else {
                    PUBLIC[_key] = _value.val;
                }
            }
            await FBIO.update(`users/${UID}`, {
                private: PRIVATE,
                public: PUBLIC
            }, async () => {
                msg = "Finishing Registration... Please Stand By";
                REFERENCES[PAGE_MANAGER_INSTANCE_KEY].displayPage(REFERENCES[HOME_PAGE_CLASS_KEY]);
            }, async (_error) => {
                msg = `Database Error: ${_error}`;
            });
        } else {
            msg = "Validation Error: Could Not Complete Registration, See Above";
            VALIDATION.errors.forEach(_error => TERMINAL.printStr(_error));
        }
    } else {
        msg = "Permission Error: Not Logged In";
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Mass validates all values within _data, following validation rules.
* Params:
    -> '_data': Obj of data to validate
*****************************************************************/
async function validateData(_data) {
    const ERRORS = [];
    const NAME = _data.name ?? {};
    const EMAIL = _data.email ?? {};
    const PFP = _data.pfp ?? {};
    const AGE = _data.age ?? {};
    const COLOUR = _data.colour ?? {};
    const PHONE = _data.phone ?? {};
    let validName = Utils.validateInput(NAME.val, ERRORS, Utils.NAME_VALIDATION_RULE);
    let validEmail = Utils.validateInput(EMAIL.val, ERRORS, Utils.EMAIL_VALIDATION_RULE);
    let validPfp = Utils.validateInput(PFP.val, ERRORS, Utils.PFP_VALIDATION_RULE);
    let validAge = Utils.validateInput(AGE.val, ERRORS, Utils.AGE_VALIDATION_RULE);
    let validColour = Utils.validateInput(COLOUR.val, ERRORS, Utils.COLOUR_VALIDATION_RULE);
    let validPhone = Utils.validateInput(PHONE.val, ERRORS, Utils.PHONE_VALIDATION_RULE);
    const OBJ = {
        valid: validName && validEmail && validPfp && validAge && validColour && validPhone,
        errors: ERRORS
    };
    return OBJ;
}

/*****************************************************************
* Description:
*   -> Checks if the user is authed
*****************************************************************/
async function isAuthed() {
    const USER = REFERENCES[FIREBASE_IO_INSTANCE_KEY].authedUser();
    return USER != null;
}