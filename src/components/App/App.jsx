import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import HeaderNavContainer from '../../containers/HeaderContainer/HeaderContainer';
import MakerTasklistPageContainer from '../../containers/MakerTasklistPageContainer/MakerTasklistPageContainer';
import CheckerTasklistPageContainer from '../../containers/CheckerTasklistPageContainer/CheckerTasklistPageContainer';
import ArchivePageContainer from '../../containers/ArchivePageContainer/ArchivePageContainer';

const App = () => {
    return (
        <>
            <HeaderNavContainer />
            <Switch>
                <Route path="/" component={MakerTasklistPageContainer} exact />
                <Route path="/checker" component={CheckerTasklistPageContainer} />
                <Route path="/archive" component={ArchivePageContainer} />
                <Route path="/*" render={() => <h3 className='app__nonexistent-page'>
                    <FormattedMessage id="app.nonexistent-page" defaultMessage="Сторінку не знайдено"/>
                </h3>} />
            </Switch>
        </>
    );
};

export default App;
