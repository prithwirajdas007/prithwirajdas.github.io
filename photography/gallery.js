// Photography gallery: renders the masonry grid from photos.json and wires up
// PhotoSwipe.
import PhotoSwipeLightbox from './vendor/photoswipe/photoswipe-lightbox.esm.min.js';

// Point this somewhere else and the images can move to object storage without
// touching anything below it.
const IMG_BASE = 'img/';

const THUMB_WIDTH = 900;
const EAGER_COUNT = 4;

const grid = document.getElementById('grid');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function thumbSrc(slug) { return IMG_BASE + 'thumb/' + slug + '.webp'; }
function fullSrc(slug) { return IMG_BASE + 'full/' + slug + '.webp'; }

function message(text) {
    const p = document.createElement('p');
    p.className = 'grid-message';
    p.textContent = text;
    grid.replaceWith(p);
}

function render(photos) {
    const fragment = document.createDocumentFragment();

    photos.forEach(function (photo, index) {
        // The thumb is capped at 900px and never upscaled, so a narrow source
        // stays at its own width. Height follows from the full image's ratio.
        const width = Math.min(THUMB_WIDTH, photo.w);
        const height = Math.round((photo.h / photo.w) * width);

        const img = document.createElement('img');
        img.src = thumbSrc(photo.slug);
        img.alt = photo.alt;
        img.width = width;
        img.height = height;
        img.decoding = 'async';
        if (index < EAGER_COUNT) {
            img.loading = 'eager';
            img.setAttribute('fetchpriority', 'high');
        } else {
            img.loading = 'lazy';
        }

        // A real link to the full image, so a PhotoSwipe failure degrades to
        // opening the photo directly.
        const link = document.createElement('a');
        link.href = fullSrc(photo.slug);
        link.setAttribute('data-pswp-width', photo.w);
        link.setAttribute('data-pswp-height', photo.h);
        if (photo.caption) link.setAttribute('data-pswp-caption', photo.caption);
        link.appendChild(img);

        const figure = document.createElement('figure');
        figure.className = 'photo';
        figure.appendChild(link);

        if (photo.caption) {
            const caption = document.createElement('figcaption');
            caption.textContent = photo.caption;
            figure.appendChild(caption);
        }

        fragment.appendChild(figure);
    });

    grid.appendChild(fragment);
}

function initLightbox() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#grid',
        children: 'a',
        pswpModule: function () { return import('./vendor/photoswipe/photoswipe.esm.min.js'); },
        showAnimationDuration: reduceMotion ? 0 : 333,
        hideAnimationDuration: reduceMotion ? 0 : 333,
        zoomAnimationDuration: reduceMotion ? 0 : 333
    });

    // PhotoSwipe v5 ships no caption UI, so add one that reads the anchor.
    lightbox.on('uiRegister', function () {
        lightbox.pswp.ui.registerElement({
            name: 'caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: '',
            onInit: function (el, pswp) {
                el.setAttribute('class', 'pswp__custom-caption');
                pswp.on('change', function () {
                    const anchor = pswp.currSlide.data.element;
                    const text = anchor ? anchor.getAttribute('data-pswp-caption') : null;
                    el.textContent = text || '';
                    el.style.display = text ? '' : 'none';
                });
            }
        });
    });

    lightbox.init();
}

fetch('photos.json', { cache: 'no-cache' })
    .then(function (response) {
        if (!response.ok) throw new Error('photos.json returned ' + response.status);
        return response.json();
    })
    .then(function (photos) {
        if (!Array.isArray(photos) || photos.length === 0) {
            message('No photos yet.');
            return;
        }
        render(photos);
        initLightbox();
    })
    .catch(function (err) {
        console.error('Gallery failed to load:', err);
        message('The gallery could not be loaded.');
    });
