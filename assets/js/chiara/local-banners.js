// Call this function inside onReady()
export default function (context) {
    $('[data-local-banner-position]').each((i, el) => {
        const $el = $(el);

        if ($el.data('localBannerPositionInitialized')) {
            return;
        }

        const pageType = $el.data('ifPageType');
        const urlMatch = $el.data('ifUrlMatch');

        if (!pageType || pageType === context.pageType) {
            if (!urlMatch || window.location.href.match(new RegExp(urlMatch))) {
                const containerId = $el.data('localBannerPosition');
                $(`#${containerId}`).append(el).addClass('loaded');

                $el.data('localBannerPositionInitialized', true)
                    .addClass('loaded');
            }
        }
    });
}
