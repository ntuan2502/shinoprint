// ============================================================================
// PAPATHEMES SARAHMARKET CUSTOMIZATION:
// - Using slick carousel for image thumbnails.
// - Using baguetteBox for image lightbox.
// ============================================================================

import 'jquery-zoom';
import 'easyzoom';
import _ from 'lodash';
import 'slick-carousel';
import baguetteBox from 'baguettebox';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainCarousel = $gallery.find('[data-image-gallery-main]');
        this.$navCarousel = $gallery.find('[data-image-gallery-nav]');
        this.$videoPlayer = $gallery.find('[data-video-player]');
        this.$videoPlayerIframe = this.$videoPlayer.find('iframe');

        this.defaultSlideIndex = 0;

        const uid = _.uniqueId();

        if (this.$mainCarousel.attr('id') === '') {
            this.$mainCarousel.attr('id', `imageGalleryMainCarousel${uid}`);
        }

        if (this.$navCarousel.attr('id') === '') {
            this.$navCarousel.attr('id', `imageGalleryNavCarousel${uid}`);
        }
    }

    init() {
        this.bindEvents();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = _.clone(this.currentImage);
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    // Chiara not use - keep or code merging easier only
    selectNewImage(e) {
        e.preventDefault();
        const $target = $(e.currentTarget);
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            $selectedThumb: $target,
        };

        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        const i = this.$mainCarousel.slick('slickCurrentSlide');
        this.$navCarousel
            .find('.slick-slide')
            .removeClass('slick-current')
            .eq(i)
            .addClass('slick-current');
    }

    swapMainImage() {
        try {
            this.$mainCarousel.slick('slickGoTo', this.defaultSlideIndex, true);
        } catch (e) {
            // ignore
        }

        const $slide = this.$mainCarousel.find(`.slick-slide:eq(${this.defaultSlideIndex})`);

        $slide.find('img').attr('src', this.currentImage.mainImageUrl);
        $slide.find('a').attr('href', this.currentImage.zoomImageUrl);
        $slide.find('[data-zoom-image]')
            .trigger('zoom.destroy') // destroy image zoom
            .zoom({ url: this.currentImage.zoomImageUrl, touch: false }); // re-init image zoom

        this.$navCarousel.find(`.productView-imageCarousel-nav-item:eq(${this.defaultSlideIndex})`).removeClass('slick-current');

        // empty lightbox contents of current galley so that it will be created again
        $('#baguetteBox-slider').html('');
        baguetteBox.run(`#${this.$mainCarousel.attr('id')}`); // init again
    }

    // Chiara not use - keep or code merging easier only
    checkImage() {
        const containerHeight = $('.productView-image').height();
        const containerWidth = $('.productView-image').width();
        const height = this.easyzoom.data('easyZoom').$zoom.context.height;
        const width = this.easyzoom.data('easyZoom').$zoom.context.width;
        if (height < containerHeight || width < containerWidth) {
            this.easyzoom.data('easyZoom').hide();
        }
    }

    // Chiara not use - keep or code merging easier only
    setImageZoom() {
        this.easyzoom = this.$mainImage.easyZoom({
            onShow: () => this.checkImage(),
            errorNotice: '',
            loadingNotice: '',
        });
    }

    stopVideo() {
        this.$videoPlayerIframe.attr('src', '');
        this.$videoPlayer.addClass('hide');
    }

    showVideo(src) {
        this.$videoPlayer.removeClass('hide');
        this.$videoPlayerIframe.attr('src', src);
    }

    bindEvents() {
        this.$mainCarousel
            .on('init reInit', () => {
                const $slide = this.$mainCarousel.find(`.slick-slide:eq(${this.defaultSlideIndex})`);
                this.currentImage = {
                    mainImageUrl: $slide.find('img').attr('src'),
                    zoomImageUrl: $slide.find('a').attr('href'),
                    $selectedThumb: null,
                };

                this.$mainCarousel.find('.slick-slide').each((i, slideEl) => {
                    $(slideEl).find('[data-zoom-image]').each((j, zoomEl) => {
                        $(zoomEl).zoom({ url: $(zoomEl).data('zoomImage'), touch: false });
                    });
                });
            })
            .slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                initialSlide: this.defaultSlideIndex,
                asNavFor: `#${this.$navCarousel.attr('id')}`,
                swipe: false,
                arrows: false,
                responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            swipe: true,
                        },
                    },
                ],
            })
            .on('afterChange', () => {
                this.setActiveThumb();
                this.stopVideo();
            });

        setTimeout(() => {
            this.$navCarousel.on('setPosition', () => {
                try {
                    const slick = this.$navCarousel.slick('getSlick');
                    if (slick.options.slidesToShow >= slick.slideCount) {
                        this.$navCarousel.find('.slick-track').css('transform', 'none');
                    }
                } catch (e) {
                    // ignore
                }
            });

            if (this.$navCarousel.data('imageGalleryNavHorizontal')) {
                this.$navCarousel
                    .slick({
                        slidesToShow: parseInt(this.$navCarousel.data('image-gallery-nav-slides'), 10),
                        slidesToScroll: 1,
                        infinite: false,
                        initialSlide: this.defaultSlideIndex,
                        asNavFor: `#${this.$mainCarousel.attr('id')}`,
                        arrows: true,
                        focusOnSelect: true,
                        centerPadding: 0,
                        adaptiveHeight: true,
                        // variableWidth: true,
                        responsive: [
                            {
                                breakpoint: 550,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 4,
                                },
                            },
                            {
                                breakpoint: 800,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 6,
                                },
                            },
                        ],
                    });
            } else {
                this.$navCarousel
                    .slick({
                        slidesToShow: parseInt(this.$navCarousel.data('image-gallery-nav-slides'), 10),
                        slidesToScroll: 1,
                        infinite: false,
                        initialSlide: this.defaultSlideIndex,
                        asNavFor: `#${this.$mainCarousel.attr('id')}`,
                        arrows: true,
                        vertical: true,
                        verticalSwiping: true,
                        focusOnSelect: true,
                        centerPadding: 0,
                        adaptiveHeight: true,
                        responsive: [
                            {
                                breakpoint: 550,
                                settings: {
                                    vertical: false,
                                    verticalSwiping: false,
                                    // slidesToShow: 1,
                                    arrows: false,
                                    slidesToShow: 4,
                                    // variableWidth: true,
                                },
                            },
                        ],
                    });
            }
        }, 200);

        this.$navCarousel.find(`.productView-imageCarousel-nav-item:eq(${this.defaultSlideIndex})`).on('click', () => {
            this.restoreImage();
        });

        baguetteBox.run(`#${this.$mainCarousel.attr('id')}`);

        const onVideoClick = (event) => {
            event.preventDefault();
            this.showVideo($(event.currentTarget).prop('href'));
        };
        this.$mainCarousel.on('click', '[data-video-id]', onVideoClick);
    }
}
