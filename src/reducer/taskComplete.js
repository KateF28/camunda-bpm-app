import {
    COMPLETE_TASK_REQUEST,
    COMPLETE_TASK_FAILURE,
    COMPLETE_TASK_SUCCESS,
    CLEAR_ERROR_MESSAGE,
    CLOSE_TASK,
    GET_FILE_DATA_SUCCESS,
    GET_XML_SUCCESS,
    OPEN_TASK
} from '../constants/completeTask';

const updateTaskComplete = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            loading: false,
            xmlData: null,
            completeTaskError: null,
            isComplete: false,
            openedTask: undefined
        };
    }
    switch (action.type) {
        case OPEN_TASK:
            return {...state.taskComplete, isComplete: false, completeTaskError: null, openedTask: action.payload};
        case COMPLETE_TASK_REQUEST:
            return {...state.taskComplete, loading: true, isComplete: false};
        case GET_FILE_DATA_SUCCESS:
            return {...state.taskComplete, loading: false};
        case COMPLETE_TASK_SUCCESS:
            return {
                ...state.taskComplete,
                loading: false,
                xmlData: null,
                completeTaskError: null,
                isComplete: true,
            };
        case GET_XML_SUCCESS:
            return {
                ...state.taskComplete,
                loading: false,
                xmlData: action.payload,
                completeTaskError: null,
                isComplete: false,
            };
        case COMPLETE_TASK_FAILURE:
            return {
                ...state.taskComplete,
                loading: false,
                completeTaskError: action.payload,
                isComplete: false
            };
        case CLEAR_ERROR_MESSAGE:
            return {
                ...state.taskComplete,
                completeTaskError: null,
                isComplete: false,
            };
        case CLOSE_TASK:
            return {
                loading: false,
                xmlData: null,
                completeTaskError: null,
                isComplete: false,
                openedTask: undefined
            };
        default:
            return state.taskComplete;
    }
};

export default updateTaskComplete;
