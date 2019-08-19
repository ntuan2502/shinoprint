import _ from 'lodash';
import PageManager from '../theme/page-manager';
import 'slick-carousel';
import collapsibleFactory, { CollapsibleEvents } from '../theme/common/collapsible';
import mediaQueryListFactory from '../theme/common/media-query-list';
import remoteBanner from './remote-banners';
import loginForm from './login-form';
import { initMobileSortBy } from './sort-by';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'; // Chiara - enable/disable body scroll on iOS
import InfiniteScroll from './infinite-scroll';
import { inViewCheck } from './product-card-color-swatches'; // Color swatch on product card
import ajaxAddToCart from './ajax-addtocart';
import initLocalBanners from './local-banners';

const mediumMedia = mediaQueryListFactory('medium');

function initBrandsCarousel() {
    const $carousel = $('[data-brands-slick]');

    if ($carousel.length) {
        $carousel.slick({
            arrows: true,
            mobileFirst: true,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 1000,
            lazyLoad: 'progressive',
            centerMode: true,
            variableWidth: true,
        });
    }
}

/**
 * Function to make collapsible elements open/close same as the active element
 */
function toggleSameCollapsible() {
    function onCollapsibleToggle(event) {
        const collapse = $(event.target).data('collapsibleInstance');
        if (!collapse) {
            return;
        }
        const id = collapse.targetId;

        $('[data-collapsible]').each((i, el) => {
            if (el !== event.target) {
                const $el = $(el);
                const obj = $el.data('collapsibleInstance');

                if (obj && obj.targetId === id) {
                    if (event.type === 'open') {
                        obj.open({ notify: false });
                    } else {
                        obj.close({ notify: false });
                    }
                }
            }
        });
    }

    $('body')
        .on(CollapsibleEvents.open, '[data-collapsible]', onCollapsibleToggle)
        .on(CollapsibleEvents.close, '[data-collapsible]', onCollapsibleToggle);
}

function bindMobileCollapse() {
    $('body').on('click', '[data-emthemesmodez-mobile-collapse-handle]', (event) => {
        event.preventDefault();

        const $toggle = $(event.currentTarget);
        const $parent = $toggle.closest('[data-emthemesmodez-mobile-collapse]');
        const $content = $parent.find('[data-emthemesmodez-mobile-collapse-content]');

        $toggle.toggleClass('is-active');
        $content.toggleClass('is-active');
    });
}

function bindMobileSidebarToggle() {
    $('body').on('click', '[data-collapsible="mobileSidebar-panel"]', event => {
        if ($(event.currentTarget).hasClass('is-open')) {
            $('body').addClass('has-mobileSidebar');
        } else {
            $('body').removeClass('has-mobileSidebar');
        }
    });
}

function initInfiniteScroll(context) {
    $('[data-category-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            config: {
                category: {
                    products: {
                        limit: parseInt(context.themeSettings.products_per_page, 10),
                    },
                },
            },
        });
    });

    $('[data-search-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            template: 'chiara/search/ajax-product-listing',
            config: {
                product_results: {
                    limit: parseInt(context.themeSettings.products_per_page, 10),
                },
            },
        });
    });

    $('[data-brands-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            containerSelector: '.brandGrid',
            appendSelector: '.brand',
            template: 'chiara/brand/ajax-brand-listing',
            config: {
                brands: {
                    limit: parseInt(context.themeSettings.products_per_page, 10),
                },
            },
        });
    });

    $('[data-brand-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            template: 'chiara/brand/ajax-product-listing',
            config: {
                brand: {
                    products: {
                        limit: parseInt(context.themeSettings.products_per_page, 10),
                    },
                },
            },
        });
    });
}

function bindCollapsibleGroups() {
    $('body').on(CollapsibleEvents.open, '[data-group-collapsible]', (event, collapsible) => {
        const $target = $(event.target);
        const group = $target.data('groupCollapsible');

        if (!collapsible || !collapsible.targetId) {
            return;
        }

        $(`[data-group-collapsible="${group}"]`).each((i, el) => {
            const otherCollapsible = $(el).data('collapsibleInstance');

            if (otherCollapsible && otherCollapsible.targetId && otherCollapsible.targetId !== collapsible.targetId) {
                otherCollapsible.close();
            }
        });
    });
}

