import {
    GET_TASKLIST_REQUEST,
    GET_TASKLIST_FAILURE,
    GET_TASKSDATA_SUCCESS,
    DELETE_TASK,
    SET_CURRENT_ITEMS_PART,
    SET_LOADING
} from '../constants/tasklist';

const addDataToTasks = (data) => {
    let fullTasklistData = data.tasklistData;
    fullTasklistData.forEach(task => {
        const chosenTaskVariables = data.tasksVariables && data.tasksVariables.find(el => el.id === task.id);
        for (let key in chosenTaskVariables) {
            if (chosenTaskVariables.hasOwnProperty(key)) {
                task[key] = chosenTaskVariables[key];
            }
        }
        if (data.tasksXml) {
        const neededXml = data.tasksXml.find(el => el.id === task.id).taskXmlData.firstElementChild;
        if (neededXml !== undefined) {
            task.nameFromXml = Array.from(neededXml.attributes).find(elem => elem.nodeName === "name").nodeValue;
        }
    }
        return task;
    })
    return fullTasklistData;
};

const deleteTaskById = (id, stateList) => {
    let filteredStateList = stateList.filter(el => el.id !== id);
    return [...filteredStateList];
}

const updateTasklist = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            loading: false,
            error: null,
            currentItemsPart: 1,
            currentPartsPortion: 1,
            list: [],
        };
    }
    switch (action.type) {
        case GET_TASKLIST_REQUEST:
            return {...state.tasklist, loading: true};
        case GET_TASKSDATA_SUCCESS:
            return {
                ...state.tasklist,
                // loading: false,
                error: null,
                currentItemsPart: 1,
                currentPartsPortion: 1,
                list: addDataToTasks(action.payload),
            };
        case SET_LOADING:
            return {
                ...state.tasklist,
                loading: action.payload,
            };
        case SET_CURRENT_ITEMS_PART:
            return {
                ...state.tasklist,
                loading: false,
                error: null,
                currentItemsPart: action.payload.part,
                currentPartsPortion: action.payload.portion
            };
        // case CREATE_TASK_SUCCESS:
        //     return {
        //         ...state.tasklist,
        //         loading: false,
        //         error: null,
        //         list: [...state.tasklist.list, action.payload],
        //     };
        case DELETE_TASK:
            return {
                loading: false,
                error: null,
                currentItemsPart: 1,
                currentPartsPortion: 1,
                list: deleteTaskById(action.payload, state.tasklist.list),
            };
        case GET_TASKLIST_FAILURE:
            return {...state.tasklist, loading: false, error: action.payload};
        default:
            return state.tasklist;
    }
};

export default updateTasklist;
