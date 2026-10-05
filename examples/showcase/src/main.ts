import { ShowcaseApp } from './ShowcaseApp';
import './register';
import '@/theme/theme.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './showcase.css';
import { Router } from '@/router';

new ShowcaseApp({ container: document.getElementById('app')! });
Router.getInstance().start(true);
