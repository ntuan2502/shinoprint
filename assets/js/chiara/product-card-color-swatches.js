import utils from '@bigcommerce/stencil-utils';
import _ from 'lodash';
import inView from 'in-view';

let context;

export class ProductCardColorSwatches {
    constructor($scope) {
        this.$scope = $scope;
        this.productId = $scope.data('product-id');
        this.$content = $scope.find('[data-product-card-colorswatches-content]');
        this.$cardImg = $scope.find('.card-image').first();
        this.$cardFigure = $scope.find('.card-figure');

        this.$cardImg.on('load', () => {
            this.$cardFigure.removeClass('loading');
        });

        // Request in-stock attributes
        utils.api.productAttributes.optionChange(this.productId, $.param({ action: 'add', product_id: this.productId }), (err, response) => {
            if (err) {
                this.$content.hide();
                return;
            }

            const attributesData = response.data || {};

            if (typeof attributesData.in_stock_attributes === 'object' || attributesData.instock) {
                // Request swatches template
                utils.api.product.getById(this.productId, { template: 'products/card-swatches' }, (err2, resp) => {
                    if (err2) {
                        this.$content.hide();
                        return;
                    }

                    this.$content.html(resp);

                    // Delete out-of-stock attributes
                    this.$content.find('[data-product-swatch-value]').each((i, a) => {
                        const attrId = $(a).data('product-swatch-value');
                        if (typeof attributesData.in_stock_attributes === 'object' && attributesData.in_stock_attributes.indexOf(attrId) === -1) {
                            $(a).remove();
                        }
                    });

                    this.$content.addClass('loaded');
                });
            } else {
                this.$content.addClass('loaded');
            }
        });

        $scope.on('click', '[data-product-swatch-id]', (event) => {
            event.preventDefault();

            const $a = $(event.currentTarget);
            const id = $a.data('product-swatch-id');
            const val = $a.data('product-swatch-value');
            const attribute = {};
            attribute[id] = val;

            this.$scope.find('[data-product-attribute-id]').each((i, span) => {
                attribute[$(span).data('product-attribute-id')] = $(span).data('product-attribute-value');
            });

            this.$cardFigure.addClass('loading');
            utils.api.productAttributes.optionChange(this.productId, $.param({ action: 'add', product_id: this.productId, attribute }), (err, response) => {
                const attributesData = response.data || {};

                if (attributesData.image) {
                    const img = attributesData.image.data.replace('{:size}', context.themeSettings.productgallery_size);
                    this.$cardImg.attr('src', img);
                } else {
                    this.$cardFigure.removeClass('loading');
                }

                if (attributesData.price) {
                    const viewModel = this.getViewModel(this.$scope);
                    this.updatePriceView(viewModel, attributesData.price);
                }
            });
        });
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            rrpWithTax: {
                $div: $('.rrp-price--withTax', $scope),
                $span: $('[data-product-rrp-with-tax]', $scope),
            },
            rrpWithoutTax: {
                $div: $('.rrp-price--withoutTax', $scope),
                $span: $('[data-product-rrp-price-without-tax]', $scope),
            },
            nonSaleWithTax: {
                $div: $('.non-sale-price--withTax', $scope),
                $span: $('[data-product-non-sale-price-with-tax]', $scope),
            },
            nonSaleWithoutTax: {
                $div: $('.non-sale-price--withoutTax', $scope),
                $span: $('[data-product-non-sale-price-without-tax]', $scope),
            },
            priceSaved: {
                $div: $('.price-section--saving', $scope),
                $span: $('[data-product-price-saved]', $scope),
            },
            priceNowLabel: {
                $span: $('.price-now-label', $scope),
            },
            priceLabel: {
                $span: $('.price-label', $scope),
            },
        };
    }

    /**
     * Hide the pricing elements that will show up only when the price exists in API
     * @param viewModel
     */
    clearPricingNotFound(viewModel) {
        viewModel.rrpWithTax.$div.hide();
        viewModel.rrpWithoutTax.$div.hide();
        viewModel.nonSaleWithTax.$div.hide();
        viewModel.nonSaleWithoutTax.$div.hide();
        viewModel.priceSaved.$div.hide();
        viewModel.priceNowLabel.$span.hide();
        viewModel.priceLabel.$span.hide();
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updatePriceView(viewModel, price) {
        this.clearPricingNotFound(viewModel);

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.show();
            viewModel.rrpWithTax.$span.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.show();
            viewModel.rrpWithoutTax.$span.html(price.rrp_without_tax.formatted);
        }

        if (price.saved) {
            viewModel.priceSaved.$div.show();
            viewModel.priceSaved.$span.html(price.saved.formatted);
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithTax.$span.html(price.non_sale_price_with_tax.formatted);
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithoutTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithoutTax.$span.html(price.non_sale_price_without_tax.formatted);
        }
    }
}

function check() {
    $('[data-product-card-colorswatches]').each((i, el) => {
        if (!$(el).data('product-card-colorswatches-instance') && inView.is(el)) {
            $(el).data('product-card-colorswatches-instance', new ProductCardColorSwatches($(el)));
        }
    });
}

export function inViewCheck(localContext, eventEl = window) {
    if (localContext) {
        context = localContext;
    }

    if (!context || !context.themeSettings.card_show_swatches) {
        return;
    }

    const $eventEl = $(eventEl);

    inView.offset(-200);

    if ($eventEl.data('productCardColorswatchesInViewCheckEvent')) {
        return;
    }

    check();

    const callback = _.debounce(check, 250);
    $eventEl.on('scroll resize load', callback);
    $eventEl.data('productCardColorswatchesInViewCheckEvent', callback);
}
