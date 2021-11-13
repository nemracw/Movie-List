const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderMovieList(data) { 
  //用data不用movies, 因為唔想把function困死一段資料上，function要盡量單純
  let rawHTML = ''

  data.forEach((item) => {
    // title, image (需要動態產生)
    // use dataset 去把data id縛定在btn裡
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"  data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //  Math.ceil = 遇小數點無條件進位
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page ++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

// onPanelClicked是此function的名字，方便有error時追查問題位置
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // dataset內文都是string, 要轉成number
    showMovieModal( Number(event.target.dataset.id)) 
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return // 'A' = <a>
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


function addToFavorite(id) {
  //取目前在 local storage 的資料，放進, 變數 list (收藏清單)內
  //OR (|| ) ，它會判斷左右兩邊的式子是 true 還是 false ，然後回傳是 true 的那個邊。如果兩邊都是 true ，以左邊為優先。
  //第一次使用收藏功能時，此時 local storage 是空的，會取回 null 值，因此，list 會得到一個空陣列。而之後 local storage 有東西時，就會拿到
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  //find: 在找到第一個符合條件的 item 後就回停下來回傳該 item。
  const movie = movies.find((movie) => movie.id === id)

  //some: 回報「陣列裡 有沒有 item 通過檢查條件」，有的話回傳 true ，沒有就回傳 false。
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
};

//作用，按 page 1 就會顯示該頁內容，如此類推
function getMoviesByPage(page) {
  
  //如果有 filterMovies 就給我 filterMovies ，沒有就給 movies
  const data = filteredMovies.length ? filteredMovies : movies
  //page 1 -> 0 - 11
  //page 2 -> 12 - 23
  //page 3 -> 24 - 35
  //...
  const startIndex = (page - 1) * MOVIES_PER_PAGE // 計出總頁數
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  modalImage.innerHTML = ''
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
};



//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault() 
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  //條件篩選
  //方法一：
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  // //方法二：
  // filteredMovies = movies.filter((movie) => {
  //   return movie.title.toLowerCase().includes(keyword)
  // })

  // 方法二（精簡版）：
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})




axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)//... = 展開運算子
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err));

