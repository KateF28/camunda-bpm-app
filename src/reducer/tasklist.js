import {
    GET_TASKLIST_REQUEST,
    GET_TASKLIST_FAILURE,
    GET_TASKSDATA_SUCCESS,
    CREATE_TASK_SUCCESS,
    DELETE_TASK,
    SET_CURRENT_ITEMS_PART
} from '../constants/tasklist';

const addVariablesToTasks = ({tasklistData, tasksVariables}) => {
    tasklistData.forEach(task => {
        let chosenTask = tasksVariables.find(el => el.id === task.id);
        for (let key in chosenTask) {
            if (chosenTask.hasOwnProperty(key)) {
                task[key] = chosenTask[key]
            }
        }
        return task;
    })
    return [...tasklistData];
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
                loading: false,
                error: null,
                currentItemsPart: 1,
                currentPartsPortion: 1,
                list: addVariablesToTasks(action.payload),
            };
        case SET_CURRENT_ITEMS_PART:
            return {
                ...state.tasklist,
                loading: false,
                error: null,
                currentItemsPart: action.payload.part,
                currentPartsPortion: action.payload.portion
            };
        // case SET_CURRENT_PARTS_PORTION:
        //     return {
        //         ...state.tasklist,
        //         loading: false,
        //         error: null,
        //         currentPartsPortion: action.payload
        //     };
        case CREATE_TASK_SUCCESS:
            return {
                ...state.tasklist,
                loading: false,
                error: null,
                list: [...state.tasklist.list, action.payload],
            };
        case DELETE_TASK:
            return {
                // ...state.tasklist,
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
