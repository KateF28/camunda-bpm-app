import {
    GET_PROCESSES_REQUEST,
    GET_PROCESSES_FAILURE,
    GET_PROCESSES_SUCCESS,
    CLEAR_CHOOSE_PROCESSES_ERROR_MESSAGE,
    CLOSE_CHOOSE_PROCESSES_MODAL
} from '../constants/chooseProcess';

const updateProcessesChoose = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            loading: false,
            processes: [],
            chooseProcessError: null
        };
    }
    switch (action.type) {
        case GET_PROCESSES_REQUEST:
            return {
                ...state.processesChoose,
                loading: true
            };
        case GET_PROCESSES_SUCCESS:
            return {
                loading: false,
                processes: action.payload.filter(el => el.versionTag !== null),
                chooseProcessError: null
            };
        case GET_PROCESSES_FAILURE:
            return {
                ...state.processesChoose,
                loading: false,
                chooseProcessError: action.payload
            };
        case CLEAR_CHOOSE_PROCESSES_ERROR_MESSAGE:
            return {
                ...state.processesChoose,
                chooseProcessError: null
            };
        case CLOSE_CHOOSE_PROCESSES_MODAL:
            return {
                loading: false,
                processes: [],
                chooseProcessError: null
            };
        default:
            return state.processesChoose;
    }
};

export default updateProcessesChoose;
