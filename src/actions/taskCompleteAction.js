import {
    COMPLETE_TASK_REQUEST,
    COMPLETE_TASK_FAILURE,
    COMPLETE_TASK_SUCCESS,
    CLEAR_ERROR_MESSAGE,
    CLOSE_TASK,
    GET_XML_SUCCESS,
    GET_FILE_DATA_SUCCESS, OPEN_TASK
} from '../constants/completeTask';
import {DELETE_TASK} from '../constants/tasklist';
import {saveAs} from 'file-saver';
// import {Blob} from 'blob-polyfill';

const deleteTask = id => {
    return {
        type: DELETE_TASK,
        payload: id,
    };
};

const completeTaskFailure = error => {
    return {
        type: COMPLETE_TASK_FAILURE,
        payload: error.message,
    };
};

const openTask = task => {
    return {
        type: OPEN_TASK,
        payload: task
    };
}

const closeTask = () => {
    return {
        type: CLOSE_TASK
    };
};

const clearErrorMessage = () => {
    return {
        type: CLEAR_ERROR_MESSAGE
    };
};

const getXmlSuccess = xml => {
    return {
        type: GET_XML_SUCCESS,
        payload: xml
    };
};

const postCompleteTask = (service, dispatch) => (id, formData) => {
    dispatch({type: COMPLETE_TASK_REQUEST});
    service.postCompleteTask(id, formData).then(res => {
        // console.dir(res.status);
        dispatch({type: COMPLETE_TASK_SUCCESS});
        dispatch(deleteTask(id));
    }).catch(err => {
        // console.dir(err);
        err.data ? dispatch(completeTaskFailure(err.data)) : dispatch(completeTaskFailure(err));
    });
};

const getTaskAppData = (service, dispatch) => (id, fileName, fileVariableId) => {
    dispatch({type: COMPLETE_TASK_REQUEST});
    service.getTaskFileContent(id, fileVariableId).then(res => {
        let blob = new Blob([res.data]);
        saveAs(blob, fileName);
        dispatch({type: GET_FILE_DATA_SUCCESS});
    }).catch(err => {
        err.data ? dispatch(completeTaskFailure(err.data)) : dispatch(completeTaskFailure(err));
    });
};

const getXml = (service, dispatch) => (procDefinitionKey, taskDefinitionKey, tenantId) => {
    dispatch({type: COMPLETE_TASK_REQUEST});
    service.getXml(procDefinitionKey, tenantId).then(res => {
        const oParser = new DOMParser();
        const oXML = oParser.parseFromString(res.data.bpmn20Xml, "application/xml");
        const tasksData = Array.from(oXML.documentElement.firstElementChild.childNodes).filter(el => el.nodeName === "bpmn:userTask");
        const taskFormData = tasksData.find(el => Array.from(el.attributes)
            .find(elem => elem.nodeName === "id" && elem.nodeValue === taskDefinitionKey)).childNodes;
        dispatch(getXmlSuccess(taskFormData));
    }).catch(err => {
        err.data ? dispatch(completeTaskFailure(err.data)) : dispatch(completeTaskFailure(err));
    });
};

export {postCompleteTask, clearErrorMessage, closeTask, getXml, getTaskAppData, openTask};
