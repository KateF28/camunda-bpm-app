import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Button, Menu, Header, Modal, Message, Dimmer, Loader} from 'semantic-ui-react';
import {injectIntl} from "react-intl";
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {
    clearChooseProcessErrorMessage,
    closeChooseProcessModal,
    getProcesses
} from '../../actions/chooseProcessAction';
import {chooseProcessMessages} from './ModalChooseProcessContainerMessages';
import CreateProcessContainer from '../CreateProcessContainer/CreateProcessContainer';

class ModalChooseProcessContainer extends Component {
    state = {modalChooseProcessOpen: false}

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (prevProps.processes !== this.props.processes && prevProps.processes === null) {
    //         this.setState({
    //             modalChooseProcessOpen: true,
    //             processes: this.props.processes
    //         });
    //     }
    // }

    handleChooseProcessModalOpen = () => {
        this.props.getProcesses();
        this.setState({modalChooseProcessOpen: true, isChosen: false, chosenProcess: null})
    }

    handleChooseProcessModalClose = () => {
        this.setState({modalChooseProcessOpen: false});
        this.props.closeChooseProcessModal();
    }

    handleChooseProcess = (key, name) => {
        this.setState({modalChooseProcessOpen: true, isChosen: true, chosenProcess: {key, name}});
    }

    // handleRechooseProcess = () => {
    //     this.setState({modalChooseProcessOpen: true, isChosen: false, chosenProcess: null});
    // }

    render() {
        const {loading, chooseProcessError, clearChooseProcessErrorMessage, intl} = this.props;
        if (chooseProcessError) {
            setTimeout(() => clearChooseProcessErrorMessage(), 4000);
        }
        return (
            <Modal trigger={<Button color="blue"
                                    onClick={this.handleChooseProcessModalOpen}>{intl.formatMessage(chooseProcessMessages["button-open"])}</Button>}
                   open={this.state.modalChooseProcessOpen}
                   onClose={this.handleChooseProcessModalClose} closeIcon>
                <Header color="blue" icon='add' content={intl.formatMessage(chooseProcessMessages.header)}/>
                <Modal.Content>
                    {loading && <Dimmer active inverted><Loader inverted/></Dimmer>}
                    {this.props.processes !== null && !this.state.isChosen && <Menu fluid vertical>
                        {this.props.processes.map((process, idx) => <Menu.Item
                            onClick={() => this.handleChooseProcess(process.key, process.name)} key={idx}>{process.name}</Menu.Item>)}
                    </Menu>}
                    {this.state.isChosen && this.state.chosenProcess !== null && <CreateProcessContainer chosenProcessName={this.state.chosenProcess.name}
                                                                                                         chosenProcess={this.state.chosenProcess.key}
                                                                                                         handleRechooseProcess={this.handleRechooseProcess}
                                                                                                         handleChooseProcessModalClose={this.handleChooseProcessModalClose}/>}
                    {chooseProcessError &&
                    <Message error header={intl.formatMessage(chooseProcessMessages["error-header"])}
                             content={chooseProcessError}/>}
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = ({processesChoose: {loading, chooseProcessError, processes}}) => {
    return {loading, chooseProcessError, processes};
};

const mapDispatchToProps = (dispatch, {services}) => {
    return {
        getProcesses: () => getProcesses(services, dispatch)(),
        clearChooseProcessErrorMessage: () => dispatch(clearChooseProcessErrorMessage()),
        closeChooseProcessModal: () => dispatch(closeChooseProcessModal())
    };
};

export default compose(injectIntl, withServices(), connect(mapStateToProps, mapDispatchToProps))(ModalChooseProcessContainer);
