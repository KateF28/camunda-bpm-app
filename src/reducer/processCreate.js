import {
    CREATE_PROCESS_REQUEST,
    CREATE_PROCESS_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CLEAR_CREATE_ERROR_MESSAGE,
    CREATE_PROCESS_UPDATE_STATE,
    GET_START_EVENT_XML_SUCCESS
} from '../constants/createProcess';

const updateProcessCreate = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            loading: false,
            xmlStartEventData: null,
            createProcessError: null,
            isCreated: false,
        };
    }
    switch (action.type) {
        case CREATE_PROCESS_REQUEST:
            return {...state.processCreate, loading: true, isCreated: false};
        case GET_START_EVENT_XML_SUCCESS:
            return {
                loading: false,
                xmlStartEventData: action.payload,
                createProcessError: null,
                isCreated: false,
            };
        case CREATE_PROCESS_SUCCESS:
            return {
                loading: false,
                xmlStartEventData: null,
                createProcessError: null,
                isCreated: true,
            };
        case CREATE_PROCESS_FAILURE:
            return {
                ...state.processCreate,
                loading: false,
                createProcessError: action.payload,
                isCreated: false
            };
        case CLEAR_CREATE_ERROR_MESSAGE:
            return {
                ...state.processCreate,
                createProcessError: null,
                isCreated: false,
            };
        case CREATE_PROCESS_UPDATE_STATE:
            return {loading: false, xmlStartEventData: null, createProcessError: null, isCreated: false};
        default:
            return state.processCreate;
    }
};

export default updateProcessCreate;
