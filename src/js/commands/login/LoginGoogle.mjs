import {REFERENCES, PAGE_MANAGER_INSTANCE_KEY} from '../../core/ReferenceStorage.mjs';

export default async function (params) {
    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().attemptLogin();
    return 'Login w Google';
}