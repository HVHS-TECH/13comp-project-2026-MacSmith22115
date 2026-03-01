export const PAGE_MANAGER_INSTANCE_KEY = 'page_manager_instance'; // Instance of 'PageManager.mjs'
export const FIREBASE_IO_INSTANCE_KEY = 'firebase_io_instance'; // Instance of 'FirebaseIO.mjs'
export const LOGIN_PAGE_CLASS_KEY = 'login_page_class'; // Class Reference of 'LoginPage.mjs'
export const HOME_PAGE_CLASS_KEY = 'home_page_class'; // Class Reference of 'HomePage.mjs'
export const REGISTRATION_PAGE_CLASS_KEY = 'registration_page'; // Class Reference of 'RegistrationPage.mjs'

// Object containing references to classes, instances and data.
export const REFERENCES = {
    [PAGE_MANAGER_INSTANCE_KEY] : null,
    [FIREBASE_IO_INSTANCE_KEY] : null,
    [LOGIN_PAGE_CLASS_KEY] : null,
    [HOME_PAGE_CLASS_KEY] : null,
    [REGISTRATION_PAGE_CLASS_KEY] : null,
}