function bindLockBodyScroll() {
    // Stop if not iOS Safari
    if (!/Mobi/i.test(navigator.userAgent) || !/Safari/i.test(navigator.userAgent)) {
        // console.log('Disable lockBodyScroll for not Safari/Mobile');
        return;
    }

    $('body')
        .on(CollapsibleEvents.open, '[data-collapsible]', (event, collapsible) => {
            if (collapsible) {
                const el = collapsible.$target.find('[data-lock-body-scroll]').get(0);
                if (el) {
                    // console.log('lock', el);
                    disableBodyScroll(el);
                }
            }
        })
        .on(CollapsibleEvents.close, '[data-collapsible]', (event, collapsible) => {
            // console.log('close: ', event.target, collapsible.$toggle);
            if (collapsible) {
                const el = collapsible.$target.find('[data-lock-body-scroll]').get(0);
                if (el) {
                    // console.log('unlock', el);
                    enableBodyScroll(el);
                } else {
                    // console.log('unlock 1');
                    clearAllBodyScrollLocks();
                }
            } else {
                // console.log('unlock 2');
                clearAllBodyScrollLocks();
            }
        });
}

function initStickyHeader() {
    const $stickyMenus = $('[data-stickymenu]');
    if ($stickyMenus.length > 0) {
        $stickyMenus.each((i, el) => {
            $(el).data('stickymenuOriginalTop', $(el).offset().top)
                .after('<div class="chiara-stickymenu-placeholder"></div>')
                .next().height($(el).outerHeight());
        });

        $(window)
            .on('scroll', _.debounce(() => {
                if (!mediumMedia || !mediumMedia.matches) {
                    $stickyMenus.removeClass('is-sticky');
                    return;
                }

                $stickyMenus.each((i, el) => {
                    if ($(window).scrollTop() > $(el).data('stickymenuOriginalTop')) {
                        $(el).addClass('is-sticky');
                    } else {
                        $(el).removeClass('is-sticky');
                    }
                });
            }, 10))

            .on('resize', _.debounce(() => {
                $stickyMenus.each((i, el) => {
                    $(el).removeClass('is-sticky');

                    $(el).data('stickymenuOriginalTop', $(el).offset().top);
                });
            }, 100));
    }
}

function initNavPagesDropdown() {
    const $main = $('#navPages-main');
    const $toggle = $main.children('.navPages-item--dropdown-toggle');
    const $dropdown = $('#navPages-dropdown');

    const resize = () => {
        if (!$toggle.is('.u-hiddenVisually')) {
            $toggle.before($dropdown.children());
            $toggle.addClass('u-hiddenVisually');
        }

        if (!mediumMedia.matches) {
            return;
        }

        do { // eslint-disable-line
            const $lastItem = $main.children('.navPages-item:not(:last-child):not(.u-hiddenVisually-desktop):last');
            const lastItemRight = Math.round($lastItem.offset().left - $main.offset().left + $lastItem.width());
            const mainWidth = Math.round($main.width());

            if ($dropdown.children().length > 0) {
                const toggleRight = Math.round($toggle.offset().left - $main.offset().left + $toggle.width());
                if (toggleRight > mainWidth) {
                    $dropdown.prepend($lastItem);
                } else {
                    break;
                }
            } else if (lastItemRight > mainWidth) {
                $dropdown.prepend($lastItem);
                $toggle.removeClass('u-hiddenVisually');
            } else {
                break;
            }
        } while (true);
    };

    $(window).on('resize', _.debounce(resize, 200));

    resize();
}

