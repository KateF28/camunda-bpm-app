import axios from 'axios';
import {ENDPOINT_API_BASE} from '../constants';
// import mockedTaskListResponse from './mockedData/mockedTaskListResponse.json';
// import {mockedTaskVariablesResponse} from './mockedData/mockedTaskVariablesResponse';

class Services {
    _baseUrl = ENDPOINT_API_BASE;

    getTasklist = assignee => {
        return new Promise((resolve, reject) => {
            resolve(
                axios.get(this._baseUrl + `engine/default/task?assignee=${assignee}`).then((res) => res)
                // mockedTaskListResponse //for testing
            )
            reject(new Error('Something went wrong'));
        });
    };

    getTasksVariables = tasks => {
        const fetchInfo = async (url, id) => {
            const info = await axios.get(url);
                        const task = {id};
            for (let key in info.data) {
                if (info.data.hasOwnProperty(key)) {
                    task[key] = info.data[key];
                }
            }
            return task
        }

        const fetchTaskInfo = async (taskIds) => {
            const requests = taskIds.map(taskId => {
                const url = this._baseUrl + `engine/default/task/${taskId}/variables`;
                return fetchInfo(url, taskId)
                    .then((res) => {
                        return res;
                    })
            })
            return Promise.all(requests);
        }

        let arrayOfTasksIds = [];
        tasks.forEach(task => {
            arrayOfTasksIds.push(task.id);
        });
        return fetchTaskInfo(arrayOfTasksIds).then(res => res);
        // return new Promise((resolve, reject) => { //for testing
        //     resolve(mockedTaskVariablesResponse)
        //     reject(new Error('Something went wrong'))
        // });
    }

    postCompleteTask = (id, formData) => {
        const completeTaskReqBodyVars = {};
        formData.forEach(el => {
            if (el.type === "file") {
                if (!el.isFile && el.fileName !== "") {
                    completeTaskReqBodyVars[el.id] = {
                        value: el.value,
                        type: el.type,
                        valueInfo: {
                            filename: el.fileName,
                            encoding: "Base64"
                        }
                    };
                }
            } else if (el.type === "enum") {
                if (el.value !== "") {
                    completeTaskReqBodyVars[el.id] = {value: el.value, type: "string"}; // +long +double
                }
            } else if (el.type === "string") {
                if (el.value !== "") {
                    completeTaskReqBodyVars[el.id] = {value: el.value.trim(), type: el.type};
                }
            } else {
                completeTaskReqBodyVars[el.id] = {value: el.value, type: el.type};
            }
        });
        // console.log("completeReqBodyVars", completeTaskReqBodyVars)
        return axios.post(this._baseUrl + `engine/default/task/${id}/complete`, {
            variables: completeTaskReqBodyVars
        }).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    getXml = processKey => {
        return axios.get(this._baseUrl + `process-definition/key/${processKey}/xml`).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    postCreateProcess = ({amount, customerName, fileValue, fileName}, processKey, businessKey) => {
        let requestBody;
        if (fileName) {
            requestBody = {
                variables:
                    {
                        customerName: {value: customerName, type: "String"},
                        warrantyAmount: {value: amount, type: "Long"},
                        warrantyApplication: {
                            value: fileValue,
                            type: "file",
                            valueInfo: {
                                filename: fileName,
                                encoding: "Base64"
                            }
                        }
                    },
                businessKey,
                withVariablesInReturn: true
            }
        } else {
            requestBody = {
                variables:
                    {
                        customerName: {value: customerName, type: "String"},
                        warrantyAmount: {value: amount, type: "Long"}
                    },
                businessKey,
                withVariablesInReturn: true
            }
        }
        return axios.post(this._baseUrl + `engine/default/process-definition/key/${processKey}/start`, requestBody).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    getTaskData = id => {
        return axios.get(this._baseUrl + `engine/default/task?processInstanceId=${id}`).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    getTaskFileContent = id => {
        return axios.get(this._baseUrl + `engine/default/task/${id}/variables/warrantyApplication/data`, {
            responseType: 'arraybuffer'
        }).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }
}

export default Services;
