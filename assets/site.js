(() => {
  'use strict';
  const themeButton = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const updateThemeLabel = () => { const dark = root.dataset.theme === 'dark'; themeButton.textContent = dark ? '밝게' : '어둡게'; themeButton.setAttribute('aria-label', dark ? '밝은 테마로 전환' : '어두운 테마로 전환'); };
  themeButton.hidden = false;
  updateThemeLabel();
  themeButton.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('orca-notes-theme', root.dataset.theme); } catch {} updateThemeLabel(); });
  const printButton = document.querySelector('.print-button');
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());

  const searchDialog = document.querySelector('#search-dialog');
  const menuDialog = document.querySelector('#menu-dialog');
  const searchInput = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const searchStatus = document.querySelector('#search-status');
  const searchTrigger = document.querySelector('[data-search-open]');
  const menuTrigger = document.querySelector('.mobile-menu-trigger');
  const searchEntries = window.ORCA_SEARCH_INDEX || [];
  const openSearch = () => { if(menuDialog.open)menuDialog.close(); if(!searchDialog.open)searchDialog.showModal(); searchInput.focus(); searchInput.select(); };
  if (typeof searchDialog.showModal === 'function') {
    searchTrigger.hidden = false;
    menuTrigger.hidden = false;
    searchTrigger.addEventListener('click', openSearch);
    menuTrigger.addEventListener('click', () => menuDialog.showModal());
    document.addEventListener('keydown', event => {
      if(event.key==='Escape' && (searchDialog.open || menuDialog.open)){
        event.preventDefault();
        if(searchDialog.open)searchDialog.close();
        if(menuDialog.open)menuDialog.close();
        return;
      }
      if((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}
    });
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {const box=dialog.getBoundingClientRect();if(event.target===dialog && (event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom))dialog.close();});
    dialog.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>dialog.close()));
  });

  const highlighted = (element, text, term) => {
    const match = text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
    if(match<0){element.textContent=text;return;}
    element.append(document.createTextNode(text.slice(0,match)));
    const mark=document.createElement('mark');mark.textContent=text.slice(match,match+term.length);element.append(mark,document.createTextNode(text.slice(match+term.length)));
  };
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    results.replaceChildren();
    if(!query){searchStatus.textContent='제목과 본문에서 검색합니다.';return;}
    const terms=query.split(/\s+/).filter(Boolean);
    const matches=searchEntries.map(entry=>{
      const haystack=`${entry.page} ${entry.title} ${entry.text} ${entry.intro}`.toLocaleLowerCase();
      return {...entry,match:terms.every(term=>haystack.includes(term)),score:terms.reduce((score,term)=>score+(entry.title.toLocaleLowerCase().includes(term)?5:0)+(entry.page.toLocaleLowerCase().includes(term)?1:0),0)};
    }).filter(entry=>entry.match).sort((a,b)=>b.score-a.score);
    searchStatus.textContent=matches.length?`${matches.length}개 항목을 찾았습니다.${matches.length>12?' 상위 12개를 표시합니다.':''}`:'검색 결과가 없습니다. 다른 단어로 검색해 보세요.';
    matches.slice(0,12).forEach(entry=>{
      const item=document.createElement('li');const link=document.createElement('a');link.href=entry.url;
      const page=document.createElement('span');page.className='search-page';page.textContent=entry.page;
      const title=document.createElement('span');title.className='search-title';highlighted(title,entry.title,terms[0]);
      const excerpt=document.createElement('span');excerpt.className='search-excerpt';
      const text=entry.text||entry.intro;const position=text.toLocaleLowerCase().indexOf(terms[0]);const start=Math.max(0,position-35);const end=Math.min(text.length,start+145);
      highlighted(excerpt,`${start?'…':''}${text.slice(start,end)}${end<text.length?'…':''}`,terms[0]);
      link.append(page,title,excerpt);link.addEventListener('click',()=>searchDialog.close());item.append(link);results.append(item);
    });
  });

  document.querySelectorAll('pre').forEach(pre=>{
    const code=pre.querySelector('code');if(!code)return;
    const button=document.createElement('button');button.type='button';button.className='copy-code';button.textContent='복사';button.setAttribute('aria-label','코드 복사');pre.append(button);
    button.addEventListener('click',async()=>{
      try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(code.textContent);button.textContent='복사됨';button.setAttribute('aria-label','코드 복사 완료');}
      catch{button.textContent='직접 선택해 복사';const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);}
      setTimeout(()=>{button.textContent='복사';button.setAttribute('aria-label','코드 복사');},2200);
    });
  });

  const tocLinks=[...document.querySelectorAll('.page-toc .toc-list a')];
  const headings=[...document.querySelectorAll('.article-content h2[id],.article-content h3[id]')];
  const revealHashTarget=()=>{
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target)return;
    let parent=target.parentElement;
    while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
  };
  window.addEventListener('hashchange',revealHashTarget);
  revealHashTarget();
  let scheduled=false;
  const updateCurrent=()=>{
    let current=headings[0]?.id;
    for(const heading of headings){if(!heading.getClientRects().length)continue;if(heading.getBoundingClientRect().top<=140)current=heading.id;else break;}
    tocLinks.forEach(link=>{const selected=link.getAttribute('href')===`#${current}`;link.classList.toggle('is-current',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    scheduled=false;
  };
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateCurrent);}},{passive:true});
  updateCurrent();

  let closedBeforePrint=[];
  window.addEventListener('beforeprint',()=>{closedBeforePrint=[...document.querySelectorAll('article details:not(.speaker-notes):not([open])')];closedBeforePrint.forEach(detail=>detail.open=true);});
  window.addEventListener('afterprint',()=>{closedBeforePrint.forEach(detail=>detail.open=false);closedBeforePrint=[];});
})();
