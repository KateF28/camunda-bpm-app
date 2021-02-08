import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux';
import FileBase64 from 'react-file-base64';
import {injectIntl} from "react-intl";
import {DateInput} from 'semantic-ui-calendar-react';
// import format from 'date-fns/format';
// eslint-disable-next-line
import moment from 'moment';
import 'moment/locale/uk';
import 'moment/locale/en-gb';
import {Grid, Button, Header, Message, Modal, Loader, Dimmer, Form, Input} from 'semantic-ui-react';
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
import {takeChangedFormValues} from "../../utils/takeChangedDynamicFormValues";
import {completeModalMessages} from './ModalCompleteContainerMessages';
import {validationMessages} from '../../utils/validationFormMessages';

class ModalCompleteContainer extends Component {
    state = {modalOpen: false, isValidationError: false};
    formDataFields;

    getFormValues = (formDataFields, formValues = []) => {
        // console.dir(formDataFields);
        Array.from(formDataFields).filter(el => el.nodeName === "camunda:formField").forEach(el => {
            let attributes = Array.from(el.attributes);
            let type = attributes.find(el => el.nodeName === "type").nodeValue;
            let id = attributes.find(el => el.nodeName === "id").nodeValue;
            let label = attributes.find(el => el.nodeName === "label").nodeValue;
            const defaultValueString = attributes.find(el => el.nodeName === "defaultValue");
            let fieldData = {};
            fieldData.type = type;
            fieldData.id = id;
            fieldData.label = label;
            if (type === "string") {
                fieldData.value = this.state.task[id] ? this.state.task[id].value : '';
            }
            if (type === "long") {
                fieldData.value = this.state.task[id] ? this.state.task[id].value : 0;
                if (this.state.task[id] && this.state.task[id].value.toString().includes(".")) {
                    fieldData.longValidationErr = 'long-type-integer-error';
                    // isValidationError = true; //make submit button not active
                }
            }
            if (type === "double") {
                fieldData.value = this.state.task[id] ? this.state.task[id].value : 0.00;
                if (!/^-?[0-9]+[.][0-9]{2}$/.test(this.state.task[id].value)) {
                    fieldData.doubleValidationErr = 'double-type-error';
                    // isValidationError = true; //make submit button not active
                }
            }
            if (type === "file") {
                fieldData.value = '';
                if (this.state.task[id] !== undefined && this.state.task[id].type === "File") {
                    fieldData.fileName = this.state.task[id].valueInfo.filename;
                    fieldData.isFile = true;
                } else {
                    fieldData.fileName = "";
                    fieldData.isFile = false;
                }
            }
            if (type === "date") {
                //datePattern="dd/MM/yyyy" this.state.task[id].value="2020-06-01T00:00:00.000+0000" We need DD-MM-YYYY
                // console.log("xml date field", el);
                fieldData.datePattern = attributes.find(el => el.nodeName === "datePattern").nodeValue;
                let dateArray;
                if (this.state.task[id]) {
                    dateArray = this.state.task[id].value.split('T')[0].split('-');
                } else {
                    dateArray = new Date(Date.now()).toISOString().split('T')[0].split('-');
                }
                fieldData.value = `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`;
                // console.log("default field date value", this.state.task[id].value);
            }
            if (type === "boolean") {
                fieldData.value = this.state.task[id] ? this.state.task[id].value : false;
                // let defaultVal;
                // if (defaultValueString !== undefined) {
                //     const defaultValue = defaultValueString.nodeValue;
                //defaultVal = (defaultValue == String(defaultValue ? true : false)) ? (defaultValue ? true : false) : (!defaultValue ? true : false)
                //     defaultVal = defaultValue.substring(defaultValue.indexOf('{') + 1, defaultValue.indexOf('}'));
                // }
                //fieldData.value = defaultValueString !== undefined ? defaultVal : false;
            }
            if (type === "enum") {
                const enumValues = Array.from(attributes.find(el => el.nodeName === "id").ownerElement.childNodes).filter(el => el.nodeName === "camunda:value");
                fieldData.values = [];
                enumValues.forEach(el => {
                    let enumValueName = Array.from(el.attributes).find(el => el.nodeName === "name").nodeValue;
                    let enumValueId = Array.from(el.attributes).find(el => el.nodeName === "id").nodeValue;
                    fieldData.values.push({enumValueId, enumValueName});
                })
                let defaultValueName;
                if (defaultValueString !== undefined) {
                    const defaultValue = defaultValueString.nodeValue;
                    defaultValueName = defaultValue.substring(defaultValue.indexOf('{') + 1, defaultValue.indexOf('}'));
                }
                // console.dir(this.state.task[defaultValueName].value)
                fieldData.value = this.state.task[defaultValueName] ? this.state.task[defaultValueName].value : fieldData.values[0].enumValueId;
                // console.dir(fieldData.value)
            }
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
            this.formDataFields = Array.from(this.props.xmlData).find(el => el.nodeName === "bpmn:extensionElements").childNodes[1].childNodes;
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
        this.props.getXml(this.props.procDefinitionKey, this.props.taskDefinitionKey, this.props.tenantId);
        this.setState({modalOpen: true, isValidationError: false});
    }

    handleClose = () => {
        this.setState({modalOpen: false, isValidationError: false});
        this.props.closeTask();
    }

    handleChange = (event, id, type, value) => {
        const [isValidationError, formFields] = takeChangedFormValues(this.state.data, event, id, type, value);
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

    handleDownloadFile = (e, fileName, id) => {
        e.preventDefault();
        this.props.getTaskAppData(this.state.task.id, fileName, id)
    }

    handleSubmit = event => {
        this.props.completeTask(this.state.task.id, this.state.data)
        event.preventDefault();
    }

    render() {
        const {loading, completeTaskError, clearErrorMessage, intl} = this.props;
        if (completeTaskError) {
            setTimeout(() => clearErrorMessage(), 4000);
        }
        return (
            <Modal trigger={<Button color="blue"
                                    onClick={this.handleOpen}>{intl.formatMessage(completeModalMessages["button-open"])}</Button>}
                   open={this.state.modalOpen}
                   onClose={this.handleClose} closeIcon>
                <Header color="blue" icon='check circle outline'
                        content={intl.formatMessage(completeModalMessages.header)}/>
                <Modal.Content>
                    {loading && <Dimmer active inverted><Loader inverted/></Dimmer>}
                    {this.state.data && <Form onSubmit={this.handleSubmit} error>
                        <Grid centered>
                            <Grid.Column mobile={16} tablet={12} computer={10}>
                                {this.state.data.map(el => {
                                    if (el.type === "string" && el.id.toLowerCase().includes("comment")) {
                                        return (<Form.TextArea key={el.id}
                                                               label={el.label}
                                                               // name={el.type}
                                                               placeholder={el.label}
                                                               value={el.value}
                                                               onChange={e => this.handleChange(e, el.id, el.type)}/>)
                                    } else if (el.type === "string") {
                                        return (<Form.Field key={el.id} required fluid
                                                            control={Input}
                                                            label={el.label}
                                                            // name={el.type}
                                                            placeholder={el.label}
                                                            value={el.value}
                                                            onChange={e => this.handleChange(e, el.id, el.type)}
                                        />)
                                    } else if (el.type === "long") {
                                        return (<Form.Field key={el.id} required fluid
                                                            control={Input}
                                                            label={el.label}
                                                            // name={el.type}
                                                            placeholder="0"
                                                            value={el.value}
                                                            error={el.longValidationErr && intl.formatMessage(validationMessages[`${el.longValidationErr}`])}
                                                            onChange={e => this.handleChange(e, el.id, el.type)}
                                        />)
                                    } else if (el.type === "double") {
                                        return (<Form.Field key={el.id} required fluid
                                                            control={Input}
                                                            label={el.label}
                                                            // name={el.type}
                                                            placeholder="0.00"
                                                            value={el.value}
                                                            error={el.doubleValidationErr && intl.formatMessage(validationMessages[`${el.doubleValidationErr}`])}
                                                            onChange={e => this.handleChange(e, el.id, el.type)}
                                        />)
                                    } else if (el.type === "boolean") {
                                        return (<Form.Checkbox key={el.id} checked={el.value}
                                                               label={el.label[0].toUpperCase() + el.label.slice(1)}
                                                               onChange={e => this.handleChange(e, el.id, el.type, el.value)}
                                        />)
                                    } else if (el.type === "file") {
                                        return (<Fragment key={el.id}>
                                            <label className="label">{el.label}</label>
                                            {el.isFile ? <a className="complete__file-link"
                                                            download={el.fileName}
                                                            href={el.fileName}
                                                            onClick={e => this.handleDownloadFile(e, el.fileName, el.id)}>{el.fileName}</a> :
                                                <label key={el.id} className="form__file-input-label">
                                                    <FileBase64 multiple={false}
                                                                onDone={e => this.handleFileInputChange(e, el.id)}/>
                                                    {(el.fileName !== "") ? el.fileName : intl.formatMessage(completeModalMessages["input-file"])}
                                                </label>}
                                        </Fragment>)
                                    } else if (el.type === "enum") {
                                        return (<Form.Field key={el.id}
                                                            value={el.value}
                                                            label={el.label}
                                                            onChange={e => this.handleChange(e, el.id, el.type)}
                                                            control='select'>
                                            {el.values.map(elem => <option key={elem.enumValueId}
                                                                           value={elem.enumValueId}>{elem.enumValueName}</option>)}
                                        </Form.Field>)
                                    } else if (el.type === "date") {
                                        return (<DateInput key={el.id} label={el.label}
                                                           closable={true}
                                                           popupPosition='bottom left'
                                                           hideMobileKeyboard={true}
                                                           markColor="blue"
                                                           localization={intl.locale === "en" ? "en-gb" : intl.locale}
                                                           value={el.value}
                                                           iconPosition="left"
                                                           onChange={(e, data) => this.handleChange(e, el.id, el.type, data)}
                                        />)
                                    } else {
                                        return (<Form.Field key={el.id} fluid
                                                            control={Input}
                                                            label={el.label}
                                                            // name={el.type}
                                                            placeholder=""
                                                            value={el.value}
                                                            onChange={e => this.handleChange(e, el.id, el.type)}
                                        />)
                                    }
                                })}
                                {this.state.isValidationError ? <Form.Field
                                    control={Button}
                                    color="blue"
                                    floated='right'
                                    className="modalButton"
                                    content={intl.formatMessage(completeModalMessages["button-action"])} disabled
                                /> : <Form.Field
                                    control={Button}
                                    color="blue"
                                    floated='right'
                                    className="modalButton"
                                    content={intl.formatMessage(completeModalMessages["button-action"])}
                                />}
                            </Grid.Column>
                        </Grid>
                    </Form>}
                    {completeTaskError &&
                    <Message error header={intl.formatMessage(completeModalMessages["error-header"])}
                             content={completeTaskError}/>}
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = ({taskComplete: {loading, isComplete, completeTaskError, xmlData, openedTask}}) => {
    return {loading, xmlData, isComplete, completeTaskError, openedTask};
};

const mapDispatchToProps = (dispatch, {services}) => {
    return {
        openTask: task => dispatch(openTask(task)),
        getXml: (procDefinitionKey, taskDefinitionKey, tenantId) => getXml(services, dispatch)(procDefinitionKey, taskDefinitionKey, tenantId),
        getTaskAppData: (id, fileName, fileVariableId) => getTaskAppData(services, dispatch)(id, fileName, fileVariableId),
        completeTask: (id, formData) => postCompleteTask(services, dispatch)(id, formData),
        clearErrorMessage: () => dispatch(clearErrorMessage()),
        closeTask: () => dispatch(closeTask())
    };
};

export default compose(injectIntl, withServices(), connect(mapStateToProps, mapDispatchToProps))(ModalCompleteContainer);
