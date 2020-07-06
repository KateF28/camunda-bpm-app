import React, {Component} from 'react'
import {connect} from 'react-redux';
import FileBase64 from 'react-file-base64';
import {Button, Header, Message, Modal, Loader, Dimmer, Form, Input} from 'semantic-ui-react';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {
    postCompleteTask,
    clearErrorMessage,
    closeTask,
    getXml,
    getTaskAppData,
    openTask
} from '../../actions/taskCompleteAction';

class ModalCompleteContainer extends Component {
    state = {modalOpen: false, isValidationError: false};
    formDataFields;

    getFormValues = (formDataFields, formValues = []) => {
        [...formDataFields].forEach(el => {
            let fieldData = {};
            fieldData.id = el.attributes.id.value;
            if (el.attributes.type.value === "string") {
                fieldData.value = this.state.task[fieldData.id] ? this.state.task[fieldData.id].value : '';
            }
            if (el.attributes.type.value === "long") {
                fieldData.value = this.state.task[fieldData.id] ? this.state.task[fieldData.id].value : 0;
                if (this.state.task[fieldData.id].value.toString().includes(".")) {
                    fieldData.longValidationErr = "Please enter an integer";
                    // isValidationError = true; //make submit button not active
                } else {
                    fieldData.longValidationErr = null;
                }
            }
            if (el.attributes.type.value === "double") {
                fieldData.value = this.state.task[fieldData.id] ? this.state.task[fieldData.id].value : 0.00;
                if (!/^-?[0-9]+[.][0-9]{2}$/.test(this.state.task[fieldData.id].value)) {
                    fieldData.doubleValidationErr = "Please enter a number with two decimal places";
                    // isValidationError = true; //make submit button not active
                } else {
                    fieldData.doubleValidationErr = null;
                }
            }
            if (el.attributes.type.value === "file") {
                fieldData.value = '';
                if (this.state.task[fieldData.id] !== undefined && this.state.task[fieldData.id].type === "File") {
                    fieldData.fileName = this.state.task[fieldData.id].valueInfo.filename;
                    fieldData.isFile = true;
                } else {
                    fieldData.fileName = "";
                    fieldData.isFile = false;
                }
            }
            if (el.attributes.type.value === "boolean") {
                fieldData.value = this.state.task[fieldData.id] ? this.state.task[fieldData.id].value : false;
            }
            if (el.attributes.type.value === "enum") {
                const enumValues = [...el.attributes.id.ownerElement.children];
                fieldData.values = [];
                enumValues.forEach(el => {
                    fieldData.values.push(el.attributes);
                })
                let defaultValueName;
                if (el.attributes.defaultValue) {
                    const defaultValue = el.attributes.defaultValue.value;
                    defaultValueName = defaultValue.substring(defaultValue.indexOf('{') + 1, defaultValue.indexOf('}'));
                }
                fieldData.value = this.state.task[defaultValueName] ? this.state.task[defaultValueName].value : fieldData.values[0].id.value;
            }
            fieldData.type = el.attributes.type.value;
            fieldData.label = el.attributes.label.value;
            formValues.push(fieldData);
        });
        // console.log("formValues", formValues);
        return formValues;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.openedTask !== prevProps.openedTask && prevProps.openedTask === undefined) {
            this.setState({
                ...this.state,
                task: this.props.openedTask
            });
        }
        if (prevProps.xmlData !== this.props.xmlData && prevProps.xmlData === null) {
            this.formDataFields = [...this.props.xmlData].find(el => el.nodeName === "bpmn:extensionElements").children[0].children;
            this.setState({
                ...this.state,
                modalOpen: true,
                data: this.getFormValues(this.formDataFields),
                isValidationError: false
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isComplete || (nextProps.xmlData !== this.props.xmlData && nextProps.xmlData === null)) {
            this.setState({modalOpen: false, isValidationError: false});
            this.props.closeTask();
            return false;
        }
        return true;
    }

    handleOpen = () => {
        this.props.openTask(this.props.task)
        this.props.getXml(this.props.procDefinitionKey, this.props.taskDefinitionKey);
        this.setState({modalOpen: true, isValidationError: false});
    }

    handleClose = () => {
        this.setState({modalOpen: false, isValidationError: false});
        this.props.closeTask();
    }

    handleChange = (event, id, type, value) => {
        const formFields = this.state.data;
        let isValidationError;
        formFields.forEach(field => {
            if (field.id === id && event.target.name === "string") {
                field.value = event.target.value.toString();
            }
            if (field.id === id && type && type === "boolean") {
                field.value = !value;
            }
            if (field.id === id && event.target.name === "long") {
                if (isNaN(event.target.value) || event.target.value.toString().includes(" ")) {
                    field.value = event.target.value;
                    field.longValidationErr = "Please enter a number";
                    isValidationError = true;
                } else if (event.target.value.toString().includes(".")) {
                    field.value = event.target.value;
                    field.longValidationErr = "Please enter an integer";
                    isValidationError = true;
                } else {
                    field.value = event.target.value;
                    field.longValidationErr = null;
                    isValidationError = false;
                }
            }
            if (field.id === id && event.target.name === "double") {
                if (isNaN(event.target.value) || event.target.value === "-0.00" || event.target.value.toString().includes(" ")) {
                    field.value = event.target.value;
                    field.doubleValidationErr = "Please enter a number";
                    isValidationError = true;
                } else if (!/^-?[0-9]+[.][0-9]{2}$/.test(event.target.value)) {
                    field.value = event.target.value;
                    field.doubleValidationErr = "Please enter a number with two decimal places";
                    isValidationError = true;
                } else {
                    field.value = event.target.value;
                    field.doubleValidationErr = null;
                    isValidationError = false;
                }
            }
            if (field.id === id && type && type === "enum") {
                // console.log("select e.target.value", event.target.value)
                field.value = event.target.value;
            }
            return field;
        });
        this.setState({...this.state, isValidationError, data: [...formFields]});
    }

    handleFileInputChange = (e, id) => {
        const fileValueBase64 = e.base64.split(',')[1];
        const formFieldsData = this.state.data;
        formFieldsData.forEach(field => {
            if (field.id === id) {
                field.value = fileValueBase64;
                field.fileName = e.name;
            }
            return field;
        });
        this.setState({...this.state, data: [...formFieldsData]});
    }

    handleDownloadFile = (e, fileName) => {
        e.preventDefault();
        this.props.getTaskAppData(this.state.task.id, fileName)
    }

    handleSubmit = event => {
        this.props.completeTask(this.state.task.id, this.state.data)
        event.preventDefault();
    }

    render() {
        const {loading, completeTaskError, clearErrorMessage} = this.props;
        if (completeTaskError) {
            setTimeout(() => clearErrorMessage(), 4000);
        }
        return (
            <Modal trigger={<Button color="blue" onClick={this.handleOpen}>Open</Button>}
                   open={this.state.modalOpen}
                   onClose={this.handleClose} closeIcon>
                <Header color="blue" icon='check circle outline' content='Complete Task'/>
                <Modal.Content>
                    {loading && <Dimmer active inverted><Loader inverted/></Dimmer>}
                    {this.state.data && <Form onSubmit={this.handleSubmit} error>
                        {this.state.data.map(el => {
                            if (el.type === "string" && el.id.toLowerCase().includes("comment")) {
                                return (<Form.TextArea key={el.id}
                                                       label={el.label}
                                                       name={el.type}
                                                       placeholder={el.label}
                                                       value={el.value}
                                                       onChange={e => this.handleChange(e, el.id)}/>)
                            } else if (el.type === "string") {
                                return (<Form.Field key={el.id} required fluid width={8}
                                                    control={Input}
                                                    label={el.label}
                                                    name={el.type}
                                                    placeholder={el.label}
                                                    value={el.value}
                                                    onChange={e => this.handleChange(e, el.id)}
                                />)
                            } else if (el.type === "long") {
                                return (<Form.Field key={el.id} required fluid width={8}
                                                    control={Input}
                                                    label={el.label}
                                                    name={el.type}
                                                    placeholder="0"
                                                    value={el.value}
                                                    error={el.longValidationErr}
                                                    onChange={e => this.handleChange(e, el.id)}
                                />)
                            } else if (el.type === "double") {
                                return (<Form.Field key={el.id} required fluid width={8}
                                                    control={Input}
                                                    label={el.label}
                                                    name={el.type}
                                                    placeholder="0.00"
                                                    value={el.value}
                                                    error={el.doubleValidationErr}
                                                    onChange={e => this.handleChange(e, el.id)}
                                />)
                            } else if (el.type === "boolean") {
                                return (<Form.Checkbox key={el.id} checked={el.value}
                                                       label={el.label[0].toUpperCase() + el.label.slice(1)}
                                                       name={el.type}
                                                       onChange={e => this.handleChange(e, el.id, el.type, el.value)}
                                />)
                            } else if (el.type === "file") {
                                return (<div key={el.id}><label className="label">{el.label}</label>
                                    {el.isFile ? <a className="complete__file-link"
                                                    download={el.fileName}
                                                    href={el.fileName}
                                                    onClick={e => this.handleDownloadFile(e, el.fileName)}>{el.fileName}</a> :
                                        <label key={el.id} className="form__file-input-label">
                                            <FileBase64 multiple={false}
                                                        onDone={e => this.handleFileInputChange(e, el.id)}/>
                                            {(el.fileName !== "") ? el.fileName : "Choose a file"}
                                        </label>}
                                </div>)
                            } else if (el.type === "enum") {
                                return (<Form.Field key={el.id} value={el.value} label={el.label} name={el.id}
                                                    onChange={e => this.handleChange(e, el.id, el.type)}
                                                    control='select'>
                                    {el.values.map(elem => <option key={elem.id.value}
                                                                   value={elem.id.value}>{elem.name.value}</option>)}
                                </Form.Field>)
                            } else {
                                return (<Form.Field key={el.id} required fluid width={8}
                                                    control={Input}
                                                    label={el.label}
                                                    name={el.type}
                                                    placeholder=""
                                                    value={el.value}
                                                    onChange={e => this.handleChange(e, el.id)}
                                />)
                            }
                        })}
                        {this.state.isValidationError ? <Form.Field
                            control={Button}
                            color="blue"
                            floated='right'
                            className="modalButton"
                            content='Complete' disabled
                        /> : <Form.Field
                            control={Button}
                            color="blue"
                            floated='right'
                            className="modalButton"
                            content='Complete'
                        />}
                    </Form>}
                    {completeTaskError && <Message
                        error
                        header='An error occurred'
                        content={completeTaskError}
                    />}
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = ({taskComplete: {loading, isComplete, completeTaskError, xmlData, openedTask}}) => {
    return {
        loading,
        xmlData,
        isComplete,
        completeTaskError,
        openedTask
    };
};

const mapDispatchToProps = (dispatch, {services}) => {
    return {
        openTask: task => dispatch(openTask(task)),
        getXml: (procDefinitionKey, taskDefinitionKey) => getXml(services, dispatch)(procDefinitionKey, taskDefinitionKey),
        getTaskAppData: (id, fileName) => getTaskAppData(services, dispatch)(id, fileName),
        completeTask: (id, formData) => postCompleteTask(services, dispatch)(id, formData),
        clearErrorMessage: () => dispatch(clearErrorMessage()),
        closeTask: () => dispatch(closeTask())
    };
};


export default compose(withServices(), connect(mapStateToProps, mapDispatchToProps))(ModalCompleteContainer);
