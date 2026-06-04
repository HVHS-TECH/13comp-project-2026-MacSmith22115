import {REFERENCES, PAGE_MANAGER_INSTANCE_KEY} from '../core/ReferenceStorage.mjs';

export async function loginGoogle(_args) {
    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().attemptLogin();
    return 'Launching Login Portal';
}