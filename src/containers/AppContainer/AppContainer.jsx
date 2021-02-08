import React, {Component} from 'react';
import {connect} from 'react-redux';
import {IntlProvider} from 'react-intl';
import App from '../../components/App/App';
import compose from '../../utils/compose';
import withServices from '../../components/hocs/withServices';

const messages = {
    en: require('../../translation/en.json'),
    uk: require('../../translation/uk.json')
};

class AppContainer extends Component {
    render() {
        return (
            <IntlProvider locale={this.props.locale} messages={messages[this.props.locale]}>
                <App />
            </IntlProvider>
        );
    }
}

const mapStateToProps = ({usersLocaleData: { locale }}) => {
    return { locale };
};

export default compose(withServices(), connect(mapStateToProps))(AppContainer);
