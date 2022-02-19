import React from 'react';
import { render } from 'react-dom';

import Panel from './Panel';
import './index.css';
import '../../assets/styles/tailwind.css';

render(<Panel />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
