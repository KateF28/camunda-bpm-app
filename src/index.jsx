import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// import 'fast-text-encoding/text';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import store from './store';
import Services from './services';
import {ServiceProvider} from './components/ServicesContext';
import AppContainer from './containers/AppContainer/AppContainer';
import 'semantic-ui-css/semantic.min.css';
import './index.scss';
const services = new Services();

ReactDOM.render(
    <BrowserRouter>
        <Provider store={store}>
            <ServiceProvider value={services}>
                <AppContainer/>
            </ServiceProvider>
        </Provider>
    </BrowserRouter>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
