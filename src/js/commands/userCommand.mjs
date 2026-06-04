import {
    REFERENCES,
    FIREBASE_IO_INSTANCE_KEY,
    REGISTRATION_CACHE,
    TERMINAL_INSTANCE,
    PAGE_MANAGER_INSTANCE_KEY,
    ADMIN_PAGE_CLASS_KEY
} from "../core/ReferenceStorage.mjs";
import Utils from "../core/Utils.mjs";

// TODO Validate Inputs

export async function listUsers(_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];

    let msg;

    const IS_ADMIN = await FBIO.isAuthedAdmin();

    if (IS_ADMIN) {
        const READ_RESULT = await FBIO.read('/users');
        const USERS = [];
        let i = 0;
        for (const [uid, data] of Object.entries(READ_RESULT)) {
            TERMINAL.printStr(`${i}:     ${data.public.name} : ${data.private.email}`);
            i++;
        }
        return 'No Other Users'
    } else {

    }
    return msg;
}

export async function selectUser(_args) {
    const FBIO = REFERENCES[FIREBASE_IO_INSTANCE_KEY];
    const PG_MANAGER = REFERENCES[PAGE_MANAGER_INSTANCE_KEY];
    const TERMINAL = REFERENCES[TERMINAL_INSTANCE];
    let msg;
    const IS_ADMIN = await FBIO.isAuthedAdmin();
    const IS_ADMIN_PG = PG_MANAGER.getMainPage().getId() === REFERENCES[ADMIN_PAGE_CLASS_KEY].ID;
    if (IS_ADMIN && IS_ADMIN_PG) {
        const READ_RESULT = await FBIO.read('/users');
        const SELECTED_UUID = Object.keys(READ_RESULT)[_args[0]];
        const SELECTED_USER = READ_RESULT[SELECTED_UUID];
        PG_MANAGER.getMainPage().selectedUser = SELECTED_USER;
        return `Selected User: ${SELECTED_USER.private.email}`;
    } else {

    }
    return msg;
}

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

export async function getName() {
    return (await attemptRead('name', false)).msg;
}

export async function getEmail() {
    return (await attemptRead('email')).msg;
}

export async function getPfp() {
    return (await attemptRead('pfp', false)).msg;
}

export async function getAge() {
    return (await attemptRead('age')).msg;
}

export async function getColour() {
    return (await attemptRead('colour')).msg;
}

export async function getPhone() {
    return (await attemptRead('phone')).msg;
}

export async function setName(_args) {
    return await attemptWrite('name', _args, false);
}

export async function setEmail(_args) {
    return await attemptWrite('email', _args);
}

export async function setPfp(_args) {
    return await attemptWrite('pfp', _args, false);
}

export async function setAge(_args) {
    return await attemptWrite('age', _args);
}

export async function setColour(_args) {
    return await attemptWrite('colour', _args);
}

export async function setPhone(_args) {
    return await attemptWrite('phone', _args);
}