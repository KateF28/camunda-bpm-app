import updateTasklist from './tasklist';
import updateTaskComplete from './taskComplete';
import updateProcessCreate from './processCreate';

const rootReducer = (state, action) => {
    return {
        tasklist: updateTasklist(state, action),
        taskComplete: updateTaskComplete(state, action),
        processCreate: updateProcessCreate(state, action)
    };
};

export default rootReducer;
