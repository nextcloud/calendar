import 'core-js/stable';
import 'regenerator-runtime/runtime';

document.title = 'Standard Nextcloud title'

// The webdav client requires a public fetch function
window.fetch = () => {}
