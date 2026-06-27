import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    REGISTRATION_CACHE,
    TERMINAL_INSTANCE
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

/*****************************************************************
* Description:
*   -> Will attempt to call upon FBIO to read Firebase for the user's Detail
*****************************************************************/
async function attemptGet(_field, _private = true) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser(true);
    let msg;
    let read = null;
    if (USER != null) {
        const PRIVATE_PATH_MODIFIER = _private ? 'private' : 'public';
        read = await FBIO.read(`users/${USER.uid.val}/${PRIVATE_PATH_MODIFIER}/${_field}`);
        msg = `Read User's ${_field}: ${read}`;
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return { msg, read };
}

/*****************************************************************
* Description:
*   -> Will attempt to call upon FBIO to set the user's detail to Firebase
*****************************************************************/
async function attemptSet(_field, _data, _private = true) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const USER = FBIO.authedUser(true);
    const ERRORS = [];
    const IS_VALID_INPUT = Utils.validateInput(_data, ERRORS, Utils[`${_field.toUpperCase()}_VALIDATION_RULE`]);
    let msg;
    const PRIVATE_PATH_MODIFIER = _private ? 'private' : 'public';
    if (USER != null) {
        if (IS_VALID_INPUT) {
            await FBIO.update(`users/${USER.uid.val}/${PRIVATE_PATH_MODIFIER}`, {
                [_field]: _data
            })
            msg = `Updated User's ${_field}: ${_data}`;
        } else {
            ERRORS.forEach(_error => REFERENCES[TERMINAL_INSTANCE].printStr(_error));
            msg = `${_field} Validation Error: See Above For Details`;
        }
    } else {
        msg = 'Login Error: Currently Not Logged In';
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get name'
*****************************************************************/
export async function getName() {
    return (await attemptGet('name', false)).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get email'
*****************************************************************/
export async function getEmail() {
    return (await attemptGet('email')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get pfp'
*****************************************************************/
export async function getPfp() {
    return (await attemptGet('pfp', false)).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get age'
*****************************************************************/
export async function getAge() {
    return (await attemptGet('age')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get colour'
*****************************************************************/
export async function getColour() {
    return (await attemptGet('colour')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details get phone'
*****************************************************************/
export async function getPhone() {
    return attemptGet('phone').msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set name -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setName(_args) {
    return attemptSet('name', _args[0], false);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set age -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setEmail(_args) {
    return attemptSet('email', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set pfp -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setPfp(_args) {
    return attemptSet('pfp', _args[0], false);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set age -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setAge(_args) {
    return attemptSet('age', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set colour -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setColour(_args) {
    return attemptSet('colour', _args[0]);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'details set phone -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setPhone(_args) {
    return attemptSet('phone', _args[0]);
}
