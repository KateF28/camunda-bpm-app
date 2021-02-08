import React, {useState, useEffect} from "react";
import {Icon, Menu, Table, Input, Loader} from "semantic-ui-react";
import {useIntl} from 'react-intl';
import ModalCompleteContainer from "../../containers/ModalCompleteContainer/ModalCompleteContainer";
import ModalChooseProcessContainer from "../../containers/ModalChooseProcessContainer/ModalChooseProcessContainer";
import {outputAmountString} from "../../utils/outputAmountString";
import {messages} from './TasklistTableMessages';

const TasklistTable = ({loading, list, currentItemsPart, setCurrentItemsPart, currentPartsPortion, location}) => {
    const [filterValue, setFilterValue] = useState('');
    useEffect(() => {
        setCurrentItemsPart(1, 1);
    }, [filterValue, setCurrentItemsPart]);

    const intl = useIntl();

    let parts = [];
    const itemsPerPart = 5;
    const partsPerPortion = 3;
    let itemsPartsCount = Math.ceil(list.length / itemsPerPart);
    for (let i = 1; i <= itemsPartsCount; i++) {
        parts.push(i);
    }
    let partsPortionsCount = Math.ceil(itemsPartsCount / partsPerPortion);
    let leftPartInPortion = (currentPartsPortion - 1) * partsPerPortion + 1;
    let rightPartInPortion = currentPartsPortion * partsPerPortion;

    const filterCells = l => {
        if (filterValue.trim().length !== 0) {
            const lowerCaseFilterValue = filterValue.toLowerCase();
            let filteredList = l.filter(el => {
                return el.customerName ? el.customerName.value.toLowerCase().includes(lowerCaseFilterValue, 0) : false;
            });
            if (filteredList.length > 0) {
                itemsPartsCount = Math.ceil(filteredList.length / itemsPerPart);
                parts = [];
                for (let i = 1; i <= itemsPartsCount; i++) {
                    parts.push(i);
                }
                partsPortionsCount = Math.ceil(itemsPartsCount / partsPerPortion);
                leftPartInPortion = (currentPartsPortion - 1) * partsPerPortion + 1;
                rightPartInPortion = currentPartsPortion * partsPerPortion;
                const listForRendering = filteredList.filter((el, i) => {
                    if (i < currentItemsPart * itemsPerPart && i >= (currentItemsPart - 1) * itemsPerPart) {
                        return el;
                    }
                    return false;
                });
                return listForRendering.map((elem, index) => renderCells(elem, index));
            } else {
                itemsPartsCount = 0;
                partsPortionsCount = 0;
                parts = [];
                return null;
            }
        } else {
            const listForRendering = l.filter((el, i) => {
                if (i < currentItemsPart * itemsPerPart && i >= (currentItemsPart - 1) * itemsPerPart) {
                    return el;
                }
                return false;
            });
            return listForRendering.map((elem, index) => renderCells(elem, index));
        }
    }

    const renderCells = (task, i) => {
        let processDefinition = task.processDefinitionId.substring(0, task.processDefinitionId.indexOf(':'));
        let amount;
        if (task.warrantyAmount) {
            amount = outputAmountString(task.warrantyAmount.value);
        }

        return (
            <Table.Row key={i}>
                <Table.Cell>{task.nameFromXml && task.nameFromXml}</Table.Cell>
                <Table.Cell>{task.name}</Table.Cell>
                <Table.Cell>{task.customerName && task.customerName.value}</Table.Cell>
                <Table.Cell>{task.warrantyAmount && amount}</Table.Cell>
                <Table.Cell>{task.created && task.created.split('T')[0]}</Table.Cell>
                <Table.Cell>{task.due && task.due.split('T')[0]}</Table.Cell>
                <Table.Cell>
                    <ModalCompleteContainer id={task.id} task={task} procDefinitionKey={processDefinition}
                                            taskDefinitionKey={task.taskDefinitionKey} tenantId={task.tenantId}/>
                </Table.Cell>
            </Table.Row>
        )
    }

    const handleLeftPortionClick = e => {
        e.preventDefault();
        currentPartsPortion > 1 && setCurrentItemsPart((currentPartsPortion - 1) * partsPerPortion, currentPartsPortion - 1);
    }
    const handleRightPortionClick = e => {
        e.preventDefault();
        if (partsPortionsCount > currentPartsPortion) {
            setCurrentItemsPart(currentPartsPortion * partsPerPortion + 1, currentPartsPortion + 1);
        }
    }
    const handleItemsPartClick = (e, part, portion) => {
        e.preventDefault();
        setCurrentItemsPart(part, portion);
    }

    return (
        <>
        <div className='TasklistTable'>
            <div className='flexBetween'>
                <ModalChooseProcessContainer location={location.pathname}/>
                <Input value={filterValue} onChange={e => setFilterValue(e.target.value.toString())} focus icon='search'
                       placeholder={intl.formatMessage(messages["filter-placeholder"])}
                       className='tasklist__filter'/>
            </div>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-process-definition"])}</Table.HeaderCell>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-taskname"])}</Table.HeaderCell>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-customer"])}</Table.HeaderCell>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-amount"])}</Table.HeaderCell>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-created"])}</Table.HeaderCell>
                        <Table.HeaderCell>{intl.formatMessage(messages["table-header-due"])}</Table.HeaderCell>
                        <Table.HeaderCell />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {(list.length > 0) ? filterCells(list) : <Table.Row style={{position: "relative", minHeight: "79px"}}>
                        <Table.Cell style={{position: "absolute", left: "50%", transform: "translateX(-50%)"}}>
                            <Loader active inline='centered' size='large'/>
                    </Table.Cell>
                    </Table.Row>}
                </Table.Body>
                {list && itemsPartsCount > 1 && <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell colSpan='7'>
                            <Menu floated='right' pagination>
                                <Menu.Item as='a' icon onClick={e => handleItemsPartClick(e, 1, 1)}>
                                    <Icon name='angle double left'/>
                                </Menu.Item>
                                {partsPortionsCount > 1 &&
                                <Menu.Item as='a' icon onClick={e => handleLeftPortionClick(e)}>
                                    <Icon name='angle left'/>
                                </Menu.Item>}
                                {parts.filter(p => p >= leftPartInPortion && p <= rightPartInPortion)
                                    .map(itemsPart => <Menu.Item as='a' key={itemsPart + "idx"}
                                                                 className={currentItemsPart === itemsPart ? "item active" : "item"}
                                                                 onClick={e => handleItemsPartClick(e, itemsPart, currentPartsPortion)}>{itemsPart}</Menu.Item>)}
                                {partsPortionsCount > 1 &&
                                <Menu.Item as='a' icon onClick={e => handleRightPortionClick(e)}>
                                    <Icon name='angle right'/>
                                </Menu.Item>}
                                <Menu.Item as='a' icon
                                           onClick={e => handleItemsPartClick(e, itemsPartsCount, partsPortionsCount)}>
                                    <Icon name='angle double right'/>
                                </Menu.Item>
                            </Menu>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>}
            </Table>
        </div>
        </>
    );
};

export default TasklistTable;
TasklistTable.displayName = 'Tasklist Table';
