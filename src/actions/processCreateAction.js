import {
    CREATE_PROCESS_REQUEST,
    CREATE_PROCESS_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CLEAR_CREATE_ERROR_MESSAGE,
    CLOSE_CREATE_MODAL,
    CREATE_TASK_SUCCESS
} from '../constants/createProcess';

const createProcessFailure = error => {
    return {
        type: CREATE_PROCESS_FAILURE,
        payload: error.message,
    };
};

const createTaskSuccess = (variables, taskData) => {
    return {
        type: CREATE_TASK_SUCCESS,
        payload: {...taskData, ...variables},
    };
};

const closeCreateModal = () => {
    return {
        type: CLOSE_CREATE_MODAL
    };
}

const clearCreateErrorMessage = () => {
    return {
        type: CLEAR_CREATE_ERROR_MESSAGE
    };
}

const createProcess = (service, dispatch) => (data, processKey, businessKey) => {
    dispatch({type: CREATE_PROCESS_REQUEST});
    service.postCreateProcess(data, processKey, businessKey).then(res => {
        dispatch({type: CREATE_PROCESS_SUCCESS});
        res && service.getTaskData(res.data.id).then(result => {
            dispatch(createTaskSuccess(res.data.variables, result.data[0]));
        });
    }).catch(err => {
        dispatch(createProcessFailure(err.data));
    });
};

export {createProcess, clearCreateErrorMessage, closeCreateModal};
