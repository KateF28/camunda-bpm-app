import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Form, Input, Button, Header, Modal, Message} from 'semantic-ui-react';
import FileBase64 from 'react-file-base64';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {createProcess, clearCreateErrorMessage, closeCreateModal} from '../../actions/processCreateAction';

class ModalCreateContainer extends Component {
    state = {
        modalCreateOpen: false,
        data: {customerName: '', amount: 0, fileValue: "", fileName: ""},
        amountValidationErr: null
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.isCreated) {
            this.setState({
                modalCreateOpen: false,
                data: {customerName: '', amount: 0, fileValue: "", fileName: ""},
                amountValidationErr: null
            });
            this.props.closeModal();
            return false;
        }
        return true;
    }

    handleCreateModalOpen = () => this.setState({
        modalCreateOpen: true,
        data: {customerName: '', amount: 0, fileValue: "", fileName: ""}, amountValidationErr: null
    })
    handleCreateModalClose = () => {
        this.setState({
            modalCreateOpen: false,
            data: {customerName: '', amount: 0, fileValue: "", fileName: ""},
            amountValidationErr: null
        });
        this.props.closeModal();
    }
    handleChange = (event, {value}) => {
        if (event.target.name === "name") {
            this.setState({...this.state, data: {...this.state.data, customerName: value.toString()}});
        }
        if (event.target.name === "amount") {
            if (isNaN(value) || event.target.value.toString().includes(" ")) {
                this.setState({
                    ...this.state,
                    data: {...this.state.data, amount: value},
                    amountValidationErr: "Please enter a number"
                });
            } else if (value.toString().includes(".")) {
                this.setState({
                    ...this.state,
                    data: {...this.state.data, amount: value},
                    amountValidationErr: "Please enter an integer"
                });
            } else {
                this.setState({
                    ...this.state,
                    data: {...this.state.data, amount: value},
                    amountValidationErr: null
                });
            }
            // } else if (!/^-?[0-9]+[.][0-9]{2}$/.test(value) || value === "-0.00") {
            //     this.setState({
            //         ...this.state,
            //         data: {...this.state.data, amount: value},
            //         amountValidationErr: "Please enter an amount with two decimal places"
            //     });
        }
    }

    handleFileInputChange = result => {
        const fileValueBase64 = result.base64.split(',')[1];
        this.setState({
            ...this.state,
            data: {...this.state.data, fileValue: fileValueBase64, fileName: result.name}
        });
    }

    handleSubmit = event => {
        this.props.createProcess(this.state.data);
        event.preventDefault();
    }

    render() {
        const {createProcessError, clearErrorMessage} = this.props;
        if (createProcessError) {
            setTimeout(() => clearErrorMessage(), 4000);
        }
        return (
            <Modal trigger={<Button color="blue" onClick={this.handleCreateModalOpen}>Create</Button>}
                   open={this.state.modalCreateOpen}
                   onClose={this.handleCreateModalClose} closeIcon>
                <Header color="blue" icon='add' content='Create Process'/>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit} error>
                        <Form.Field required fluid width={8}
                                    id='form-input-control-customer-name'
                                    control={Input}
                                    label='Customer name'
                                    name="name"
                                    placeholder='Customer name'
                                    value={this.state.data.customerName}
                                    onChange={this.handleChange}
                        />
                        <Form.Field required fluid width={8}
                                    id='form-input-control-amount'
                                    control={Input}
                                    label='Amount'
                                    placeholder='0'
                                    name="amount"
                                    value={this.state.data.amount}
                                    error={this.state.amountValidationErr}
                                    onChange={this.handleChange}
                        />
                        <label className="form__file-input-label">
                            <FileBase64
                                multiple={false}
                                onDone={this.handleFileInputChange.bind(this)}/>
                            {(this.state.data.fileName !== "") ?
                                this.state.data.fileName : "Choose a file"}</label>
                        {createProcessError && <Message
                            error
                            header='An error occurred'
                            content={createProcessError}
                        />}
                        {this.state.amountValidationErr !== null || this.state.data.customerName === '' ?
                            <Form.Field
                                id='form-button-control-public'
                                control={Button}
                                color="blue"
                                floated='right'
                                className="modalButton"
                                content='New' disabled
                            /> : <Form.Field
                                id='form-button-control-public'
                                control={Button}
                                color="blue"
                                floated='right'
                                className="modalButton"
                                content='New'
                            />}
                    </Form>
                </Modal.Content>
            </Modal>
        )
    }
}

const
    mapStateToProps = ({processCreate: {isCreated, createProcessError}}) => {
        return {
            isCreated,
            createProcessError
        };
    };

const
    mapDispatchToProps = (dispatch, {services}) => {
        return {
            createProcess: (data,
                            processKey = "warranty_approval_test",
                            businessKey = "myBusinessKey") => createProcess(services, dispatch)(data, processKey, businessKey),
            clearErrorMessage: () => dispatch(clearCreateErrorMessage()),
            closeModal: () => dispatch(closeCreateModal())
        };
    };


export default compose(withServices(), connect(mapStateToProps, mapDispatchToProps))(ModalCreateContainer);
