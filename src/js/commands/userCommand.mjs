import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    REGISTRATION_CACHE,
    TERMINAL_INSTANCE,
    PAGE_MANAGER_INSTANCE_KEY,
    ADMIN_PAGE_CLASS_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

/*****************************************************************
* Description:
*   -> Called by running cmd 'user list'
*   -> Lists out ALL players names and emails, with an index of their position in the list
*****************************************************************/
export async function listUsers() {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    const IS_ADMIN = await FBIO.isAuthedAdmin();
    let msg = `Permission Error: You Must Be Admin to Use This`;
    if (IS_ADMIN) {
        const READ_RESULT = await FBIO.read('/users');
        const USERS = [];
        let i = 0;
        for (const [uid, data] of Object.entries(READ_RESULT)) {
            TERMINAL.printStr(`${i}:     ${data.public.name} : ${data.private.email}`);
            i++;
        }
        return 'No Other Users'
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user select -${input}'
*   -> Replace ${input} with user-passed argument
*   -> Selects a user and caches their data
*   -> _args[0] is the index associated with the user in 'user list'
* Params:
    -> '_args': Arr of Arguments, E.G ${input},
*****************************************************************/
export async function selectUser(_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    let msg = `Permision Error: You Must Be Admin to Use This`;
    const IS_ADMIN = await FBIO.isAuthedAdmin();
    const IS_ADMIN_PG = PG_MANAGER.getMainPage().getId() === REFERENCES[ADMIN_PAGE_CLASS_KEY].ID;
    if (IS_ADMIN && IS_ADMIN_PG) {
        const READ_RESULT = await FBIO.read('/users');
        const SELECTED_UUID = Object.keys(READ_RESULT)[_args[0]];
        const SELECTED_USER = READ_RESULT[SELECTED_UUID];
        PG_MANAGER.getMainPage().selectedUser = SELECTED_USER;
        return `Selected User: ${SELECTED_USER.private.email}`;
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Attempts to read Firebase for _field.
*   -> _private dictates the path to read.
* Params:
*   -> '_field': Field to read, E.G 'name', 'email', etc
*   -> '_private': T/F, Changes path to read from
*****************************************************************/
export async function attemptRead(_field, _private = true) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const IS_ADMIN = await FBIO.isAuthedAdmin();
    const IS_ADMIN_PG = PG_MANAGER.getMainPage().getId() === REFERENCES[ADMIN_PAGE_CLASS_KEY].ID;

    let msg;
    let read = null;

    if (IS_ADMIN && IS_ADMIN_PG) {
        const SELECTED_USER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().selectedUser;
        const PRIVATE_PATH_MODIFIER = _private ? 'private' : 'public';
        const UID = SELECTED_USER.public.uid;
        if (SELECTED_USER != null && SELECTED_USER != undefined) {
            read = await FBIO.read(`users/${UID}/${_private ? 'private' : 'public'}/${_field}`);
            msg = `Selected User's ${_field} Is ${read}`;
        }
    } else {
        msg = 'Permission Error: Admin Privileges Required';
    }
    return { msg, read };
}

/*****************************************************************
* Description:
*   -> Attemps to write _args[0] to _field in Firebase.
*   -> _private changes the path to write to.
* Params:
*   -> '_field': Name of obj key, E.G 'name', 'email', etc
*   -> '_args': Arr of which index0 is the data to write
*   -> '_private': T/F, changes path to write to
*****************************************************************/
export async function attemptWrite(_field, _args, _private = true) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const IS_ADMIN = FBIO.isAuthedAdmin();
    const IS_ADMIN_PG = PG_MANAGER.getMainPage().getId() === REFERENCES[ADMIN_PAGE_CLASS_KEY].ID;
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    const INPUT = _args[0];

    const ERRORS = [];
    const IS_VALID_INPUT = Utils.validateInput(INPUT, ERRORS, Utils[`${_field.toUpperCase()}_VALIDATION_RULE`]);

    let msg;
    if (!IS_VALID_INPUT) {
        msg = `${_field} Validation Error: See Above For Details`;
        ERRORS.forEach(_error => TERMINAL.printStr(_error));
    } else if (IS_ADMIN && IS_ADMIN_PG) {
        const SELECTED_USER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().selectedUser;
        await FBIO.update(`users/${SELECTED_USER.public.uid}/${_private ? 'private' : 'public'}`, {
            [_field]: _args[0]
        })
        msg = `Updated User's ${_field}: ${_args[0]}`;
    } else {
        msg = 'Permission Error: Admin Privileges Required';
    }
    return msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get name'
*****************************************************************/
export async function getName() {
    return (await attemptRead('name', false)).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get email'
*****************************************************************/
export async function getEmail() {
    return (await attemptRead('email')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get pfp'
*****************************************************************/
export async function getPfp() {
    return (await attemptRead('pfp', false)).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get age'
*****************************************************************/
export async function getAge() {
    return (await attemptRead('age')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get colour'
*****************************************************************/
export async function getColour() {
    return (await attemptRead('colour')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user get phone'
*****************************************************************/
export async function getPhone() {
    return (await attemptRead('phone')).msg;
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set name -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setName(_args) {
    return await attemptWrite('name', _args, false);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set email -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setEmail(_args) {
    return await attemptWrite('email', _args);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set pfp -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setPfp(_args) {
    return await attemptWrite('pfp', _args, false);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set age -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setAge(_args) {
    return await attemptWrite('age', _args);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set colour -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setColour(_args) {
    return await attemptWrite('colour', _args);
}

/*****************************************************************
* Description:
*   -> Called by running cmd 'user set phone -${input}'
*   -> Replace ${input} with user-passed argument
* Params:
    -> '_args': Arr of Arguments, E.G ${input}
*****************************************************************/
export async function setPhone(_args) {
    return await attemptWrite('phone', _args);
}