import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Container} from 'semantic-ui-react';
import TasklistTable from '../../components/TasklistTable/TasklistTable';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {getTasklistData, setCurrentItemsPart} from '../../actions/tasklistAction';
import {createProcessUpdateState} from '../../actions/createProcessAction';

class ArchivePageContainer extends Component {
    componentDidMount() {
        this.props.getTasklistData("Archive");
    }

    shouldComponentUpdate(nextProps) {
        return !(this.props.isComplete !== nextProps.isComplete ||
            this.props.completeTaskError !== nextProps.completeTaskError ||
            this.props.xmlData !== nextProps.xmlData ||
            this.props.processes !== nextProps.processes ||
            this.props.openedTask !== nextProps.openedTask ||
            this.props.chooseProcessError !== nextProps.chooseProcessError ||
            this.props.xmlStartEventData !== nextProps.xmlStartEventData ||
            // this.props.isCreated !== nextProps.isCreated ||
            this.props.createProcessError !== nextProps.createProcessError);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.isCreated) {
            this.props.getTasklistData("Maker");
            this.props.createProcessUpdateState();
        }
    }

    render() {
        return (
            <Container>
                <div className='pageBody'>
                    <TasklistTable {...this.props}/>
                </div>
            </Container>
        );
    }
}

const mapStateToProps = ({
                             tasklist: {list, loading, currentItemsPart, currentPartsPortion},
                             processesChoose: {chooseProcessError, processes},
                             taskComplete: {isComplete, completeTaskError, xmlData, openedTask},
                             processCreate: {isCreated, createProcessError, xmlStartEventData}
                         }) => {
    return {
        list,
        loading,
        currentItemsPart,
        currentPartsPortion,
        xmlData, openedTask,
        isComplete,
        completeTaskError,
        processes,
        chooseProcessError,
        isCreated, createProcessError, xmlStartEventData
    };
};

const mapDispatchToProps = (dispatch, {services}) => {
    return {
        getTasklistData: assignee => getTasklistData(services, dispatch)(assignee),
        setCurrentItemsPart: (part, portion) => dispatch(setCurrentItemsPart(part, portion)),
        createProcessUpdateState: () => dispatch(createProcessUpdateState())
    };
};

export default compose(withServices(), connect(mapStateToProps, mapDispatchToProps))(ArchivePageContainer);
