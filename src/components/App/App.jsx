import React from 'react';
import {Route, Switch} from 'react-router-dom';
import HeaderNav from '../Header/Header';
import MakerTasklistPageContainer from '../../containers/MakerTasklistPageContainer/MakerTasklistPageContainer';
import CheckerTasklistPageContainer from '../../containers/CheckerTasklistPageContainer/CheckerTasklistPageContainer';
import ArchivePageContainer from '../../containers/ArchivePageContainer/ArchivePageContainer';

const App = () => {
    return (
        <>
            <HeaderNav/>
            <Switch>
                <Route path="/" component={MakerTasklistPageContainer} exact/>
                <Route path="/checker" component={CheckerTasklistPageContainer}/>
                <Route path="/archive" component={ArchivePageContainer}/>
                <Route path="/*" render={() => <h1>Page not found</h1>}/>
            </Switch>
        </>
    );
};

export default App;
