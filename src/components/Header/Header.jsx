import React, {Component} from 'react';
import {Menu, Header, Image} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';
import logo from '../../logo.svg';

class HeaderNav extends Component {
    render() {
        return (
            <Menu fixed='top' fluid>
                <Menu.Item href="/">
                    <Header as='h3' color='blue'>
                        <Image src={logo}/>Web BPM</Header>
                </Menu.Item>
                <Menu.Item exact as={NavLink} to="/"
                           className="item"
                           activeClassName="active">
                    <Header as='h4'>Maker Tasklist</Header>
                </Menu.Item>
                <Menu.Item as={NavLink} to="/checker"
                           className="item"
                           activeClassName="active">
                    <Header as='h4'>Checker Tasklist</Header>
                </Menu.Item>
                <Menu.Item as={NavLink} to="/archive"
                           className="item"
                           activeClassName="active">
                    <Header as='h4'>Archive</Header>
                </Menu.Item>
            </Menu>
        )
    }
}

export default HeaderNav;
