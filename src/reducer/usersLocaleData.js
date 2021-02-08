import {UPDATE_USERS_LOCALE_DATA} from '../constants/usersLocaleData';
const getLocale = () => {
    const locale = localStorage.getItem('locale');
    return locale !== null ? locale : 'uk';
}
const setLocale = locale => {
    localStorage.setItem('locale', locale);
    return locale;
}

const updateUsersLocaleData = (state, action) => {
    if (typeof state === 'undefined') {
        return {locale: getLocale()};
    }
    switch (action.type) {
        case UPDATE_USERS_LOCALE_DATA:
            return {locale: setLocale(action.payload)};
        default:
            return state.usersLocaleData;
    }
};

export default updateUsersLocaleData;
