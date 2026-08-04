import{n as e}from"./rolldown-runtime-aKtaBQYM.js";var t=e({default:()=>m,deleteRequest:()=>p,get:()=>l,httpRequest:()=>c,patch:()=>f,post:()=>u,put:()=>d}),n=`http://localhost:3000/api`,r=`http://localhost:3000/api`,i=1e4,a=e=>e.startsWith(`/auth`)?r:n,o=(e=`Tu sesión ha expirado. Por favor inicia sesión de nuevo.`)=>{if(localStorage.removeItem(`session_user`),sessionStorage.removeItem(`session_user`),!window.location.pathname.includes(`/login`)){if(!document.getElementById(`__session_expired_toast__`)){let t=document.createElement(`div`);t.id=`__session_expired_toast__`,t.innerHTML=`
      <div style="
        position:fixed; top:20px; right:20px; z-index:99999;
        background:#fff; border-left:6px solid #ef4444;
        border-radius:14px; padding:16px 20px 20px;
        box-shadow:0 10px 25px rgba(0,0,0,0.13);
        width:320px; font-family:Arial,sans-serif;
        animation: __slideIn__ .3s ease forwards;
      ">
        <strong style="color:#111; font-size:14px;">⚠ Sesión finalizada</strong>
        <p style="margin:6px 0 0; font-size:13px; color:#555; line-height:1.5;">${e}</p>
        <div style="
          position:absolute; bottom:0; left:0; height:4px; width:100%;
          background:#ef4444; border-radius:0 0 14px 14px;
          animation: __shrink__ 3s linear forwards;
        "></div>
      </div>
      <style>
        @keyframes __slideIn__ { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes __shrink__  { from{width:100%} to{width:0%} }
      </style>
    `,document.body.appendChild(t)}setTimeout(()=>{window.location.href=`/login`},3e3)}},s=()=>{try{let e=localStorage.getItem(`session_user`)||sessionStorage.getItem(`session_user`);if(e)return JSON.parse(e).token||null}catch(e){console.error(`Error getting auth token:`,e)}return null},c=async(e,t={})=>{let{method:n=`GET`,body:r=null,headers:c={},skipAuth:l=!1,suppressAutoLogout:u=!1,...d}=t,f=`${a(e)}${e}`,p={"Content-Type":`application/json`,...c};if(!l){let e=s();e&&(p.Authorization=`Bearer ${e}`)}let m={method:n,headers:p,timeout:i,...d};r&&(m.body=typeof r==`string`?r:JSON.stringify(r));try{let e=await fetch(f,m);if(!e.ok){let t=await e.json().catch(()=>({})),n=t.message||`HTTP Error ${e.status}`;if(Array.isArray(t.errors)&&t.errors.length>0){let e=t.errors.map(e=>`• ${e?.field?String(e.field).replace(/^\./,``):`datos`}: ${e?.message||`valor inválido`}`).join(`
`);n=`${n}\n${e}`}let r=Error(n);throw r.status=e.status,r.data=t,e.status===401&&!u&&o(),r}return e.status===204?null:e.headers.get(`content-type`)?.includes(`application/json`)?await e.json():await e.text()}catch(e){throw(!e.status||e.status>=500)&&console.error(`Error in HTTP request to ${f}:`,e),e}},l=(e,t={})=>c(e,{...t,method:`GET`}),u=(e,t,n={})=>c(e,{...n,method:`POST`,body:t}),d=(e,t,n={})=>c(e,{...n,method:`PUT`,body:t}),f=(e,t,n={})=>c(e,{...n,method:`PATCH`,body:t}),p=(e,t={})=>c(e,{...t,method:`DELETE`}),m={get:l,post:u,put:d,patch:f,delete:p,httpRequest:c};export{c as a,t as i,l as n,u as o,m as r,d as s,p as t};