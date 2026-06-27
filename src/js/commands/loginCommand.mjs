import { REFERENCES, PAGE_MANAGER_INSTANCE_KEY } from '../core/ReferenceStorage.mjs';

/*****************************************************************
* Description:
*   -> Called by running cmd 'login google'.
*   -> Attempts a login and auth via a google popup.
*****************************************************************/
export async function loginGoogle() {
    REFERENCES[PAGE_MANAGER_INSTANCE_KEY].getMainPage().attemptLogin();
    return 'Launching Login Portal';
}