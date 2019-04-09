import React from 'react';
import { withRouter } from 'react-router-dom';

const MyButton = withRouter(({ history, ...props }) => (
    <button
      type='button'
      onClick={(event) => {
        const isValidated = props.onSubmit(event)
        if (!isValidated) {
            return
        }
        
        if (props.routeTo) {
            history.push(props.routeTo)
        }
    }}

    >{ props.name }</button>
    ));



export default MyButton;