// Shared navigation for case studies and the standalone workbench.
(() => {
  const toggle=document.getElementById('navToggle');
  const nav=document.getElementById('navLinks');
  if(!toggle||!nav)return;
  const close=()=>{
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open menu');
  };
  toggle.addEventListener('click',()=>{
    const isOpen=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(isOpen));
    toggle.setAttribute('aria-label',isOpen?'Close menu':'Open menu');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&nav.classList.contains('open')){close();toggle.focus();}
  });
  document.addEventListener('pointerdown',event=>{
    if(!nav.contains(event.target)&&!toggle.contains(event.target))close();
  });
})();
