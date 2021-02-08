import {SET_LOADING, GET_TASKLIST_REQUEST, GET_TASKLIST_FAILURE, GET_TASKSDATA_SUCCESS, SET_CURRENT_ITEMS_PART} from '../constants/tasklist';

const getAditionalTasksDataSuccess = values => {
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
    let resultObj = {};
    service.getTasklist(assignee).then(result => {
        resultObj.tasklistData = result.data;
        return result.data;
    }).then(resultList => {
        return resultList && service.getTasksVariables(resultList).then(resVars => {
            resultObj.tasksVariables = resVars;
            return resVars;
        });
    }).then(res => service.getTasksXml(resultObj.tasklistData).then(resXml => {
        resultObj.tasksXml = resXml;
            dispatch(getAditionalTasksDataSuccess(resultObj));
            dispatch({type: SET_LOADING, payload: false});
            return resXml;
        })).catch(err => {
        console.log("err", err.message ? err.message : err);
        dispatch(getTasklistFailure(err))
    });
};

export { getTasklistData, setCurrentItemsPart };
