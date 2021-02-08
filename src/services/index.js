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
            return task;
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

    getTasksXml = tasks => {
        const fetchXmlInfo = async (url, id) => {
                const info = await axios.get(url);
                const oParser = new DOMParser();
                const taskXmlData = oParser.parseFromString(info.data.bpmn20Xml, "application/xml").documentElement;
                return {id, taskXmlData};
        }

        const fetchTaskInfo = async (arr) => {
            const requests = arr.map(item => {
                const url = item.tenantId ? this._baseUrl + `engine/default/process-definition/key/${item.processKey}/tenant-id/${item.tenantId}/xml`
                    : this._baseUrl + `engine/default/process-definition/key/${item.processKey}/xml`;
                return fetchXmlInfo(url, item.id).then((res) => res);
            })
            return Promise.all(requests);
        }

        let arrayOfProcessKeysAndTasksIds = [];
        tasks.forEach(task => {
            let processKey = task.processDefinitionId.substring(0, task.processDefinitionId.indexOf(':'));
            arrayOfProcessKeysAndTasksIds.push({processKey, id: task.id, tenantId: task.tenantId});
        });
        return fetchTaskInfo(arrayOfProcessKeysAndTasksIds).then(res => res);
    }

    getXml = (processKey, tenantId) => {
        return axios.get(tenantId ? this._baseUrl + `engine/default/process-definition/key/${processKey}/tenant-id/${tenantId}/xml`
            : this._baseUrl + `engine/default/process-definition/key/${processKey}/xml`).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    postCompleteTask = (id, formData) => {
        const variables = {};
        formData.forEach(el => {
            if (el.type === "file") {
                if (!el.isFile && el.fileName !== "") {
                    variables[el.id] = {
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
                    variables[el.id] = {value: el.value, type: "string"};
                }
            } else if (el.type === "string") {
                if (el.value !== "") {
                    variables[el.id] = {value: el.value.trim(), type: el.type};
                }
            } else if (el.type === "long" || el.type === "double") {
                if (el.value !== "") {
                    variables[el.id] = {value: Number(el.value), type: el.type};
                }
            } else if (el.type === "date") {
                const dateArray = el.value.split('-');
                variables[el.id] = {value: `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}T00:00:00.000+0000`, type: el.type};
            } else {
                variables[el.id] = {value: el.value, type: el.type};
            }
        });
        // console.dir(variables)
        return axios.post(this._baseUrl + `engine/default/task/${id}/complete`, {variables}).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    getProcessesList = () => {
        return axios.get(this._baseUrl + 'engine/default/process-definition?latestVersion=true').catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    postCreateProcess = (formData, processKey, businessKey) => {
        const variables = {};
        formData.forEach(el => {
            if (el.type === "file") {
                if (el.fileName !== "") {
                    variables[el.id] = {
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
                    variables[el.id] = {value: el.value, type: "string"};
                }
            } else if (el.type === "string") {
                if (el.value !== "") {
                    variables[el.id] = {value: el.value.trim(), type: el.type};
                }
            } else if (el.type === "long" || el.type === "double") {
                if (el.value !== "") {
                    variables[el.id] = {value: Number(el.value), type: el.type};
                }
            } else if (el.type === "date") {
                const dateArray = el.value.split('-');
                variables[el.id] = {value: `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}T00:00:00.000+0000`, type: el.type};
            } else {
                variables[el.id] = {value: el.value, type: el.type};
            }
        });
        // console.dir(variables);
        return axios.post(this._baseUrl + `engine/default/process-definition/key/${processKey}/start`, {
            variables,
            businessKey,
            withVariablesInReturn: true
        }).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }

    // getTaskData = id => {
    //     return axios.get(this._baseUrl + `engine/default/task?processInstanceId=${id}`).catch(error => {
    //         const err = (new Error('Something went wrong'));
    //         err.data = error;
    //         throw err;
    //     })
    // }

    getTaskFileContent = (id, fileVariableId) => {
        return axios.get(this._baseUrl + `engine/default/task/${id}/variables/${fileVariableId}/data`, {
            responseType: 'arraybuffer'
        }).catch(error => {
            const err = (new Error('Something went wrong'));
            err.data = error;
            throw err;
        })
    }
}

export default Services;
