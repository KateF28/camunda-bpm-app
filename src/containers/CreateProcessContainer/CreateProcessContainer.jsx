import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux';
import {Form, Input, Button, Header, Message, Dimmer, Loader, Grid} from 'semantic-ui-react';
import {injectIntl} from "react-intl";
import {DateInput} from 'semantic-ui-calendar-react';
// import format from 'date-fns/format';
// eslint-disable-next-line
import moment from 'moment';
import 'moment/locale/uk';
import 'moment/locale/en-gb';
import FileBase64 from 'react-file-base64';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {
    createProcess,
    clearCreateErrorMessage,
    // createProcessUpdateState,
    getStartEventXml
} from '../../actions/createProcessAction';
import {takeChangedFormValues} from '../../utils/takeChangedDynamicFormValues';
import {createProcessMessages} from './CreateProcessMessages';
import {validationMessages} from '../../utils/validationFormMessages';

class CreateProcessContainer extends Component {
    state = {isCreatingValidationError: false};
    creatingFormFields;
    startEvent;

    componentDidMount() {
        this.props.getStartEventXml(this.props.chosenProcess);
    }

    // handleCreateProcessCancel = () => {
    //     this.setState({isCreatingValidationError: false});
    //     this.props.handleRechooseProcess();
    // }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isCreated) {
            this.setState({isCreatingValidationError: false});
            this.props.handleChooseProcessModalClose();
            // this.props.history.push(`${this.props.locationPath}`);
            return false;
        }
        // if (nextState.isRechooseNeeded) {
        //     setTimeout(() => this.handleCreateProcessCancel(), 3500);
        //     return false;
        // }
        return true;
    }

    getCreatingFormFieldsData = (formDataFields, formData = []) => {
        Array.from(formDataFields).filter(el => el.nodeName === "camunda:formField").forEach(el => {
            let attributes = Array.from(el.attributes);
            let type = attributes.find(el => el.nodeName === "type").nodeValue;
            let id = attributes.find(el => el.nodeName === "id").nodeValue;
            let label = attributes.find(el => el.nodeName === "label").nodeValue;
            let defaultValueString = attributes.find(el => el.nodeName === "defaultValue");
            let fieldData = {};
            fieldData.type = type;
            fieldData.id = id;
            fieldData.label = label;
            if (type === "string") {
                fieldData.value = defaultValueString !== undefined ? defaultValueString.nodeValue : '';
            }
            if (type === "long") {
                fieldData.value = defaultValueString !== undefined ? Number(defaultValueString.nodeValue) : 0;
            }
            if (type === "double") {
                fieldData.value = defaultValueString !== undefined ? Number(defaultValueString.nodeValue) : 0.00;
            }
            if (type === "file") {
                fieldData.fileName = "";
            }
            if (type === "date") {
                //defaultValue="18/06/2020" DD-MM-YYYY
                // console.log("xml date field", el);
                const xmlDate = attributes.find(el => el.nodeName === "datePattern");
                fieldData.datePattern = xmlDate ? xmlDate.nodeValue : "DD-MM-YYYY";
                let newDateArray;
                if (defaultValueString === undefined) {
                    newDateArray = new Date(Date.now()).toISOString().split('T')[0].split("-");
                }
                fieldData.value = defaultValueString !== undefined ? defaultValueString.nodeValue.split('/').join('-') :
                    `${newDateArray[2]}-${newDateArray[1]}-${newDateArray[0]}`;
                // console.log("default field date value", `fieldData.value);
            }
            if (type === "boolean") {
                let booleanDefaultValue;
                if (defaultValueString !== undefined) {
                    const defaultNodeValue = defaultValueString.nodeValue;
                    // eslint-disable-next-line
                    booleanDefaultValue = (defaultNodeValue == String(defaultNodeValue ? true : false)) ? (defaultNodeValue ? true : false) : (!defaultNodeValue ? true : false);
                }
                fieldData.value = defaultValueString !== undefined ? booleanDefaultValue : false;
            }
            if (type === "enum") {
                const enumValues = Array.from(attributes.find(el => el.nodeName === "id").ownerElement.childNodes).filter(el => el.nodeName === "camunda:value");
                fieldData.values = [];
                enumValues.forEach(el => {
                    let enumValueName = Array.from(el.attributes).find(el => el.nodeName === "name").nodeValue;
                    let enumValueId = Array.from(el.attributes).find(el => el.nodeName === "id").nodeValue;
                    fieldData.values.push({enumValueId, enumValueName});
                    // console.dir(enumValue.nodeValue)
                })
                // console.dir(attributes)
                fieldData.value = defaultValueString !== undefined ? defaultValueString.nodeValue : fieldData.values[0].enumValueId;
                // console.dir(fieldData.value)
            }
            formData.push(fieldData);
        });
        // console.dir(formData);
        return formData;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.xmlStartEventData !== this.props.xmlStartEventData && this.props.xmlStartEventData !== null) {
            this.startEvent = Array.from(this.props.xmlStartEventData.childNodes).find(el => el.nodeName === "bpmn:startEvent");
            if (this.startEvent !== undefined) {
                this.creatingFormFields = Array.from(this.startEvent.childNodes).find(el => el.nodeName === "bpmn:extensionElements").childNodes[1].childNodes;
                // console.log("this.creatingFormFields", this.creatingFormFields);
                this.setState({
                    data: this.getCreatingFormFieldsData(this.creatingFormFields),
                    // chosenProcessName: Array.from(this.props.xmlStartEventData.attributes).find(el => el.nodeName === "name").nodeValue,
                    isCreatingValidationError: false
                });
            }
            else {
                this.setState({
                    isRechooseNeeded: true,
                    isCreatingValidationError: false
                })
            }
        }
    }

    // handleCreateModalClose = () => {
    //     this.setState({isCreatingValidationError: false});
    //     this.props.closeModal();
    // }

    handleChange = (event, id, type, value) => {
        const [isValidationError, formFields] = takeChangedFormValues(this.state.data, event, id, type, value);
        this.setState({data: [...formFields], isCreatingValidationError: isValidationError});
    }

    handleCreatingFileInputChange = (e, id) => {
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

    handleSubmit = event => {
        this.props.createProcess(this.state.data, this.props.chosenProcess);
        // this.setState({isCreatingValidationError: false});
        // this.props.handleChooseProcessModalClose();
        event.preventDefault();
    }

    render() {
        const {loading, createProcessError, clearErrorMessage, intl} = this.props;
        if (createProcessError) {
            setTimeout(() => clearErrorMessage(), 4000);
        }
        // if (this.state.isRechooseNeeded) {
        //     setTimeout(() => this.handleCreateProcessCancel(), 3500);
        // }
        // console.log("location", locationPath);
        return (
            <>
                {!this.state.isRechooseNeeded && <Header textAlign='center' content={this.props.chosenProcessName}/>}
                {/*<Header icon='add' content={intl.formatMessage(createProcessMessages.header)}/>}*/}
                {this.state.isRechooseNeeded && <Message error content={intl.formatMessage(createProcessMessages["error-content"])}/>}
                {loading && <Dimmer active inverted><Loader inverted/></Dimmer>}
                {this.state.data && <Form onSubmit={this.handleSubmit} error>
                    <Grid centered>
                        <Grid.Column mobile={16} tablet={12} computer={10}>
                            {this.state.data.map(el => {
                                if (el.type === "string" && el.id.toLowerCase().includes("comment")) {
                                    return (<Form.TextArea key={el.id}
                                                           label={el.label}
                                                           placeholder={el.value}
                                                           value={el.value}
                                                           onChange={e => this.handleChange(e, el.id, el.type)}/>)
                                } else if (el.type === "string") {
                                    return (<Form.Field key={el.id} required fluid
                                                        control={Input}
                                                        label={el.label}
                                                        placeholder={el.value}
                                                        value={el.value}
                                                        onChange={e => this.handleChange(e, el.id, el.type)}
                                    />)
                                } else if (el.type === "long") {
                                    return (<Form.Field key={el.id} required fluid
                                                        control={Input}
                                                        label={el.label}
                                                        placeholder={el.value}
                                                        value={el.value}
                                                        error={el.longValidationErr && intl.formatMessage(validationMessages[`${el.longValidationErr}`])}
                                                        onChange={e => this.handleChange(e, el.id, el.type)}
                                    />)
                                } else if (el.type === "double") {
                                    return (<Form.Field key={el.id} required fluid
                                                        control={Input}
                                                        label={el.label}
                                                        placeholder={el.value}
                                                        value={el.value}
                                                        error={el.doubleValidationErr && intl.formatMessage(validationMessages[`${el.doubleValidationErr}`])}
                                                        onChange={e => this.handleChange(e, el.id, el.type)}
                                    />)
                                } else if (el.type === "boolean") {
                                    return (<Form.Checkbox key={el.id}
                                                           checked={el.value}
                                                           label={el.label[0].toUpperCase() + el.label.slice(1)}
                                                           onChange={e => this.handleChange(e, el.id, el.type, el.value)}
                                    />)
                                } else if (el.type === "file") {
                                    return (<Fragment key={el.id}>
                                        <label className="label">{el.label}</label>
                                        <label key={el.id} className="form__file-input-label">
                                            <FileBase64 multiple={false}
                                                        onDone={e => this.handleCreatingFileInputChange(e, el.id)}/>
                                            {(el.fileName !== "") ? el.fileName : intl.formatMessage(createProcessMessages["input-file"])}
                                        </label>
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
                                                        placeholder={el.value}
                                                        value={el.value}
                                                        onChange={e => this.handleChange(e, el.id, el.type)}
                                    />)
                                }
                            })}
                            {this.state.isCreatingValidationError ? <Form.Field
                                control={Button}
                                color="blue"
                                className="create-process__btn"
                                content={intl.formatMessage(createProcessMessages["button-action"])} disabled
                            /> : <Form.Field
                                control={Button}
                                color="blue"
                                className="create-process__btn"
                                content={intl.formatMessage(createProcessMessages["button-action"])}
                            />}
                        </Grid.Column>
                    </Grid>
                    {createProcessError &&
                    <Message error header={intl.formatMessage(createProcessMessages["error-header"])}
                             content={createProcessError}/>}
                </Form>}
            </>
            // </Container>
        )
    }
}

const mapStateToProps = ({
                             processCreate: {loading, isCreated, createProcessError, xmlStartEventData},
                             processesChoose: {locationPath}
                         }) => {
    return {loading, xmlStartEventData, isCreated, createProcessError, locationPath};
};

const mapDispatchToProps = (dispatch, {services}) => {
    return {
        createProcess: (data,
                        processKey,
                        businessKey = "myBusinessKey") => createProcess(services, dispatch)(data, processKey, businessKey),
        getStartEventXml: (procDefinitionKey) => getStartEventXml(services, dispatch)(procDefinitionKey),
        clearErrorMessage: () => dispatch(clearCreateErrorMessage()),
        // createProcessUpdateState: () => dispatch(createProcessUpdateState())
    };
};

export default compose(injectIntl, withServices(), connect(mapStateToProps, mapDispatchToProps))(CreateProcessContainer);
