import {
    CREATE_PROCESS_REQUEST,
    CREATE_PROCESS_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CLEAR_CREATE_ERROR_MESSAGE,
    CLOSE_CREATE_MODAL
} from '../constants/createProcess';

const updateProcessCreate = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            loading: false,
            createProcessError: null,
            isCreated: false,
        };
    }
    switch (action.type) {
        case CREATE_PROCESS_REQUEST:
            return {...state.processCreate, loading: true, isCreated: false};
        case CREATE_PROCESS_SUCCESS:
            return {
                loading: false,
                createProcessError: null,
                isCreated: true,
            };
        case CREATE_PROCESS_FAILURE:
            return {loading: false, createProcessError: action.payload, isCreated: false};
        case CLEAR_CREATE_ERROR_MESSAGE:
            return {
                ...state.processCreate,
                createProcessError: null,
                isCreated: false,
            };
        case CLOSE_CREATE_MODAL:
            return {loading: false, createProcessError: null, isCreated: false};
        default:
            return state.processCreate;
    }
};

export default updateProcessCreate;