function initCardImageSliderClicks(context) {
    if (context.themeSettings.card_show_img_slider) {
        $('body').on('click', '.card-image-link--slider', event => {
            const $activeImg = $(event.currentTarget).find('.is-active');
            const $arrow = $(event.target).closest('.card-image-prev, .card-image-next');

            if ($arrow.hasClass('card-image-prev')) {
                event.preventDefault();

                if (!$activeImg.hasClass('first')) {
                    $activeImg.removeClass('is-active')
                        .prev()
                        .addClass('is-active');
                }
            } else if ($arrow.hasClass('card-image-next')) {
                event.preventDefault();

                if (!$activeImg.hasClass('last')) {
                    $activeImg.removeClass('is-active')
                        .next()
                        .addClass('is-active');
                }
            }
        });
    }
}

async function initWOWAsync(context) {
    const [{ WOW }] = await Promise.all([
        import('wowjs'),
        // import('animate-css'),
    ]);

    window.WOW = WOW;

    $('.productGrid').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.productGrid--maxCol5').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 5)}ms`);
        });
    });

    $('.productGrid--maxCol6').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 6)}ms`);
        });
    });

    $('.productGrid--maxCol8').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 8)}ms`);
        });
    });

    $('.productGrid--maxCol3').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 3)}ms`);
        });
    });

    $('.productGrid--maxCol2').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 2)}ms`);
        });
    });

    $('.productGrid--maxCol1').each((j, list) => {
        $(list).children('.product').each((i, el) => {
            $(el).attr('data-wow-delay', '0');
        });
    });

    $('.productCarousel').each((j, list) => {
        $(list).find('.productCarousel-slide').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-banners-list').each((j, list) => {
        $(list).children('.chiara-banners-item').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * i}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-categoriesList-list').each((j, list) => {
        $(list).children('.chiara-categoriesList-item').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 2)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-recentBlog-posts').each((j, list) => {
        $(list).children('.blog').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-section--brandsCarousel, .footer-newsletterTop, .footer-copyright').addClass('wow fadeIn');

    $('.footer-info-left').each((j, list) => {
        $(list).children('.footer-info-col').each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 3)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.footer-info-right > .footer-info-col').attr('data-wow-delay', '800ms').addClass('wow fadeIn');

    if (typeof (context.wow) === 'undefined') {
        context.wow = new WOW({ // eslint-disable-line no-param-reassign
            mobile: false,
            live: true,
        });
    }

    context.wow.init();
}

async function initTweenMaxAsync() {
    const { TweenMax } = await import('tweenmax');

    $('.chiara-banners-item img + img').css('transition', 'none');

    $('.chiara-banners-item')
        .mousemove(e => {
            const $el = $(e.currentTarget);
            const $target = $el.find('img + img');

            if ($target.length > 0) {
                const relX = e.pageX - $el.offset().left;
                const relY = e.pageY - $el.offset().top;
                const movement = -50;

                TweenMax.to($target.get(0), 1, {
                    x: (relX - $el.width() / 2) / $el.width() * movement,
                    y: (relY - $el.height() / 2) / $el.height() * movement,
                    scale: 1,
                });
            }
        })
        .mouseout(e => {
            const $el = $(e.currentTarget);
            const $target = $el.find('img + img');

            if ($target.length > 0) {
                TweenMax.to($target.get(0), 1, { x: 0, y: 0, scale: 1 });
            }
        });
}

export default class ChiaraGlobal extends PageManager {
    onReady() {
        // import('animate-css');
        initNavPagesDropdown();
        inViewCheck(this.context); // Color swatches on product card
        initBrandsCarousel();
        collapsibleFactory('#navUser-more-toggle, #navUser-more-toggle2, #navUser-more-close, [data-collapsible]');
        toggleSameCollapsible();
        bindMobileCollapse();
        remoteBanner(this.context);
        loginForm(this.context);
        bindMobileSidebarToggle();
        initMobileSortBy();
        initInfiniteScroll(this.context);
        bindCollapsibleGroups();
        bindLockBodyScroll();
        ajaxAddToCart(this.context);
        initStickyHeader();
        initLocalBanners();
        initCardImageSliderClicks(this.context);

        //
        // Last
        //

        if (this.context.themeSettings.use_wow) {
            initWOWAsync(this.context);
        }

        if (this.context.themeSettings.use_tweenmax) {
            initTweenMaxAsync();
        }
    }
}
