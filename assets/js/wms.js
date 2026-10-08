document.addEventListener('DOMContentLoaded',function(){
  const menu=document.getElementById('siMenu');
  const sidebar=document.getElementById('siSidebar');
  if(menu && sidebar){
    menu.addEventListener('click',function(){sidebar.classList.toggle('is-open');});
    document.addEventListener('click',function(e){
      if(window.innerWidth<=720 && sidebar.classList.contains('is-open') && !sidebar.contains(e.target) && !menu.contains(e.target)){
        sidebar.classList.remove('is-open');
      }
    });
  }
});