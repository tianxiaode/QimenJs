import { ShowcaseApp } from './ShowcaseApp';
import './register';
import '@/theme/theme.css';
import './showcase.css';
import { Router } from '@/router';

Router.getInstance().start(true);

new ShowcaseApp({ container: document.getElementById('app')! });
