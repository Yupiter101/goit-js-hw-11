console.log('Hello HW-11');
// console.log('Autoscroll from second page');

import axios from "axios";
const throttle = require('lodash.throttle');
import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

// Notify.success('Sol lucet omnibus');
// Notify.failure('Qui timide rogat docet negare');
// Notify.warning('Memento te hominem esse');
// Notify.info('Cogito ergo sum');

// ==== API - параметры запроса =====

const baseUrl = 'https://pixabay.com/api';
const apiParams = {
    key: '35699371-14988f634d8c564e890125df4',
    q: '',                        // search 
    image_type: 'photo',
    page: 1,                      // current page default
    per_page: 16,                  // item on page default
    orientation: 'horizontal',
    safesearch: true,
}
// ==== / API - параметры запроса =====



// служебные
let maxPages = 1;
let firstSubmitFlag = true;
let autoLoadFlag = false;
// /служебные



// ==== GET Refs HTML =======
const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
// ==== / GET Refs HTML =======



// ======= Submit ======= 

formEl.addEventListener('submit', onSubmit);

function onSubmit(event) {
    event.preventDefault();
    apiParams.page = 1;
    apiParams.q = event.currentTarget.elements.searchQuery.value.trim().replaceAll(' ', '+');
    
    if(!apiParams.q) {
        console.log('Field is empty. Please try again');
        Notify.warning('Field is empty. Please try again');
        return
    }
    galleryEl.innerHTML = '';
    loadMoreBtn.classList.add('is-hidden'); // Спрятать кнопку "Load more"
    console.log(apiParams.q);
    getApiServer(apiParams.q, apiParams.page);

    if(loadMoreBtn.disabled) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load more';
    }
    
    firstSubmitFlag = true;
    autoLoadFlag = false;
}
// ===== / Submit ======= 





// ===== fetch ApiServer V3 axios =======

async function getApiServer(searchName, page) {
    apiParams.q = searchName;
    apiParams.page = page;
    const searchParams = new URLSearchParams(apiParams);
    const Url = baseUrl + '/?' + searchParams.toString();

    // let Url = `https://pixabay.com/api/?key=${MY_API_KEY}&q=${searchName}&image_type=photo&page=${page}&per_page=${perPage}&orientation=horizontal&safesearch=true`;
    try {
        const {data} = await axios.get(Url);

        if(!data.hits.length) {
            console.log("Sorry, there are no images matching your search query. Please try again.");
            Notify.warning('orry, there are no images matching your search query. Please try again.');
            return
        }
        maxPages = Math.ceil(data.totalHits / apiParams.per_page);
        // console.log('maxPages = ', maxPages);
        makeGalery(data.hits);

        if(firstSubmitFlag) {
            firstSubmitFlag = false;
            console.log(`Hooray! We found ${data.totalHits} images.`);
            console.log('Autoscroll from second page');
            Notify.success(`Hooray! We found ${data.totalHits} images.`);
            Notify.info('Autoscroll from second page');
        }
        
    }
    catch(error) {
        console.log(error);
        console.log(error.message);
    }
}
// ==== / fetch ApiServer =======





// ====== Render HTML ====== 

function makeGalery(items) {
    const markap = items.map(item => {
        return `
        <div class="gallery__item">
            <a href="${item.largeImageURL}" class="gallery__link">
                <img src="${item.webformatURL}" class="gallery__image" alt="${item.tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes ${item.likes}</b>
                </p>
                <p class="info-item">
                    <b>Views ${item.views}</b>
                </p>
                <p class="info-item">
                    <b>Comments ${item.comments}</b>
                </p>
                <p class="info-item">
                    <b>Downloads ${item.downloads}</b>
                </p>
            </div>
        </div>
        `
    }).join('');

    galleryEl.insertAdjacentHTML("beforeend", markap);
    setTimeout( onShowLoadMoreBtn, 500); // setTimeout появление кнопки
    // console.log('page: ', apiParams.page);

    //  === simplelightbox === 
        lightbox.refresh(); // Next Image
        lightbox.on('changed.simplelightbox', function () {
            console.log('листай ще');
        });
    //  === simplelightbox === 
}
// ===== / Render HTML ======




//  === simplelightbox ===
const options = {
    captionsData: "alt",
    captionDelay: 250,
};
const lightbox = new SimpleLightbox('.gallery a', options);
//  === / simplelightbox ===




// ===== Load More ======

loadMoreBtn.addEventListener('click', onLoadMore );

function onLoadMore() {
    apiParams.page +=1;
    getApiServer(apiParams.q, apiParams.page);
    autoLoadFlag = true;
    // console.log('Autoscroll is ON');
}


function onShowLoadMoreBtn() {
    loadMoreBtn.classList.remove('is-hidden'); //появление кнопки
    if(apiParams.page >= maxPages) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'The end';
        console.log("We're sorry, but you've reached the end of search results.");
        Notify.warning("We're sorry, but you've reached the end of search results.");
    }
}
// ==== / Load More ======


// ====== SCROLL ====== 

// console.log('rere');

let currentScroll = window.scrollY; 
    
window.addEventListener('scroll', throttle(onScroll, 500));

let flag = 0;
function onScroll() {
            
    const viewportHeight = window.innerHeight;      // Высота экрана
    let pageHeight = document.documentElement.scrollHeight;
    const availableScroll = pageHeight - viewportHeight; // Доступный скролл
    currentScroll = scrollY;           // Текущее положение прокрутки     
    const eventScroll = availableScroll - viewportHeight / 2; //Точка вызова события
            
    if(currentScroll > eventScroll) {
        if(flag || !autoLoadFlag) {
            return
        }
        else {
            flag = 1;
            console.log('Loaded page: ', apiParams.page);
            onLoadMore();
            // document.body.style.backgroundColor = 'red';
        }
                
    }

    else {
        if(flag) {
            flag = 0;
        }
    }
    
    // console.log('viewportHeight', viewportHeight);
    // console.log('pageHeight', pageHeight);
    // console.log('availableScroll', availableScroll);
    // console.log('currentScroll', currentScroll);
    // console.log('eventScroll', eventScroll);
    // console.log('scroll');
    
}

