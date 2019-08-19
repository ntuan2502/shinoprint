import utils from '@bigcommerce/stencil-utils';

const PLUGIN_KEY = 'products-by-category-sorting-tabs';

export class ProductsByCategorySortingTabs {
    constructor($element, context) {
        this.$element = $element;
        this.context = context;
        this.template = 'chiara/products-by-category-sorting-tabs/products';

        this.onTabToggle = this.onTabToggle.bind(this);

        this.bindEvents();

        $('.is-active[data-url]').each((i, tabContent) => {
            this.request($(tabContent), this.template);
        });
    }

    onTabToggle(event, tab) {
        this.request($($('a', tab).attr('href')), this.template);
    }

    bindEvents() {
        $('[data-tab]', this.$element).on('toggled', this.onTabToggle);
    }

    unbindEvents() {
        $('[data-tab]', this.$element).off('toggled', this.onTabToggle);
    }

    request($container, tmpl) {
        if ($container.data(`${PLUGIN_KEY}-loaded`)) return;

        let template = tmpl;
        if ($container.data('template')) { template = $container.data('template'); }

        let url = $container.data('url');
        url = url.replace(/https?:\/\/[^/]+/, ''); // WORKAROUND: fix stencil localhost use real absolute urls

        utils.api.getPage(url, { template }, (err, resp) => {
            $container.html(resp);
            $container.data(`${PLUGIN_KEY}-loaded`, true);

            // init products carousel
            $('[data-slick]', $container)
                .on('init', e => setTimeout(() => {
                    // init nested carousel
                    $('[data-slick-nested]', e.target).each((i, el) => {
                        $(el).slick($(el).data('slickNested'));
                    });
                }, 200))
                .on('breakpoint', e => setTimeout(() => {
                    $('[data-slick-nested]', e.target).slick('setPosition');
                }, 200))
                .slick();

            if (typeof this.context.wow !== 'undefined') {
                this.context.wow.sync();
            }
        });
    }
}

export default function productsByCategorySortingTabsFactory(context, selector = `[data-${PLUGIN_KEY}]`, options = {}) {
    const $elements = $(selector, options.$context);
    const instanceKey = `${PLUGIN_KEY}Instance`;

    return $elements.map((index, element) => {
        const $element = $(element);
        const cachedInstance = $element.data(instanceKey);

        if (cachedInstance instanceof ProductsByCategorySortingTabs) {
            return cachedInstance;
        }

        const instance = new ProductsByCategorySortingTabs($element, context);

        $element.data(instanceKey, instance);

        return instance;
    }).toArray();
}
