import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

let page = 1;
let keyInput = '';
let totalPages = 0;

const BASE_URL = 'https://pixabay.com/api';
const KEY = '33027161-d89bfd7878d1ab614bd7e969e';

const searchForm = document.querySelector('#search-form');
const inputItem = document.querySelector('input[name="searchQuery"]');
const galleryItem = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

searchForm.addEventListener('submit', onSubmit);

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onInfinityLoad, options);

function onSubmit(event) {
  event.preventDefault();
  keyInput = inputItem.value;
  galleryItem.innerHTML = '';

  page = 1;

  if (!keyInput.trim()) {
    Notify.info('Oops! Please, enter smth to search.');

    return;
  }
  getImg(keyInput);

  event.currentTarget.reset();
}

function onInfinityLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      getImg(keyInput).then(data => {
        getImg(data);

        if (page === totalPages) {
          observer.unobserve(guard);
          Notify.success(
            `We're sorry, but you've reached the end of search results.`
          );
        }
      });
    }
  });
}

async function getImg(keyWord) {
  try {
    const response = await axios.get(
      `${BASE_URL}/?key=${KEY}&q=${keyWord}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );
    totalPages = Math.ceil(response.data.totalHits / response.data.per_page);
    createGallery(response.data.hits);
    observer.observe(guard);
    page += 1;
    if (!response.data.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (page === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }

    if (page > totalPages) {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

function createGallery(images) {
  const markup = images
    .map(image => {
      return `<div class="photo-card">
      <a href="${image.largeImageURL}">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
      <p class="info-item"><b>Likes</b>${image.likes}</p>
      <p class="info-item"><b>Views</b>${image.views}</p>
      <p class="info-item"><b>Comments</b>${image.comments}</p>
      <p class="info-item"><b>Downloads</b>${image.downloads}</p>
      </div>
      </div>`;
    })
    .join('');
  galleryItem.insertAdjacentHTML('beforeend', markup);
  if (page > 1) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

const gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionsDelay: 250,
  scrollZoom: false,
  scrollZoomFactor: 0,
});
