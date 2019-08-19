import PageManager from './page-manager';

// Chiara theme
import productsByCategorySortingTabsFactory from '../chiara/products-by-category-sorting-tabs';

export default class Home extends PageManager {
    onReady() {
        // Chiara theme
        productsByCategorySortingTabsFactory(this.context);
    }
}
