// Losing focus inside an embedded browser is not the same as leaving the page.
// Release held input on blur; only actual backgrounding opens the pause screen.
export function bindGameLifecycle(win,doc,{clearInput=()=>{},pause}){
 const blur=()=>clearInput('blur');
 const hidden=()=>{if(doc.hidden){clearInput('hidden');pause(true);}};
 const leave=()=>{clearInput('pagehide');pause(true);};
 win.addEventListener('blur',blur);doc.addEventListener('visibilitychange',hidden);win.addEventListener('pagehide',leave);
 return()=>{win.removeEventListener('blur',blur);doc.removeEventListener('visibilitychange',hidden);win.removeEventListener('pagehide',leave);};
}
