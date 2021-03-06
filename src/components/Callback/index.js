import React from 'react';
import Container from 'components/Container';
import localForage from 'localforage';

// Component states

const COMP_LOADING = (
  <div>
    <div className='progress' style={{marginTop: '5vh'}}>
        <div className='indeterminate'></div>
    </div>
    <h5 className='center'>Please wait while we authenticate your details</h5>
  </div>
);

const COMP_NO_CODE = (
  <div className='card-panel red lighten-3' style={{marginTop: '5vh'}}>
    No authorization code found. Make sure the URL has something like 'code=12345678910' in it.
  </div>
);

const COMP_AJAX_ERROR = (
  <div className='card-panel red lighten-3' style={{marginTop: '5vh'}}>
    Internal error - looks like that authorisation code isn't working. If this keeps happening <a href='https://github.com/robcalcroft/mondoweb/issues'>let me know</a>.
  </div>
);

export default class Callback extends React.Component {
  constructor() {
    super();

    this.state = {
      component: COMP_LOADING
    };
  }

  componentDidMount() {
    const queryString = window.location.search.replace('?', '').split('&').map(string => {
      let query = {};
      query[string.split('=')[0]] = string.split('=')[1];
      return query;
    });

    const code = queryString.find(query => !!query.code);

    if (!code || !code.code) {
      return this.setState({
        component: COMP_NO_CODE
      });
    }

    $.getJSON(`/token?code=${code.code}`)
      .done(body => {

        // if (body.access_token && body.refresh_token) {
        //   Promise.all([
        //     localForage.setItem('mondo_access_token', body.access_token),
        //     localForage.setItem('mondo_refresh_token', body.refresh_token)
        //   ]).then(() => {
        //     window.location.href = '/accounts';
        //   });
        // }
        localStorage.setItem('mondo_access_token', body.access_token);
        localStorage.setItem('mondo_refresh_token', body.refresh_token);
        window.location.href = '/accounts';
      })
      .fail(err => {
        swal('Error', err.responseJSON ? `${err.responseJSON.message} try logging out and in again` : false
          || 'Internal error, check your network connection, contact me in the menu if this keeps happening', 'error');

        return this.setState({
          component: COMP_AJAX_ERROR
        });
      });
  }

  render() {
    return (
      <Container nav={false}>
        {this.state.component}
      </Container>
    );
  }
}
