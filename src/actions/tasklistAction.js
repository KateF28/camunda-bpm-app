import {GET_TASKLIST_REQUEST, GET_TASKLIST_FAILURE, GET_TASKSDATA_SUCCESS, SET_CURRENT_ITEMS_PART} from '../constants/tasklist';

const getTasksVariablesSuccess = values => {
    return {
        type: GET_TASKSDATA_SUCCESS,
        payload: values,
    };
};

const getTasklistFailure = error => {
    return {
        type: GET_TASKLIST_FAILURE,
        payload: error.message,
    };
};

const setCurrentItemsPart = (part, portion) => {
    return {
        type: SET_CURRENT_ITEMS_PART,
        payload: {part, portion},
    };
}

const getTasklistData = (service, dispatch) => assignee => {
    dispatch({type: GET_TASKLIST_REQUEST});
    service.getTasklist(assignee).then(result => {
        result && service.getTasksVariables(result.data).then(res => {
            // console.log("vars", res)
            dispatch(getTasksVariablesSuccess({
                tasklistData: result.data,
                tasksVariables: res,
            }));
        })
    }).catch(err => {
            dispatch(getTasklistFailure(err));
        });
};

export { getTasklistData, setCurrentItemsPart };
