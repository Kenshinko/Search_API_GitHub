class RenderView {
  constructor() {
    this.application = document.getElementById('application');

    this.wrapper = this.createElement('div', 'app_inner');

    this.searchForm = this.createElement('div', 'search-form');
    this.searchInput = this.createElement('input', 'search-form_input', 'text', 'Search...');
    this.searchSuggestions = this.createElement('ul', 'search-form_suggestions');

    this.searchList = this.createElement('div', 'search-list');

    this.searchForm.appendChild(this.searchInput);
    this.searchForm.appendChild(this.searchSuggestions);

    this.wrapper.appendChild(this.searchForm);
    this.wrapper.appendChild(this.searchList);

    this.application.appendChild(this.wrapper);
  }

  createElement(elTag, elClass, elType, elPlaceholder) {
    const element = document.createElement(elTag);
    if(elClass) { element.classList.add(elClass) };
    if(elType) { element.setAttribute('type', elType) };
    if(elPlaceholder) { element.setAttribute('placeholder', elPlaceholder) };

    return element;
  }

  createSuggestionsList(repository) {
    const listItem = this.createElement('li', 'list-item');
    listItem.textContent = `${repository.name}`;
    listItem.setAttribute('data-owner', repository.owner.login);
    listItem.setAttribute('data-stars', repository.stargazers_count);

    this.searchSuggestions.appendChild(listItem);
  }

  clearSuggestionsList() {
    while (this.searchSuggestions.firstChild) {
      this.searchSuggestions.removeChild(this.searchSuggestions.firstChild);
    }
  }

  clearInput() {
    this.searchInput.value = null;
  }

  createRepositoryCard(repository) {
    const card = this.createElement('div', 'repository-card');
    const cardDelBtn = this.createElement('div', 'card-btn');

    const cardName = this.createElement('p', 'card-text');
    const cardOwner = this.createElement('p', 'card-text');
    const cardStars = this.createElement('p', 'card-text');

    cardName.textContent = `Name: ${repository.innerText}`;
    cardOwner.textContent = `Owner: ${repository.dataset.owner}`;
    cardStars.textContent = `Stars: ${repository.dataset.stars}`;

    card.appendChild(cardName);
    card.appendChild(cardOwner);
    card.appendChild(cardStars);
    card.appendChild(cardDelBtn);

    return card;
  }
}

class SearchApplication {
  constructor(render) {
    this.render = render;

    this.render.searchInput.addEventListener('keyup', this.debounce(this.searchRepositories.bind(this), 600));
    this.render.searchSuggestions.addEventListener('click', this.addRepositoryCardInList.bind(this));
    this.render.searchList.addEventListener('click', this.deleteRepositoryCardInList.bind(this));
  }

  async searchRepositories() {
    try {
      const userInpit = this.render.searchInput.value;
      if(userInpit.trim() === '') {
        alert('Request is empty');
        throw new Error('Request is empty');
      }
      
      const res = await fetch(`https://api.github.com/search/repositories?q=${userInpit}&per_page=5`);
      const data = await res.json();
      this.render.clearSuggestionsList();
      data.items.forEach(item => this.render.createSuggestionsList(item));
    } catch (err) {
      throw new Error(err);
    }
  }

  addRepositoryCardInList ({target}) {
    this.render.searchList.appendChild(this.render.createRepositoryCard(target));
    this.render.clearSuggestionsList();
    this.render.clearInput();
  }

  deleteRepositoryCardInList ({target}) {
    if(target.className === 'card-btn') {
      target.parentElement.remove();
    }
  }

  debounce = (fn, debounceTime) => {
    let timeout;
  
    return function () {
      const fnCall = () => { fn.apply(this, arguments) };
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, debounceTime);
    };
  };
}

new SearchApplication(new RenderView());