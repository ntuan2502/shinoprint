import _ from 'lodash';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from './modal';
import 'slick-carousel';

// Chiara
import mediaQueryListFactory from '../common/media-query-list';

export default function (context) {
    const modal = defaultModal();

    // Chiara
    const mq = mediaQueryListFactory('medium');

    // Chiara - add .quickview-alt to support Choose Options show quickview
    $('body').on('click', '.quickview, .quickview-alt', event => {
        // Chiara - Do normal link if not desktop
        // .quickview-alt should work on desktop only
        if ($(event.currentTarget).hasClass('quickview-alt')) {
            if (!mq || !mq.matches) {
                return;
            }
        }

        event.preventDefault();

        const productId = $(event.currentTarget).data('productId');

        modal.open({ size: 'large' });

        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
            modal.updateContent(response);

            modal.$content.find('.productView').addClass('productView--quickView');

            modal.$content.find('[data-slick]').slick();

            // Papathemes Also Bought MOD {{{
            const $quickView = modal.$content.find('.quickView');
            if ($('[data-also-bought] .productView-alsoBought-item', $quickView).length > 0) {
                return new ProductDetails($quickView, _.extend(context, { enableAlsoBought: true }));
            }
            return new ProductDetails($quickView, context);
            // }}}
        });
    });
}
