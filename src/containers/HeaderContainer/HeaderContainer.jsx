import React, {Component} from 'react';
import {Menu, Header, Button, Icon} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';
import {getUsersLocaleData} from '../../actions/usersLocaleDataAction';

class HeaderNavContainer extends Component {
    state = {isStackedMenu: true}

    handleMenuStackedIconClick = e => {
        e.preventDefault();
        const isStacked = !this.state.isStackedMenu;
        this.setState({isStackedMenu: isStacked});
    }

    render() {
        return (
            <Menu stackable fixed='top' fluid>
                <Menu.Item href="/" className="item menu__item menu__item-first">
                    <div className="menu__item-flex-between">
                        <Header as='h2' className="menu__header" color='blue'>Web BPM</Header>
                        <div className='menu__content-stacked'>
                            <Button.Group className='menu__buttons-lang-stacked'>
                                {this.props.locale === "uk" ?
                                    <Button attached='left' active compact basic color="blue"
                                            onClick={() => this.props.handleLangBtnClick("uk")}>UA</Button> :
                                    <Button attached='left' compact basic color="blue"
                                            onClick={() => this.props.handleLangBtnClick("uk")}>UA</Button>}
                                {this.props.locale === "en" ?
                                    <Button attached='right' active compact basic color="blue"
                                            onClick={() => this.props.handleLangBtnClick("en")}>EN</Button> :
                                    <Button attached='right' compact basic color="blue"
                                            onClick={() => this.props.handleLangBtnClick("en")}>EN</Button>}
                            </Button.Group>
                            {this.state.isStackedMenu ?
                                <Icon color='blue' size='large' name='bars' className='menu__icon-stackable'
                                      onClick={e => this.handleMenuStackedIconClick(e)}/> :
                                <Icon color='blue' size='large' name='close' className='menu__icon-stackable'
                                      onClick={e => this.handleMenuStackedIconClick(e)}/>}
                        </div>
                    </div>
                </Menu.Item>
                {this.state.isStackedMenu ? <Menu.Item exact as={NavLink} to="/"
                                                       className="item menu__item-stackable"
                                                       activeClassName="active">
                    <Header as='h4'>
                        <FormattedMessage id="header.maker-tasklist-link" defaultMessage="Задачі Менеджера"/>
                    </Header>
                </Menu.Item> : <Menu.Item exact as={NavLink} to="/"
                                          className="item"
                                          activeClassName="active" onClick={() => this.setState({isStackedMenu: true})}>
                    <Header as='h4'>
                        <FormattedMessage id="header.maker-tasklist-link" defaultMessage="Задачі Менеджера"/>
                    </Header>
                </Menu.Item>}
                {this.state.isStackedMenu ? <Menu.Item as={NavLink} to="/checker"
                                                       className="item menu__item-stackable"
                                                       activeClassName="active">
                    <Header as='h4'>
                        <FormattedMessage id="header.checker-tasklist-link" defaultMessage="Задачі Контролера"/>
                    </Header>
                </Menu.Item> : <Menu.Item as={NavLink} to="/checker"
                                          className="item"
                                          activeClassName="active" onClick={() => this.setState({isStackedMenu: true})}>
                    <Header as='h4'>
                        <FormattedMessage id="header.checker-tasklist-link" defaultMessage="Задачі Контролера"/>
                    </Header>
                </Menu.Item>}
                {this.state.isStackedMenu ? <Menu.Item as={NavLink} to="/archive"
                                                       className="item menu__item-stackable"
                                                       activeClassName="active">
                    <Header as='h4'><FormattedMessage id="header.archive-link" defaultMessage="Архів"/></Header>
                </Menu.Item> : <Menu.Item as={NavLink} to="/archive"
                                          className="item"
                                          activeClassName="active" onClick={() => this.setState({isStackedMenu: true})}>
                    <Header as='h4'><FormattedMessage id="header.archive-link" defaultMessage="Архів"/></Header>
                </Menu.Item>}
                <Menu.Item position='right' className="item menu__item-lang">
                    <Button.Group floated='right'>
                        {this.props.locale === "uk" ?
                            <Button attached='left' active compact basic color="blue"
                                    onClick={() => this.props.handleLangBtnClick("uk")}>UA</Button> :
                            <Button attached='left' compact basic color="blue"
                                    onClick={() => this.props.handleLangBtnClick("uk")}>UA</Button>}
                        {this.props.locale === "en" ?
                            <Button attached='right' active compact basic color="blue"
                                    onClick={() => this.props.handleLangBtnClick("en")}>EN</Button> :
                            <Button attached='right' compact basic color="blue"
                                    onClick={() => this.props.handleLangBtnClick("en")}>EN</Button>}
                    </Button.Group>
                </Menu.Item>
            </Menu>
        )
    }
}

const mapStateToProps = ({usersLocaleData: {locale}}) => {
    return {locale};
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleLangBtnClick: locale => dispatch(getUsersLocaleData(locale))
    };
};

export default compose(withServices(), connect(mapStateToProps, mapDispatchToProps))(HeaderNavContainer);
