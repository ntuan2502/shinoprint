import PageManager from './page-manager';
import displayTypeFactory from '../chiara/display-type'; // Chiara MOD

export default class Brands extends PageManager {
    // Chiara MOD
    onReady() {
        displayTypeFactory();
    }
}
