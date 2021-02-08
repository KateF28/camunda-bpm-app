import {UPDATE_USERS_LOCALE_DATA} from '../constants/usersLocaleData';

const getUsersLocaleData = locale => {
    return {
        type: UPDATE_USERS_LOCALE_DATA,
        payload: locale,
    };
};

export { getUsersLocaleData };
