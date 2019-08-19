import utils from '@bigcommerce/stencil-utils';

export default function (context) {
    utils.api.getPage(context.urls.search, { template: 'chiara/banners/remote' }, (err, resp) => {
        if (err) {
            return err;
        }

        $(resp).find('[data-remote-banner-position]').each((i, el) => {
            const pageType = $(el).data('ifPageType');
            const urlMatch = $(el).data('ifUrlMatch');

            if (!pageType || pageType === context.pageType) {
                if (!urlMatch || window.location.href.match(new RegExp(urlMatch))) {
                    const containerId = $(el).data('remoteBannerPosition');
                    $(`#${containerId}`).append(el).addClass('loaded');
                    $(el).addClass('loaded');
                }
            }
        });

        window.setTimeout(() => {
            if (typeof context.wow !== 'undefined') {
                context.wow.sync();
            }
        }, 200);
    });
}
