import React from 'react';
import { ServiceConsumer } from '../ServicesContext';

const withServices = () => Wrapped => {
    return Object.assign(
        props => {
            return (
                <ServiceConsumer>
                    {services => {
                        return <Wrapped {...props} services={services} />;
                    }}
                </ServiceConsumer>
            );
        },
        { displayName: 'SomeComponent' },
    );
};

withServices.displayName = 'hoc withServices';
export default withServices;
