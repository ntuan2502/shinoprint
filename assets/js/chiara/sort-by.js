import { hooks } from '@bigcommerce/stencil-utils';

let mobileSortBy;

class MobileSortBy {
    constructor() {
        this.onSortBySelected = this.onSortBySelected.bind(this);
        this.onMobileSortBySelected = this.onMobileSortBySelected.bind(this);

        this.bindEvents();
    }

    bindEvents() {
        // Clean-up
        this.unbindEvents();

        // DOM events
        $('body').on('click', '[data-mobile-sort-by] [data-value]', this.onMobileSortBySelected);

        // Hooks
        hooks.on('sortBy-select-changed', this.onSortBySelected);
    }

    unbindEvents() {
        // DOM events
        $('body').off('click', '[data-mobile-sort-by] [data-value]', this.onMobileSortBySelected);

        // Hooks
        hooks.off('sortBy-select-changed', this.onSortBySelected);
    }

    onSortBySelected(event) {
        const value = $(event.target).val();
        $('[data-mobile-sort-by]').find('[data-value]')
            .removeClass('is-active')
            .filter(`[data-value=${value}]`)
            .addClass('is-active');
    }

    onMobileSortBySelected(event) {
        $('[data-sort-by] select')
            .val($(event.target).data('value'))
            .trigger('change', event);

        // Close the panel
        const collapsible = $('[data-mobile-sort-by] [data-collapsible]').first().data('collapsibleInstance');
        if (collapsible) {
            collapsible.close();
        }
    }
}

export default MobileSortBy;

export function initMobileSortBy() {
    if (!mobileSortBy) {
        mobileSortBy = new MobileSortBy();
    }
    return mobileSortBy;
}
