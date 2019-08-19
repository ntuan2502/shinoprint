import { api } from '@bigcommerce/stencil-utils';

const template = 'chiara/products/ajax-reviews';
let themeSettings;

function getReviewsPage(url) {
    api.getPage(url, {
        template,
        config: {
            product: {
                reviews: {
                    limit: themeSettings.productpage_reviews_count,
                },
            },
        },
    }, (err, resp) => {
        if (err) {
            return err;
        }
        $('[data-product-reviews]').html(resp);
    });
}

export default function (context) {
    themeSettings = context.themeSettings;

    $('body').on('click', '[data-product-reviews] .pagination-link', event => {
        event.preventDefault();
        event.stopPropagation();

        const $el = $(event.target);

        if (window.history && window.history.pushState) {
            window.history.pushState(null, document.title, $el.attr('href'));
        }

        getReviewsPage($el.attr('href'));
    });

    $(window).on('popstate', () => {
        getReviewsPage(window.location.href);
    });
}
