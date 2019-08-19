import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import collapsibleFactory from '../theme/common/collapsible';
import ProductDetails from '../theme/common/product-details';
import scrollToElement from 'scroll-to-element';

//
// https://javascript.info/task/delay-promise
//
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//
// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
//
function promiseSerial(funcs) {
    return funcs.reduce(
        (promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([]),
    );
}

export default class AlsoBought {
    constructor(parentProductDetails) {
        this.parentProductDetails = parentProductDetails;
        this.$alsoBoughtEl = $('[data-also-bought]', parentProductDetails.$productViewScope);
        this.products = [];

        this.retrieveAlsoBoughtProducts();

        this.onAddAllButtonClick = this.onAddAllButtonClick.bind(this);
        $('[data-add-all]', this.$alsoBoughtEl).on('click', this.onAddAllButtonClick);
    }

    retrieveAlsoBoughtProducts() {
        const $thumbnails = $('[data-thumbnails]', this.$alsoBoughtEl);
        const options = {
            template: {
                details: 'chiara/also-bought/product-details',
                thumbnail: 'chiara/also-bought/product-thumbnail',
            },
        };
        const $productEls = $('[data-product-id]', this.$alsoBoughtEl);

        if ($productEls.length > 0) {
            this.$alsoBoughtEl.removeClass('u-hiddenVisually');
        }

        $productEls.each((i, productEl) => {
            const $productEl = $(productEl);
            const productID = $productEl.data('productId');
            const $thumbEl = $('<div class="productView-alsoBought-thumbnail-item"></div>');
            $thumbnails.append($thumbEl);

            utils.api.product.getById(productID, options, (err, resp) => {
                $productEl.append(resp.details);
                $thumbEl.append(resp.thumbnail);

                // init foundation collapsible
                collapsibleFactory('[data-options-collapsible]', { $context: $productEl });

                // bind events
                $('[data-also-bought-checkbox]', $productEl).on('change', this.onAlsoBoughtCheckboxChange.bind(this, $productEl));

                this.products.push(new ProductDetails($productEl, _.extend(this.parentProductDetails.context, { enableAlsoBought: false })));
            });
        });
    }

    onAddAllButtonClick(e) {
        e.preventDefault();

        $('[data-also-bought-checkbox]', this.$alsoBoughtEl)
            .prop('checked', true)
            .trigger('change');
    }

    onAlsoBoughtCheckboxChange($productEl, e) {
        const $cb = $(e.target);
        const $toggle = $productEl.find('[data-options-collapsible]').first();
        const $label = $(`label[for="${$cb.attr('id')}"]`, this.$alsoBoughtEl);

        // open (close) product options form if checkbox is checked (unchecked)
        if ($cb.prop('checked')) {
            $label.addClass('is-checked');
            if (!$toggle.hasClass('is-open')) {
                $toggle.trigger('click');
            }
        } else {
            $label.removeClass('is-checked');
            if ($toggle.hasClass('is-open')) {
                $toggle.trigger('click');
            }
        }
    }

    /**
     * Promise to Call after the parent product is added to add also-bought products.
     */
    async parentProductAddedToCart() {
        // console.log('parent product added');

        const promises = [];
        let success = true;

        this.products.forEach(product => {
            if (product.$scope.find('[data-also-bought-checkbox]:checked').length > 0) {
                promises.push(async () => {
                    try {
                        await this.addProductToCart(product); // eslint-disable-line no-unused-expressions
                        await delay(1000); // eslint-disable-line no-unused-expressions
                    } catch (e) {
                        success = false;
                    }
                });
            }
        });

        await promiseSerial(promises); // eslint-disable-line no-unused-expressions
        return success;
    }

    addProductToCart(product) {
        return new Promise((resolve, reject) => {
            const form = $('form[data-cart-item-add]', product.$scope).get(0);
            const $addToCartBtn = $('#form-action-addToCart', product.$scope);
            const originalBtnVal = $addToCartBtn.val();
            const waitMessage = $addToCartBtn.data('waitMessage');
            const $errorBox = $('[data-error-box]', product.$scope);
            const $errorMsg = $('[data-error-message]', product.$scope);
            const $checkbox = $('[data-also-bought-checkbox]', product.$scope);

            // Do not do AJAX if browser doesn't support FormData
            if (window.FormData === undefined) {
                resolve();
            }

            $addToCartBtn
                .val(waitMessage)
                .prop('disabled', true);

            product.$overlay.show();

            // Add item to cart
            utils.api.cart.itemAdd(product.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
                const errorMessage = err || response.data.error;

                // console.log(form);

                $addToCartBtn
                    .val(originalBtnVal)
                    .prop('disabled', false);

                product.$overlay.hide();

                // Guard statement
                if (errorMessage) {
                    // console.log('reject add product');

                    $errorMsg.html(errorMessage);
                    $errorBox.removeClass('u-hiddenVisually');
                    if ($errorBox.length > 0) {
                        scrollToElement($errorBox.get(0));
                    }

                    reject();
                    return;
                }

                // console.log('resolve add product');
                $errorMsg.empty();
                $errorBox.addClass('u-hiddenVisually');
                $checkbox.prop('checked', false).trigger('change');

                resolve();
            });
        });
    }
}
