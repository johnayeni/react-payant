import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

function Payant(props) {
  const initialState = {
    ...props,
    scriptLoaded: null,
    class: props.class || props.className || '',
  };
  const [payantState, setPayantState] = useState(initialState);

  const payWithPayant = useCallback(() => {
    payantState.scriptLoaded &&
      payantState.scriptLoaded.then(() => {
        const payantOptions = {
          key: payantState.payantPublicKey,
          reference_code: payantState.reference,
          amount: payantState.amount,
          client: payantState.client,
          client_id: payantState.client_id,
          due_date: payantState.due_date,
          fee_bearer: payantState.fee_bearer,
          items: payantState.items,
          tokenize: payantState.tokenize,
          payment_methods: payantState.payment_methods,
          callback: (response) => {
            payantState.callback(response);
          },
          onClose: () => {
            payantState.close();
          },
        };
        Object.freeze(payantOptions);
        const handler = window.Payant.invoice(payantOptions);
        handler.openIframe();
      });
  }, [payantState]);

  const loadScript = (callback) => {
    const script = document.createElement('script');
    script.src = 'https://api.payant.ng/assets/js/inline.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    if (script.readyState) {
      // IE
      script.onreadystatechange = () => {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      // Others
      script.onload = () => {
        callback();
      };
    }
  };

  const loadscriptAndUpdateState = useCallback(() => {
    setPayantState({
      ...payantState,
      scriptLoaded: new Promise((resolve) => {
        loadScript(() => {
          resolve();
        });
      }),
    });
  }, [payantState]);

  useEffect(
    useCallback(() => {
      loadscriptAndUpdateState();
      if (payantState.scriptLoaded) {
        payWithPayant();
      }
    }, [loadscriptAndUpdateState, payWithPayant, payantState.scriptLoaded]),
    [],
  );

  return (
    <button className={payantState.class} onClick={payWithPayant} disabled={payantState.disabled}>
      {payantState.text}
    </button>
  );
}

Payant.propTypes = {
  text: PropTypes.string,
  class: PropTypes.string,
  reference: PropTypes.string,
  client: PropTypes.shape({
    company_name: PropTypes.string,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string,
    type: PropTypes.string,
    settlement_bank: PropTypes.string,
    account_number: PropTypes.string,
  }).isRequired,
  client_id: PropTypes.string,
  due_date: PropTypes.string.isRequired,
  fee_bearer: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      unit_cost: PropTypes.string.isRequired,
      quantity: PropTypes.string.isRequired,
    }),
  ).isRequired,
  tokenize: PropTypes.bool,
  payment_methods: PropTypes.arrayOf(PropTypes.oneOf(['card', 'bank', 'phone', 'qr'])),
  payantPublicKey: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Payant.defaultProps = {
  text: 'Make Payment',
  disabled: false,
  embed: false,
  tokenize: false,
  payment_methods: ['card', 'bank', 'phone', 'qr'],
};

export default Payant;
