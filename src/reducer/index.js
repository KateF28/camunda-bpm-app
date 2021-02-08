import updateTasklist from './tasklist';
import updateProcessesChoose from './processesChoose';
import updateTaskComplete from './taskComplete';
import updateProcessCreate from './processCreate';
import updateUsersLocaleData from './usersLocaleData';

const rootReducer = (state, action) => {
    return {
        usersLocaleData: updateUsersLocaleData(state, action),
        tasklist: updateTasklist(state, action),
        processesChoose: updateProcessesChoose(state, action),
        taskComplete: updateTaskComplete(state, action),
        processCreate: updateProcessCreate(state, action)
    };
};

export default rootReducer;
