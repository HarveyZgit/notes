/* One accessible, responsive table of contents for all Notes readers. */
(function(){'use strict';
var nav=document.querySelector('.reading-nav'), details=document.querySelector('.reading-toc');if(!nav||!details)return;
var summary=details.querySelector('summary'),mobile=matchMedia('(max-width:900px)'),links=Array.from(details.querySelectorAll('nav a'));
function adapt(){details.open=!mobile.matches;} adapt();
if(mobile.addEventListener)mobile.addEventListener('change',adapt);else mobile.addListener(adapt);
links.forEach(function(a){a.addEventListener('click',function(){if(mobile.matches)details.open=false;var target=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});});
nav.addEventListener('keydown',function(e){if(e.key==='Escape'&&details.open){details.open=false;summary.focus();}});
if(!('IntersectionObserver' in window))return;
var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;links.forEach(function(a){var on=a.hash==='#'+entry.target.id;a.classList.toggle('is-active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-12% 0px -65% 0px'});
document.querySelectorAll('section[id]').forEach(function(s){observer.observe(s);});
})();
