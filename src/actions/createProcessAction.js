import {
    CREATE_PROCESS_REQUEST,
    CREATE_PROCESS_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CLEAR_CREATE_ERROR_MESSAGE,
    CREATE_PROCESS_UPDATE_STATE,
    GET_START_EVENT_XML_SUCCESS
} from '../constants/createProcess';
// import {CREATE_TASK_SUCCESS} from '../constants/tasklist'

const createProcessFailure = error => {
    return {
        type: CREATE_PROCESS_FAILURE,
        payload: error.message,
    };
};

// const createTaskSuccess = (variables, taskData) => {
//     return {
//         type: CREATE_TASK_SUCCESS,
//         payload: {...taskData, ...variables},
//     };
// };

const createProcessUpdateState = () => {
    return {
        type: CREATE_PROCESS_UPDATE_STATE
    };
}

const clearCreateErrorMessage = () => {
    return {
        type: CLEAR_CREATE_ERROR_MESSAGE
    };
}

const getStartEventXmlSuccess = startEventXml => {
    return {
        type: GET_START_EVENT_XML_SUCCESS,
        payload: startEventXml
    };
};

const createProcess = (service, dispatch) => (data, processKey, businessKey) => {
    dispatch({type: CREATE_PROCESS_REQUEST});
    service.postCreateProcess(data, processKey, businessKey).then(res => {
        dispatch({type: CREATE_PROCESS_SUCCESS});
        // console.dir(res.status);
        // res && service.getTaskData(res.data.id).then(result => {
        //     dispatch(createTaskSuccess(res.data.variables, result.data[0]));
        // });
    }).catch(err => {
        dispatch(createProcessFailure(err.data));
    });
};

const getStartEventXml = (service, dispatch) => procDefinitionKey => {
    dispatch({type: CREATE_PROCESS_REQUEST});
    service.getXml(procDefinitionKey).then(res => {
        let oParser = new DOMParser();
        let xmlDoc = oParser.parseFromString(res.data.bpmn20Xml, "application/xml");
        let creatingProcessFormData = xmlDoc.documentElement.firstElementChild;
        // console.log("getStartEventXml", xmlDoc.documentElement);
        dispatch(getStartEventXmlSuccess(creatingProcessFormData));
    }).catch(err => {
        // console.dir(err.stack);
        err.data ? dispatch(createProcessFailure(err.data)) : dispatch(createProcessFailure(err));
    });
};

export {
    createProcess, clearCreateErrorMessage,
    createProcessUpdateState,
    getStartEventXml
};
